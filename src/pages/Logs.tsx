import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  CircularProgress,
  Typography,
  Box,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Chip
} from '@mui/material';
import {
  Refresh,
  Replay,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  HourglassEmpty,
  Delete,
  ClearAll,
  Search,
  ExpandMore,
  ExpandLess,
  Terminal,
  Code,
  Storage
} from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

interface FailedUpload {
  _id: string;
  folderId: string;
  lastError: string;
  base64Data: string;
  sequenceId: number;
  attemptCount: number;
}

interface UploadSession {
  _id: string;
  user: string;
  projectId: string;
  projectName: string;
  projectNumber: number;
  totalImages: number;
  processedImages: number;
  failedImages: number;
  folderName:string;
  folderId:string;
  status: 'in-progress' | 'completed' | 'failed';
  failedUploads: FailedUpload[];
  createdAt: string;
  completedAt?: string;
}

const Logs: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [sessions, setSessions] = useState<UploadSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UploadSession | null>(null);
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'in-progress'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/media/bulk/sessions/user`);
      setSessions(res.data.payload.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load sessions' });
    } finally {
      setLoading(false);
    }
  };

  // Clear all sessions
  const clearSessions = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete('/media/bulk/sessions/clear');
      setSnackbar({ open: true, message: 'All sessions cleared successfully' });
      await fetchSessions();
    } catch {
      setSnackbar({ open: true, message: 'Failed to clear sessions' });
    } finally {
      setLoading(false);
      setClearDialogOpen(false);
    }
  };

  // Retry failed uploads
  const retryFailedUploads = async () => {
    if (!selectedSession) return;
    setLoading(true);
    try {
      await axiosInstance.post(`/media/bulk/retry/${selectedSession._id}`);
      setSnackbar({ open: true, message: 'Retry initiated successfully' });
      await fetchSessions();
    } catch {
      setSnackbar({ open: true, message: 'Retry failed' });
    } finally {
      setLoading(false);
      setRetryDialogOpen(false);
    }
  };

  // Auto-refresh if any session in-progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessions?.some(s => s.status === 'in-progress')) {
        fetchSessions();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessions]);

  // Initial load
  useEffect(() => {
    fetchSessions();
  }, [userId]);



  // Filtering
  const filteredSessions = sessions?.filter(s => {
    const byFilter = filter === 'all' || s.status === filter;
    const term = searchTerm.toLowerCase();
    const bySearch =
      s._id.includes(term) ||
      s.projectId.includes(term) ||
      s.projectName.toLowerCase().includes(term);
    return byFilter && bySearch;
  });

  const toggleExpandSession = (id: string) =>
    setExpandedSession(expandedSession === id ? null : id);

  const getStatusIcon = (status: UploadSession['status']) => {
    if (status === 'completed') return <CheckCircle color="success" />;
    if (status === 'failed') return <ErrorIcon color="error" />;
    if (status === 'in-progress') return <CircularProgress size={20} />;
    return <HourglassEmpty color="disabled" />;
  };

  const getProgressColor = (status: UploadSession['status']) => {
    if (status === 'completed') return 'bg-green-600';
    if (status === 'failed') return 'bg-red-600';
    return 'bg-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center mb-6 p-4 bg-gray-500 rounded-lg">
        <Terminal className="text-green-400 mr-3" fontSize="large" />
        <div>
          <Typography variant="h5" className="font-mono text-green-400">
            UPLOAD SESSION LOGS
          </Typography>
          <Typography variant="subtitle2" className="text-gray-400">
            Monitoring bulk upload sessions in real time
          </Typography>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <div className="">
            <div className="flex items-center">
              <TextField
                fullWidth
                size="small"
                placeholder="Filter sessions..."
                InputProps={{
                  className: 'text-gray-100 font-mono',
                  startAdornment: <Search className="text-gray-500 mr-2" />
                }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <FormControl fullWidth size="small">
            <InputLabel className="text-gray-400">Status</InputLabel>
            <Select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              label="Status"
              className="text-gray-100 font-mono bg-gray-100"
            >
              <MenuItem value="all" className="font-mono">ALL</MenuItem>
              <MenuItem value="in-progress" className="font-mono">IN‑PROGRESS</MenuItem>
              <MenuItem value="completed" className="font-mono">COMPLETED</MenuItem>
              <MenuItem value="failed" className="font-mono">FAILED</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchSessions}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600"
            >
              <Refresh className={loading ? 'animate-spin text-blue-400' : 'text-gray-400'} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions?.length === 0 ? (
          <div className="text-center p-8 bg-gray-500 rounded-lg">
            <Storage className="text-gray-600 mx-auto" fontSize="large" />
            <Typography variant="h6" className="text-gray-500 mt-2">
              NO UPLOAD SESSIONS
            </Typography>
            <Typography variant="body2" className="text-gray-600 mt-1">
              Upload files to start tracking
            </Typography>
          </div>
        ) : (
          filteredSessions?.map(session => (
            <Card key={session._id} className="bg-gray-500 rounded-lg hover:shadow-lg transition-shadow">
              <CardHeader
                avatar={<Avatar className="bg-gray-700">{getStatusIcon(session.status)}</Avatar>}
                action={
                  <IconButton onClick={() => toggleExpandSession(session._id)}>
                    {expandedSession === session._id
                      ? <ExpandLess className="text-gray-400" />
                      : <ExpandMore className="text-gray-400" />}
                  </IconButton>
                }
                title={
                  <div className="flex items-center">
                    <span className="font-mono text-blue-400 mr-2">PROJECT:</span>
                    <span className="text-gray-900">{session.projectName}</span>
                    <span className="font-mono text-gray-500 ml-2">#{session.projectNumber}</span>
                    {session.folderName&&<Chip size="small" variant='filled' color='primary' className='ml-4 bg-blue-600' label={session.folderName}/>}
                  </div>
                }
                subheader={
                  <div className="flex items-center mt-1">
                    <span className="font-mono text-green-400 mr-2">STATUS:</span>
                    <Chip
                      label={session.status.toUpperCase()}
                      size="small"
                      className="font-mono"
                      color={
                        session.status === 'completed' ? 'success' :
                        session.status === 'failed' ? 'error' : 'primary'
                      }
                    />
                    <span className="font-mono text-gray-500 ml-4">
                      {new Date(session.createdAt).toLocaleString()}
                    </span>
                  </div>
                }
                onClick={() => toggleExpandSession(session._id)}
                className="cursor-pointer"
              />

              <Collapse in={expandedSession === session._id}>
                <CardContent className="pt-0">
                  {/* Progress Bar */}
                  <Box mb={4}>
                    <Box className="flex justify-between text-xs text-gray-400 mb-1">
                      <Typography component="span">UPLOAD PROGRESS</Typography>
                      <Typography component="span">
                        {session.processedImages}/{session.totalImages} FILES
                      </Typography>
                    </Box>
                    <Box
                      className={`h-2 rounded-full ${getProgressColor(session.status)}`}
                      style={{ width: `${(session.processedImages / session.totalImages) * 100}%` }}
                    />
                  </Box>

                  {/* Stats */}
                  <div className="grid grid-cols-6 gap-4 mb-4">
                  <div className="bg-gray-200 p-1 rounded flex gap-2 justify-center text-center">
                      <Typography className="text-green-400 text-xs font-mono">SUCCESS: </Typography>
                      <Typography className="text-md font-bold text-gray-800">
                        {session.processedImages - session.failedImages}
                      </Typography>
                    </div>
                    <div className="bg-gray-200 p-1 rounded flex gap-2 justify-center text-center">
                      <Typography className="text-red-400 font-mono">FAILED: </Typography>
                      <Typography className="text-md font-bold text-gray-800">
                        {session.failedImages}
                      </Typography>
                    </div>
                    <div className="bg-gray-200 p-1 rounded flex gap-2 justify-center text-center">
                      <Typography className="text-blue-400 font-mono">TOTAL: </Typography>
                      <Typography className="text-md font-bold text-gray-800">
                        {session.totalImages}
                      </Typography>
                    </div>
                  </div>

                  {/* Failed Uploads */}
                  {session.failedUploads.length > 0 && (
                    <>
                      <Divider className="border-gray-700 mb-2" />
                      <Box className="flex items-center mb-2">
                        <ErrorIcon className="text-red-400 mr-2" />
                        <Typography className="text-red-400 font-mono">
                          FAILED UPLOADS ({session.failedUploads.length})
                        </Typography>
                      </Box>
                      <Box className="bg-gray-900 rounded p-4 font-mono text-sm space-y-2">
                        {session.failedUploads.map((file, i) => (
                          <Box key={file._id} className="border-b border-gray-700 pb-2 last:pb-0 last:border-none">
                            <Typography className="text-yellow-400">
                              [{i + 1}] FILE ID: {file?._id?.slice(0,8)}…
                            </Typography>
                            <Typography className="text-red-400">
                              ERROR: {file.lastError}
                            </Typography>
                            <Typography className="text-gray-500">
                              ATTEMPTS: {file.attemptCount}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Actions */}
                  <Box className="flex justify-end mt-4 space-x-2">
                    {session.failedImages > 0 && (
                      <Button
                        variant="contained"
                        startIcon={<Replay />}
                        onClick={() => { setSelectedSession(session); setRetryDialogOpen(true); }}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        RETRY FAILED
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => { setSelectedSession(session); }}
                      className="text-gray-300 border-gray-600 hover:border-gray-500"
                    >
                      VIEW LOG
                    </Button>
                  </Box>
                </CardContent>
              </Collapse>
            </Card>
          ))
        )}
      </div>

      {/* Clear All Floating Button */}
      <Box className="fixed bottom-6 right-6">
        <Tooltip title="Clear All Sessions">
          <IconButton
            onClick={() => setClearDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
            size="large"
          >
            <ClearAll />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Retry Dialog */}
      <Dialog open={retryDialogOpen} onClose={() => setRetryDialogOpen(false)}>
        <DialogTitle>Retry Failed Uploads</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to retry{' '}
            {selectedSession?.failedUploads.length || 0}{' '}
            failed upload(s)?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetryDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={retryFailedUploads}
            color="primary"
            variant="contained"
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />
            }
            disabled={loading}
          >
            Confirm Retry
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear All Upload Sessions</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all {sessions?.length} upload session(s)?
          </Typography>
          <Typography variant="body2" color="error">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={clearSessions}
            color="error"
            variant="contained"
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : <Delete />
            }
            disabled={loading}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        ContentProps={{
          className: snackbar.message.includes('Failed') ?
            'bg-red-600' : 'bg-green-600'
        }}
      />
    </div>
  );
};

export default Logs;
