import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  createUser,
  updateUser,
  resetUserPassword,
  fetchUsers,
} from '../redux/slices/userManagementSlice';

const UserFormModal = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state) => state.userManagement);
  const currentUser = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'CASHIER',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        password: '',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        full_name: '',
        role: 'CASHIER',
        password: '',
      });
    }
    setFormError('');
  }, [user, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setFormError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    if (!formData.full_name.trim()) {
      setFormError('Full name is required');
      return false;
    }
    if (!user && !formData.password.trim()) {
      setFormError('Password is required for new users');
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (user) {
        // Update existing user
        const updateData = {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
        };
        await dispatch(updateUser({ userId: user.id, userData: updateData })).unwrap();

        // If password is provided, reset it
        if (formData.password) {
          await dispatch(
            resetUserPassword({ userId: user.id, newPassword: formData.password })
          ).unwrap();
        }
      } else {
        // Create new user
        await dispatch(createUser(formData)).unwrap();
      }
      
      dispatch(fetchUsers());
      onClose();
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    }
  };

  const getAvailableRoles = () => {
    if (currentUser?.role === 'ADMIN') {
      return roles;
    }
    if (currentUser?.role === 'MANAGER') {
      return roles.filter((role) => role.value === 'CASHIER');
    }
    return [];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            required
            disabled={!!user} // Username cannot be changed
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            required
          >
            {getAvailableRoles().map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label} - {role.description}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={user ? 'New Password (leave blank to keep current)' : 'Password'}
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required={!user}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText={
              user
                ? 'Leave blank to keep current password'
                : 'Minimum 6 characters'
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {user ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
