import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  TextField,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Box,
  CircularProgress,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip
} from '@mui/material';
import { 
  Camera, 
  Close, 
  Image as ImageIcon,
  CloudUpload,
  Download,
  Visibility,
  CameraAlt
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-toastify';
import { FormFields, UploadedFile } from '../../../types/forms';
import { FileText, MessageSquare } from 'lucide-react';
import CameraModal from './CameraModal';

interface EnhancedFormFieldProps {
  field: FormField;
  value: any;
  readOnly: boolean;
  onInputChange: (fieldId: string, value: any) => void;
  onOpenChat: (fieldId: string) => void;
  onOpenGallery: (fieldId: string) => void;
  projectId?: string;
}

const FormField: React.FC<EnhancedFormFieldProps> = ({
  field,
  value,
  readOnly,
  onInputChange,
  onOpenChat,
  projectId
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false); // State for camera modal

// 2) Initialize safely (filter out null/undefined)


// 1) Make normalizeFile null-safe
const normalizeFile = useCallback((file: any): UploadedFile => {
  const url = file?.url ?? file?.path ?? file?.uri ?? file?.location ?? "";
  const isImageUrl = /\.(jpe?g|png|gif|webp|bmp|tiff)$/i.test(url);

  return {
    _id:
      file?._id ??
      file?.id ??
      Math.random().toString(36).slice(2, 11),
    slug: file?.slug ?? "",
    url,
    thumbnail: file?.thumbnail ?? (isImageUrl ? url : ""),
    workdriveId: file?.workdriveId ?? "",
    filename: file?.filename ?? file?.name ?? "Unnamed file",
    size: file?.size ?? 0,
    localPath: file?.localPath ?? "",
    includedInReport: Boolean(file?.includedInReport),
    type:
      file?.type ??
      file?.mimeType?.split("/")[0] ??
      (isImageUrl ? "image" : "file"),
    mimeType: file?.mimeType ?? "",
    originalName: file?.originalName ?? file?.filename ?? file?.name ?? "file",
  };
}, []);

useEffect(() => {
  if (field.fieldType === "images" || field.fieldType === "file") {
    if (Array.isArray(value)) {
      const cleaned = value.filter(Boolean).map(normalizeFile);
      setUploadedFiles(cleaned);
    } else if (value && typeof value === "object") {
      setUploadedFiles([normalizeFile(value)]);
    } else {
      setUploadedFiles([]);
    }
  }
}, [field.fieldType, value, normalizeFile]);


  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };


  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    if (!projectId || !field.folder || readOnly) return;
  
    setIsUploading(true);
    setUploadProgress(0);
  
    const formData = new FormData();
    formData.append('fieldId', field.id);
    formData.append('folder', field.folder);
    
    acceptedFiles.forEach(file => {
      formData.append('files', file);
    });
  
    try {
      const response = await axiosInstance.post(
        `/media/${projectId}?folder=${encodeURIComponent(field.folder)}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(progress);
          }
        }
      );
  
      if (response.data?.payload) {
        const newFiles = (response.data.payload as any[])
          .filter(Boolean)
          .map(normalizeFile);
      
        // ensure thumbnails for images
        const withThumbs = newFiles.map((f) =>
          !f.thumbnail && f.type === "image" ? { ...f, thumbnail: f.url } : f
        );
      
        const updatedFiles = [...uploadedFiles, ...withThumbs];
        setUploadedFiles(updatedFiles);
        onInputChange(field.id, updatedFiles);
        toast.success(`${withThumbs.length} file(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [projectId, field.folder, field.id, readOnly, uploadedFiles, normalizeFile, onInputChange]);

  const handleRemoveFile = useCallback((fileId: string) => {
    if (readOnly) return;

    const updatedFiles = uploadedFiles.filter(file => file._id !== fileId);
    setUploadedFiles(updatedFiles);
    onInputChange(field.id, updatedFiles.length > 0 ? updatedFiles : null);
    toast.info('File removed from form');
  }, [readOnly, uploadedFiles, onInputChange, field.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    disabled: isUploading || readOnly,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleCameraCapture = async (files: File[]) => {
    try {
      await handleFileUpload(files);
    } catch (error) {
      console.error('Error uploading captured image:', error);
    }
  };

  const renderFilePreview = useCallback((file: UploadedFile) => {
    
    return (
      <Card key={file._id} sx={{ position: 'relative', height: '100%' }}>
        {!readOnly && (
          <IconButton
            size="small"
            onClick={() => handleRemoveFile(file._id)}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { backgroundColor: 'white' },
              zIndex: 1
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        )}
        
        <CardMedia
          sx={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F5F5F5',
            cursor: 'pointer'
          }}
          onClick={() => window.open(file.url, '_blank')}
        >
          {file.thumbnail ? (
            <img
              src={file.thumbnail}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <ImageIcon sx={{ fontSize: 48, color: '#9E9E9E' }} />
          )}
        </CardMedia>
        
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.75rem'
            }}
          >
            {file.originalName || file.filename}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            {file.size && (
              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            )}
            
            <Box>
              <IconButton
                size="small"
                onClick={() => window.open(file.url, '_blank')}
                title="View"
              >
                <Visibility fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = file.url;
                  link.download = file.originalName || file.filename;
                  link.click();
                }}
                title="Download"
              >
                <Download fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }, [readOnly, handleRemoveFile]);

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
        if (field.id === 'assignment-scope') {
          return (
            <Box sx={{ 
              p: 2, 
              border: '1px solid #ccc', 
              borderRadius: 2, 
              backgroundColor: '#f9f9f9' 
            }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#333',fontSize:"16px" }}>
                Scope of Service
              </Typography>
              <Typography sx={{ mb: 2, color: '#555',fontSize:"13px"  }}>
                {value || 'No scope defined'}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, color: '#333' ,fontSize:"16px" }}>
                Additional Description
              </Typography>
              <Typography sx={{ color: '#555',fontSize:"13px"  }}>
                Additional project details...
              </Typography>
            </Box>
          );
        }
        
        return (
          <ReactQuill
            ref={quillRef}
            value={value || ''}
            onChange={(content) => onInputChange(field.id, content)}
            modules={quillModules}
            theme="snow"
            readOnly={readOnly}
            style={{
              backgroundColor: readOnly ? '#f5f5f5' : 'white',
              borderRadius: '4px'
            }}
          />
        );
      
      case 'dropdown':
        const options = field.options?.map(opt => ({
          value: opt,
          label: opt.replace(':disabled', ''),
          disabled: opt.endsWith(':disabled')
        })) || [];
        
        return (
          <TextField
            select
            fullWidth
            value={value || ''}
            onChange={(e) => onInputChange(field.id, e.target.value)}
            placeholder={field.hint}
            disabled={readOnly}
            size="small"
          >
            <MenuItem value="" disabled>
              {field.hint || 'Select an option...'}
            </MenuItem>
            {options.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      
      case 'images':
      case 'file':
        return (
          <Box>
            {!readOnly && (
              <>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? '#3B82F6' : '#D1D5DB',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? '#EBF8FF' : isUploading ? '#F9FAFB' : 'white',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#3B82F6',
                      backgroundColor: '#F8FAFC'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  
                  {isUploading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2">
                        Uploading... {uploadProgress}%
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CloudUpload sx={{ fontSize: 48, color: '#9CA3AF' }} />
                      <Box>
                        <Typography variant="body1" color="text.primary">
                          {field.hint || 'Drag & drop files here, or click to select'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supports images, PDFs, and documents (max 50MB each)
                        </Typography>
                      </Box>
                      

                      <div className='flex gap-3'>
                      <Button variant="outlined" disabled={isUploading}>
                        Select Files
                      </Button>
                  
                </div>
                    </Box>
                  )}
                </Box>

                
              </>
            )}

            {uploadedFiles.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'}
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
  {uploadedFiles.map((file, idx) => (
    <Grid item xs={6} sm={4} md={3} key={file._id || idx}>
      {renderFilePreview(file)}
    </Grid>
  ))}
</Grid>

              </Box>
            )}
          </Box>
        );
      
      case 'input':
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={value || ''}
            onChange={(e) => onInputChange(field.id, e.target.value)}
            placeholder={field.hint}
            disabled={readOnly}
            size="small"
          />
        );
      
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            value={value || ''}
            onChange={(e) => onInputChange(field.id, e.target.value)}
            placeholder={field.hint}
            disabled={readOnly}
            size="small"
          />
        );
      
      default:
        return (
          <Typography variant="body2" color="error">
            Unsupported field type: {field.fieldType}
          </Typography>
        );
    }
  };

  return (
    <>
      <Box sx={{ mb: 3, p: 2, border: '1px solid #E5E7EB', borderRadius: 2, backgroundColor: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" component="label" sx={{ fontWeight: 500 }}>
            {field.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {(field.fieldType === 'images' || field.fieldType === 'file') && (
              <Tooltip title="Gallery">
                <IconButton size="small"  onClick={() => setCameraOpen(true)}>
                  <CameraAlt fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Comments">
              <IconButton size="small" onClick={() => onOpenChat(field.id)}>
                <MessageSquare size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {renderField()}
        
        {field.instructions && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#EF4444' }}>
            {field.instructions}
          </Typography>
        )}
      </Box>

      {/* Camera Modal */}
      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onUpload={handleCameraCapture}
        fieldId={field.id}
      />
    </>
  );
};

export default FormField;