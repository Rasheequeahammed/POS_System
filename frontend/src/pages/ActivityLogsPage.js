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
  Box,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button,
  Chip,
  TablePagination,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
  fetchActivityLogs,
  fetchUsers,
  clearError,
} from '../redux/slices/userManagementSlice';

const ActivityLogsPage = () => {
  const dispatch = useDispatch();
  const { activityLogs, users, loading, error } = useSelector(
    (state) => state.userManagement
  );

  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: null,
    endDate: null,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    dispatch(fetchUsers());
    loadActivityLogs();
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const loadActivityLogs = () => {
    const params = {
      skip: page * rowsPerPage,
      limit: rowsPerPage,
      userId: filters.userId || null,
      action: filters.action || null,
      startDate: filters.startDate
        ? filters.startDate.toISOString().split('T')[0]
        : null,
      endDate: filters.endDate
        ? filters.endDate.toISOString().split('T')[0]
        : null,
    };
    dispatch(fetchActivityLogs(params));
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const handleApplyFilters = () => {
    setPage(0);
    loadActivityLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      startDate: null,
      endDate: null,
    });
    setPage(0);
    dispatch(
      fetchActivityLogs({
        skip: 0,
        limit: rowsPerPage,
      })
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getActionColor = (action) => {
    if (action.includes('create')) return 'success';
    if (action.includes('update') || action.includes('edit')) return 'info';
    if (action.includes('delete') || action.includes('deactivate')) return 'error';
    if (action.includes('reset')) return 'warning';
    return 'default';
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.username} (${user.full_name})` : `User ID: ${userId}`;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Activity Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View all user activities and audit trail
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              select
              label="User"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Users</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username} - {user.full_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="create">Create</MenuItem>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
              <MenuItem value="reset_password">Reset Password</MenuItem>
            </TextField>

            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              slotProps={{
                textField: { size: 'small', sx: { minWidth: 150 } },
              }}
            />

            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              slotProps={{
                textField: { size: 'small', sx: { minWidth: 150 } },
              }}
            />

            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              Apply
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadActivityLogs}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </LocalizationProvider>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activityLogs.logs && activityLogs.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  activityLogs.logs &&
                  activityLogs.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{getUserName(log.user_id)}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          color={getActionColor(log.action)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.entity_type || '-'}</TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>{log.ip_address || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={activityLogs.total || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[25, 50, 100]}
            />
          </>
        )}
      </TableContainer>
    </Container>
  );
};

export default ActivityLogsPage;
