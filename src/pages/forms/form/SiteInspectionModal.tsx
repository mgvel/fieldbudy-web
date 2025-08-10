import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControl,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

interface SiteInspectionModalProps {
  open: boolean;
  onClose: () => void;
  siteInspection: any;
}

const SiteInspectionModal: React.FC<SiteInspectionModalProps> = ({
  open,
  onClose,
  siteInspection,
}) => {
  const [formData, setFormData] = React.useState({
    Inspection_Completion_Actual_Date_Time: null,
    Inspection_Completion_Date: null,
    status: "",
    Site_Visit_1_change_comment: "",
  });


  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (date: Date | null, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-gray-100 p-4">
        <Typography variant="h6" className="font-bold text-center">
          Site Inspection
        </Typography>
      </DialogTitle>

      <DialogContent className="p-6 space-y-4">
        <div className="flex justify-between mt-3">
          <span className="text-blue-900 font-medium">
            Date of Visit: {formatDateTime(siteInspection?.dateOfVisit)}
          </span>
          <span className="text-blue-900 font-medium">
            Street Address: {siteInspection?.streetAddress}
          </span>
        </div>
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {/* Combined Actual Start Date & Time */}
            <DateTimePicker
              label="Inspection Completion Actual Start Date & Time"
              value={formData.Inspection_Completion_Actual_Date_Time}
              onChange={(date) => handleDateTimeChange(date, "Inspection_Completion_Actual_Date_Time")}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />

            {/* Combined Site Visit Completed Date & Time */}
            <DateTimePicker
              label="Site Visit Completed Date & Time"
              value={formData.Inspection_Completion_Date}
              onChange={(date) => handleDateTimeChange(date, "Inspection_Completion_Date")}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Comment */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Change Comment/Other Comments "
            name="Site_Visit_1_change_comment"
            value={formData.Site_Visit_1_change_comment}
            onChange={handleChange}
            className="mt-4"
          />
        </LocalizationProvider>
      </DialogContent>

      <DialogActions className="p-4 bg-gray-50">
        <Button onClick={onClose} className="text-gray-600 hover:bg-gray-100">
          I will do later
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SiteInspectionModal;