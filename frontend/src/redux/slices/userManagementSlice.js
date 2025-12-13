import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async ({ skip = 0, limit = 100 } = {}) => {
    const response = await api.get(`/users?skip=${skip}&limit=${limit}`);
    return response.data;
  }
);

export const createUser = createAsyncThunk(
  'userManagement/createUser',
  async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ userId, userData }) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId) => {
    await api.delete(`/users/${userId}`);
    return userId;
  }
);

export const fetchUserPerformance = createAsyncThunk(
  'userManagement/fetchUserPerformance',
  async ({ startDate = null, endDate = null } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/users/stats/performance?${params}`);
    return response.data;
  }
);

export const fetchActivityLogs = createAsyncThunk(
  'userManagement/fetchActivityLogs',
  async ({ skip = 0, limit = 50, userId = null, action = null, startDate = null, endDate = null } = {}) => {
    const params = new URLSearchParams();
    params.append('skip', skip);
    params.append('limit', limit);
    if (userId) params.append('user_id', userId);
    if (action) params.append('action', action);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/users/activity-logs?${params}`);
    return response.data;
  }
);

export const resetUserPassword = createAsyncThunk(
  'userManagement/resetUserPassword',
  async ({ userId, newPassword }) => {
    const response = await api.post(`/users/${userId}/reset-password`, null, {
      params: { new_password: newPassword },
    });
    return response.data;
  }
);

export const fetchRoles = createAsyncThunk(
  'userManagement/fetchRoles',
  async () => {
    const response = await api.get('/users/roles/list');
    return response.data.roles;
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState: {
    users: [],
    performance: null,
    activityLogs: {
      logs: [],
      total: 0,
    },
    roles: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Performance
      .addCase(fetchUserPerformance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performance = action.payload;
      })
      .addCase(fetchUserPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Activity Logs
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.activityLogs = action.payload;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Reset Password
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = userManagementSlice.actions;
export default userManagementSlice.reducer;
