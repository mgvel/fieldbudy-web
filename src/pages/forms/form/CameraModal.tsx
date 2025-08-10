import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Button,
  CircularProgress,
  DialogActions,
  Typography
} from '@mui/material';
import {
  Close,
  CameraAlt,
  FlipCameraAndroid,
  Check,
  Close as CloseIcon,
  CloudUpload
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  fieldId:string
}

const CameraModal: React.FC<CameraModalProps> = ({
  open,
  onClose,
  onUpload,
  fieldId
}) => {
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);


  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }

    return () => {
      stopCamera();
    };
  }, [open, cameraMode]);

  const startCamera = async () => {
    try {
      if (!videoRef.current) return;
      
      stopCamera();
      
      const constraints = {
        video: {
          facingMode: cameraMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
    }
    
    setIsCapturing(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const uploadCapturedImage = async () => {
    if (!capturedImage) return;
    
    try {
      setIsUploading(true);
      
      // Convert data URL to Blob
      const blob = await fetch(capturedImage).then(res => res.blob());
      
      // Create a File from Blob
      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });
      
      // Upload the file
      await onUpload([file]);
      
      // Reset camera state
      setCapturedImage(null);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCameraMode = () => {
    setCameraMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Take Photo</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {capturedImage ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain'
              }}
            />
            <DialogActions sx={{ mt: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={retakePhoto}
                disabled={isUploading}
              >
                Retake
              </Button>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={uploadCapturedImage}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogActions>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                backgroundColor: '#000',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <IconButton
                onClick={toggleCameraMode}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
              >
                <FlipCameraAndroid />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<CameraAlt />}
                onClick={captureImage}
                disabled={isCapturing}
                sx={{
                  width: 200,
                  height: 50,
                  borderRadius: 4,
                  fontSize: '1.1rem'
                }}
              >
                {isCapturing ? 'Capturing...' : 'Capture'}
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CameraModal;