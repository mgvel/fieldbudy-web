import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
} from "@mui/material";
import axiosInstance from "../../../api/axiosInstance";
import { format } from "date-fns";
import { toast } from "react-toastify";

interface SiteInspectionModalProps {
  open: boolean;
  onClose: () => void;
  siteInspection: any;
  fetchSiteVisit:()=>void;
}

const SiteInspectionModal: React.FC<SiteInspectionModalProps> = ({
  open,
  onClose,
  siteInspection,
  fetchSiteVisit
}) => {
  const [formData, setFormData] = React.useState({
    // Inspection_Completion_Actual_Date_Time: "",
    Site_Viste_Completion: "",
    Status: "",
    Site_Visit__Comment: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateForSubmission = (dateString: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    // Format as "Aug 10,2025 12:10 AM"
    return format(date, "MMM d,yyyy hh:mm a");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
  
      // Prepare payload with formatted dates
      const payload = {
        Status: formData.Status,
        Site_Visit__Comment: formData.Site_Visit__Comment,
        // Inspection_Completion_Actual_Date_Time: formatDateForSubmission(
        //   formData.Inspection_Completion_Actual_Date_Time
        // ),
        Site_Viste_Completion: formatDateForSubmission(
          formData.Site_Viste_Completion
        ),
      };
  
      
      const res = await axiosInstance.put(
        `/site-visit/${siteInspection.ID}`,
        payload
      );
      fetchSiteVisit()
      toast.success("site inspection updated")
      onClose();
    } catch (err) {
      console.error("Failed to update site inspection:", err);
      setError("Failed to save inspection data. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-gray-100 p-4">
        <Typography variant="h6" className="font-bold text-center">
          Site Inspection
        </Typography>
      </DialogTitle>

      <DialogContent className="p-6 space-y-4">
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-between mb-4">
          <Typography variant="body1" className="text-blue-900 font-medium">
            Date Of Visit: {siteInspection.Site_Inspection_Date}
          </Typography>
          <Typography variant="body1" className="text-blue-900 font-medium">
            Project Manager:{" "}
            {siteInspection?.Field_EngineerReferences !=="" &&
           siteInspection?.Field_EngineerReferences?.map(
              (el: any) => el.display_value
            ).join(", ")}
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Scheduled Completion Date"
            type="date"
            name="Site_Viste_Completion"
            value={formData.Site_Viste_Completion}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />

          

          <TextField
            select
            fullWidth
            label="Status"
            name="Status"
            value={formData.Status}
            onChange={handleChange}
          >
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Canceled">Cancelled</MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments"
            name="Site_Visit__Comment"
            value={formData.Site_Visit__Comment}
            onChange={handleChange}
          />
        </div>
      </DialogContent>

      <DialogActions className="p-4 bg-gray-50">
        <Button 
          onClick={onClose} 
          className="text-gray-600 hover:bg-gray-100"
          disabled={loading}
        >
          I will do later
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          endIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SiteInspectionModal;