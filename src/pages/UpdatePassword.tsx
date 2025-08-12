// src/pages/UpdatePassword.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

interface UpdatePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function UpdatePassword() {
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<UpdatePasswordFormData>();

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const response = await axiosInstance.post('/user/update-password',{
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });

      if (!response) {
        toast.error("updation is failed")
      }

      // Password updated successfully
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Update Your Password
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={3}>
          Hello {user?.fullName}, please update your temporary password
        </Typography>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            type="password"
            {...register('currentPassword', { required: 'Current password is required' })}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
          />

          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            {...register('newPassword', { 
              required: 'New password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm your new password',
              validate: value => 
                value === watch('newPassword') || "Passwords don't match"
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
          >
            Update Password
          </Button>
        </form>
      </Paper>
    </Box>
  );
}