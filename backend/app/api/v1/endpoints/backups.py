from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.database.session import get_db
from app.models.backup import Backup
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
import subprocess
import os
from pathlib import Path

router = APIRouter()

# Configuration
# Use relative path from backend directory for local development
BACKUP_DIR = Path(__file__).parent.parent.parent.parent / "backups"
BACKUP_DIR.mkdir(exist_ok=True, parents=True)

# Pydantic schemas
class BackupCreate(BaseModel):
    description: Optional[str] = None
    backup_type: str = "manual"

class BackupResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    backup_type: str
    description: Optional[str]
    created_by: Optional[int]
    created_at: datetime
    status: str
    error_message: Optional[str]

    class Config:
        from_attributes = True

class BackupStats(BaseModel):
    total_backups: int
    total_size: int
    last_backup: Optional[datetime]
    oldest_backup: Optional[datetime]

def format_file_size(size_bytes: int) -> str:
    """Convert bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

async def create_database_backup(backup_id: int, description: str, user_id: int, db: Session):
    """Background task to create database backup"""
    try:
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{timestamp}.sql"
        file_path = BACKUP_DIR / filename
        
        # Get database credentials from environment
        db_host = os.getenv("POSTGRES_SERVER", "db")
        db_name = os.getenv("POSTGRES_DB", "benzy_pos")
        db_user = os.getenv("POSTGRES_USER", "postgres")
        db_password = os.getenv("POSTGRES_PASSWORD", "postgres")
        
        # Create backup using pg_dump
        env = os.environ.copy()
        env["PGPASSWORD"] = db_password
        
        command = [
            "pg_dump",
            "-h", db_host,
            "-U", db_user,
            "-d", db_name,
            "-F", "p",  # Plain text format
            "-f", str(file_path)
        ]
        
        result = subprocess.run(
            command,
            env=env,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode != 0:
            raise Exception(f"Backup failed: {result.stderr}")
        
        # Get file size
        file_size = file_path.stat().st_size
        
        # Update backup record
        backup = db.query(Backup).filter(Backup.id == backup_id).first()
        if backup:
            backup.filename = filename
            backup.file_path = str(file_path)
            backup.file_size = file_size
            backup.status = "completed"
            db.commit()
            
    except Exception as e:
        # Update backup record with error
        backup = db.query(Backup).filter(Backup.id == backup_id).first()
        if backup:
            backup.status = "failed"
            backup.error_message = str(e)
            db.commit()

@router.get("/", response_model=List[BackupResponse])
def get_backups(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all backups"""
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can view backups")
    
    backups = db.query(Backup).order_by(desc(Backup.created_at)).offset(skip).limit(limit).all()
    return backups

@router.post("/", response_model=BackupResponse)
async def create_backup(
    backup: BackupCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new database backup"""
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can create backups")
    
    # Create backup record
    db_backup = Backup(
        filename="",  # Will be set by background task
        file_path="",
        file_size=0,
        backup_type=backup.backup_type,
        description=backup.description,
        created_by=current_user.id,
        status="in_progress"
    )
    
    db.add(db_backup)
    db.commit()
    db.refresh(db_backup)
    
    # Start backup in background
    background_tasks.add_task(
        create_database_backup,
        db_backup.id,
        backup.description or "",
        current_user.id,
        db
    )
    
    return db_backup

@router.post("/{backup_id}/restore")
async def restore_backup(
    backup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Restore database from backup"""
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can restore backups")
    
    backup = db.query(Backup).filter(Backup.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    if backup.status != "completed":
        raise HTTPException(status_code=400, detail="Cannot restore from incomplete backup")
    
    file_path = Path(backup.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Backup file not found")
    
    try:
        # Get database credentials
        db_host = os.getenv("POSTGRES_SERVER", "db")
        db_name = os.getenv("POSTGRES_DB", "benzy_pos")
        db_user = os.getenv("POSTGRES_USER", "postgres")
        db_password = os.getenv("POSTGRES_PASSWORD", "postgres")
        
        env = os.environ.copy()
        env["PGPASSWORD"] = db_password
        
        # Restore using psql
        command = [
            "psql",
            "-h", db_host,
            "-U", db_user,
            "-d", db_name,
            "-f", str(file_path)
        ]
        
        result = subprocess.run(
            command,
            env=env,
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout
        )
        
        if result.returncode != 0:
            raise Exception(f"Restore failed: {result.stderr}")
        
        return {
            "message": "Database restored successfully",
            "backup_id": backup_id,
            "filename": backup.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

@router.delete("/{backup_id}")
def delete_backup(
    backup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a backup"""
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can delete backups")
    
    backup = db.query(Backup).filter(Backup.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    # Delete file if exists
    file_path = Path(backup.file_path)
    if file_path.exists():
        file_path.unlink()
    
    # Delete record
    db.delete(backup)
    db.commit()
    
    return {"message": "Backup deleted successfully"}

@router.get("/stats", response_model=BackupStats)
def get_backup_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get backup statistics"""
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can view backup stats")
    
    backups = db.query(Backup).filter(Backup.status == "completed").all()
    
    total_size = sum(b.file_size for b in backups)
    last_backup = max([b.created_at for b in backups]) if backups else None
    oldest_backup = min([b.created_at for b in backups]) if backups else None
    
    return {
        "total_backups": len(backups),
        "total_size": total_size,
        "last_backup": last_backup,
        "oldest_backup": oldest_backup
    }

@router.get("/{backup_id}/download")
async def download_backup(
    backup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download a backup file"""
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can download backups")
    
    backup = db.query(Backup).filter(Backup.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    file_path = Path(backup.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Backup file not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=str(file_path),
        filename=backup.filename,
        media_type="application/sql"
    )
