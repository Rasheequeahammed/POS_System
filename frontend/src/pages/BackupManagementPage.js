import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudDownload as DownloadIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  SaveAlt as BackupIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  fetchBackups,
  fetchBackupStats,
  createBackup,
  restoreBackup,
  deleteBackup,
  downloadBackup,
  clearError,
} from '../redux/slices/backupsSlice';

const BackupManagementPage = () => {
  const dispatch = useDispatch();
  const { backups, stats, loading, error } = useSelector((state) => state.backups);
  const currentUser = useSelector((state) => state.auth.user);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [backupDescription, setBackupDescription] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(null);

  useEffect(() => {
    if (currentUser?.role?.toUpperCase() === 'ADMIN') {
      dispatch(fetchBackups());
      dispatch(fetchBackupStats());
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleCreateBackup = async () => {
    await dispatch(createBackup({ 
      description: backupDescription,
      backup_type: 'manual'
    }));
    setOpenCreateDialog(false);
    setBackupDescription('');
    dispatch(fetchBackups());
    dispatch(fetchBackupStats());
  };

  const handleRestoreBackup = async (backupId) => {
    if (window.confirm('⚠️ WARNING: Restoring will overwrite the current database. This action cannot be undone. Are you absolutely sure?')) {
      await dispatch(restoreBackup(backupId));
      setConfirmRestore(null);
      alert('Database restored successfully! Please refresh the page.');
      window.location.reload();
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      await dispatch(deleteBackup(backupId));
      dispatch(fetchBackups());
      dispatch(fetchBackupStats());
    }
  };

  const handleDownloadBackup = (backupId) => {
    dispatch(downloadBackup(backupId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (currentUser?.role?.toUpperCase() !== 'ADMIN') {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Only administrators can access backup management.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Backup & Restore
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              dispatch(fetchBackups());
              dispatch(fetchBackupStats());
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Create Backup
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      Total Backups
                    </Typography>
                    <Typography variant="h4">{stats.total_backups}</Typography>
                  </Box>
                  <StorageIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      Total Size
                    </Typography>
                    <Typography variant="h4">{formatFileSize(stats.total_size)}</Typography>
                  </Box>
                  <BackupIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Last Backup
                  </Typography>
                  <Typography variant="h6">
                    {stats.last_backup 
                      ? new Date(stats.last_backup).toLocaleString()
                      : 'Never'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Oldest Backup
                  </Typography>
                  <Typography variant="h6">
                    {stats.oldest_backup 
                      ? new Date(stats.oldest_backup).toLocaleString()
                      : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Backups Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Filename</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No backups found. Create your first backup to get started!
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {backup.filename}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatFileSize(backup.file_size)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={backup.backup_type} 
                        size="small" 
                        color={backup.backup_type === 'scheduled' ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{backup.description || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={backup.status}
                        color={getStatusColor(backup.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(backup.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {backup.status === 'completed' && (
                        <>
                          <Tooltip title="Download Backup">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleDownloadBackup(backup.id)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Restore Database">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleRestoreBackup(backup.id)}
                            >
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Delete Backup">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteBackup(backup.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Create Backup Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Backup</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Creating a backup will export the entire database. This process may take a few minutes depending on the database size.
            </Alert>
            <TextField
              label="Description (optional)"
              value={backupDescription}
              onChange={(e) => setBackupDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Monthly backup before major update"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateBackup}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <BackupIcon />}
          >
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BackupManagementPage;
