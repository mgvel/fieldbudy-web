import React from 'react';
import { Upload } from 'lucide-react';
import { CircularProgress } from '@mui/material';

interface UploadButtonProps {
  onClick: () => void;
  isUploading: boolean;
  hasActiveSession: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ 
  onClick, 
  isUploading, 
  hasActiveSession 
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-40 flex items-center justify-center ${
        isUploading || hasActiveSession
          ? 'bg-blue-500 hover:bg-blue-600' 
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
      title="Upload Images"
    >
      {isUploading || hasActiveSession ? (
        <CircularProgress size={24} sx={{ color: 'white' }} />
      ) : (
        <Upload className="w-6 h-6 text-white" />
      )}
    </button>
  );
};

export default UploadButton;