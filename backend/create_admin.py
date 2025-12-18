"""Create initial admin user"""
from app.database.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Admin user already exists!")
            return
        
        # Create admin user
        admin = User(
            username="admin",
            email="admin@benzy.com",
            full_name="System Administrator",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            role="admin"
        )
        db.add(admin)
        db.commit()
        print("✓ Admin user created successfully!")
        print("  Username: admin")
        print("  Password: admin123")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
