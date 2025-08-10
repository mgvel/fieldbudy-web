import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Chip,
  Avatar,
  Paper,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  LocationOn,
  CalendarToday,
  Description,
  Person,
  Business,
  CheckCircle,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Archive } from "lucide-react";

// Fix for leaflet marker icons
const createLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

// Map controller component
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const ArchivedProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const navigate = useNavigate();

  // Initialize leaflet icons once
  useEffect(() => {
    createLeafletIcon();
    setMapReady(true);
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await axiosInstance.get(`/project/get/archived/${id}`);
        setProject(data?.data || null);
      } catch (err) {
        console.error("Failed to load project", err);
      }
    };
    fetchProject();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!project) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography variant="h6">Loading project details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <div className="flex gap-3 items-center">
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            {project.Project_Name}
          </Typography>
          <Chip
            label="Archived"
            color="secondary"
            size="small"
            sx={{ mt: 1 }}
            icon={<Archive size={16} />}
          />
        </div>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab label="Overview" icon={<Description fontSize="small" />} />
        <Tab label="Location" icon={<LocationOn fontSize="small" />} />
        <Tab label="Contacts" icon={<Person fontSize="small" />} />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 3 }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Business color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Project Information</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={2}>
                    {[
                      {
                        label: "Project Number",
                        value: project.Project_Number,
                      },
                      {
                        label: "Client Project #",
                        value: project.Client_Project_Number,
                      },
                      { label: "Claim Number", value: project.Claim_Number },
                      { label: "Policy Number", value: project.Policy_Number },
                      { label: "Account Name", value: project.Account_Name },
                      { label: "Insurer", value: project.Insurer },
                      {
                        label: "Type of Report",
                        value: project.Type_of_Report,
                      },
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {item.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.value || "N/A"}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Description color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Scope of Service</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, whiteSpace: "pre-line" }}
                  >
                    {project.Scope_of_Service || "No scope of service provided"}
                  </Paper>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <div>
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <CheckCircle color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Project Status</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />

                      <List dense>
                        {[
                          {
                            label: "Completion Status",
                            value: project["PS_5.Completion_Status"],
                            chip: true,
                            color:
                              project["PS_5.Completion_Status"] === "Completed"
                                ? "success"
                                : "warning",
                          },
                          {
                            label: "Project Completed",
                            value:
                              project.Project_Completed === "true"
                                ? "Yes"
                                : "No",
                          },
                          {
                            label: "Project Cancelled",
                            value:
                              project["PS_5.Project_Cancelled"] === "true"
                                ? "Yes"
                                : "No",
                          },
                          {
                            label: "Project Suspended",
                            value: project["PS_5.Project_Suspended"] || "No",
                          },
                        ].map((item, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemText
                              primary={item.label}
                              secondary={
                                item.chip ? (
                                  <Chip
                                    label={item.value}
                                    color={item.color}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                ) : (
                                  item.value
                                )
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <div>
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <CalendarToday color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Key Dates</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />

                      <List dense>
                        {[
                          {
                            label: "Date of Loss",
                            value: formatDate(project.Date_of_Loss),
                          },
                          {
                            label: "Project Received",
                            value: formatDate(
                              project["PS_1.Project_Received_By_Acura"]
                            ),
                          },
                          {
                            label: "Report Transmitted",
                            value: formatDate(
                              project[
                                "PS_5.Transmitted_Report_and_Invoice_to_the_Client"
                              ]
                            ),
                          },
                          ...(project["PS_5.Project_Cancelled_Date"]
                            ? [
                                {
                                  label: "Cancelled On",
                                  value: formatDate(
                                    project["PS_5.Project_Cancelled_Date"]
                                  ),
                                },
                              ]
                            : []),
                          ...(project["PS_5.Suspended_Projects_Released_On"]
                            ? [
                                {
                                  label: "Suspension Released",
                                  value: formatDate(
                                    project[
                                      "PS_5.Suspended_Projects_Released_On"
                                    ]
                                  ),
                                },
                              ]
                            : []),
                        ].map((item, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemText
                              primary={item.label}
                              secondary={item.value}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Location Details</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Street Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {project.Loss_Location_Street_Address || "N/A"}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Full Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {project.Loss_Location_Address_for_Map_View
                        ?.zc_display_value || "N/A"}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Latitude
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {project.Latitude || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Longitude
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {project.Longitude || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={7}>
                  {mapReady && project.Latitude && project.Longitude ? (
                    <Box
                      sx={{ height: 400, borderRadius: 1, overflow: "hidden" }}
                    >
                      <MapContainer
                        center={[
                          parseFloat(project.Latitude),
                          parseFloat(project.Longitude),
                        ]}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={true}
                      >
                        <MapController
                          center={[
                            parseFloat(project.Latitude),
                            parseFloat(project.Longitude),
                          ]}
                          zoom={15}
                        />
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                          position={[
                            parseFloat(project.Latitude),
                            parseFloat(project.Longitude),
                          ]}
                        >
                          <Popup>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              {project.Project_Name}
                            </Typography>
                            <Typography variant="body2">
                              {project.Loss_Location_Street_Address}
                            </Typography>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </Box>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        height: 400,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography color="textSecondary">
                        {!mapReady
                          ? "Map loading..."
                          : "No location data available"}
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Contacts</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Insurer Contact
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {project.Insurer_Contact_Name || "N/A"}
                      </Typography>
                      {project.Project_Assigned_Form
                        ?.Multi_Field_engineer_email && (
                        <>
                          <Typography variant="subtitle2" color="textSecondary">
                            Engineer Email
                          </Typography>
                          <Typography variant="body1">
                            {
                              project.Project_Assigned_Form
                                .Multi_Field_engineer_email
                            }
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Primary Contact
                      </Typography>
                      <Typography variant="body1">
                        {project.Contact_Name || "N/A"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ArchivedProjectDetail;
