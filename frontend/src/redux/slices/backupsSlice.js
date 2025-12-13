import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchBackups = createAsyncThunk(
  'backups/fetchBackups',
  async ({ skip = 0, limit = 50 } = {}) => {
    const response = await api.get(`/backups?skip=${skip}&limit=${limit}`);
    return response.data;
  }
);

export const createBackup = createAsyncThunk(
  'backups/createBackup',
  async (backupData) => {
    const response = await api.post('/backups', backupData);
    return response.data;
  }
);

export const restoreBackup = createAsyncThunk(
  'backups/restoreBackup',
  async (backupId) => {
    const response = await api.post(`/backups/${backupId}/restore`);
    return response.data;
  }
);

export const deleteBackup = createAsyncThunk(
  'backups/deleteBackup',
  async (backupId) => {
    await api.delete(`/backups/${backupId}`);
    return backupId;
  }
);

export const fetchBackupStats = createAsyncThunk(
  'backups/fetchBackupStats',
  async () => {
    const response = await api.get('/backups/stats');
    return response.data;
  }
);

export const downloadBackup = createAsyncThunk(
  'backups/downloadBackup',
  async (backupId) => {
    const response = await api.get(`/backups/${backupId}/download`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_${backupId}.sql`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return backupId;
  }
);

const backupsSlice = createSlice({
  name: 'backups',
  initialState: {
    backups: [],
    stats: null,
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
      // Fetch Backups
      .addCase(fetchBackups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBackups.fulfilled, (state, action) => {
        state.loading = false;
        state.backups = action.payload;
      })
      .addCase(fetchBackups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create Backup
      .addCase(createBackup.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBackup.fulfilled, (state, action) => {
        state.loading = false;
        state.backups.unshift(action.payload);
      })
      .addCase(createBackup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Restore Backup
      .addCase(restoreBackup.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreBackup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(restoreBackup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete Backup
      .addCase(deleteBackup.fulfilled, (state, action) => {
        state.backups = state.backups.filter((b) => b.id !== action.payload);
      })
      
      // Fetch Stats
      .addCase(fetchBackupStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Download Backup
      .addCase(downloadBackup.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadBackup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadBackup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = backupsSlice.actions;
export default backupsSlice.reducer;
