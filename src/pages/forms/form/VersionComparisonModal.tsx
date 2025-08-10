import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { Close, Visibility } from "@mui/icons-material";
import axiosInstance from "../../../api/axiosInstance";

interface VersionComparisonModalProps {
  open: boolean;
  versions: string[];
  onClose: () => void;
  formId: string;
}

const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({
  open,
  versions,
  onClose,
  formId,
}) => {
  const [version1, setVersion1] = useState("");
  const [version2, setVersion2] = useState("");
  const [formVersions, setFormVersions] = useState<string[]>([]);

  const handleCompare = () => {
    if (version1 && version2) {
      // Navigate to comparison view
      const compareUrl = `/field-buddy/versions?v1=${version1}&v2=${version2}`;
      window.open(compareUrl, "_blank");
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      if (formVersions.length === 0 && formId) {
        axiosInstance
          .get(`/form/formVersion/${formId}`)
          .then((response) => {
            setFormVersions(response.data.payload || []);
          })
          .catch((error) => {
            console.error("Error fetching form versions:", error);
          });
      }
    }
  }, [open, formId, formVersions.length]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Select Versions to Compare</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          <TextField
            select
            label="Version 1"
            value={version1}
            onChange={(e) => setVersion1(e.target.value)}
            fullWidth
            required
          >
            {formVersions.map((version) => (
              <MenuItem key={version._id} value={version._id}>
                <div className="flex justify-between bg-slate-100 p-1 w-full">
                  <span>{version.versionName}</span>{" "}
                  <span className="ml-2 text-xs text-gray-600">
                    {version.tag}
                  </span>
                </div>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Version 2"
            value={version2}
            onChange={(e) => setVersion2(e.target.value)}
            fullWidth
            required
          >
            {formVersions.map((version) => (
              <MenuItem key={version._id} value={version._id}>
                <div className="flex justify-between bg-slate-100 p-1 w-full">
                  <span>{version.versionName}</span>{" "}
                  <span className="ml-2 text-xs text-gray-600">
                    {version.tag}
                  </span>
                </div>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleCompare}
          variant="contained"
          startIcon={<Visibility />}
          disabled={!version1 || !version2 || version1 === version2}
          sx={{
            backgroundColor: "#3B82F6",
            "&:hover": { backgroundColor: "#2563EB" },
          }}
        >
          View Changelog
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionComparisonModal;
