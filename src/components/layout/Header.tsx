import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { API_BASE_URL } from "../../api/config";
import axiosInstance from "../../api/axiosInstance";
import {
  Avatar, Divider, IconButton,
  Menu, MenuItem, Typography, Badge
} from "@mui/material";
import { MessageSquareMore, Search, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../store/dashboardStore";
import { Project } from "../../types/type";

type Notification = {
  _id: string;
  title: string;
  message: string;
  formId: string;
  fieldId: string;
  formSlug: string;
  createdAt: string;
};

type Auth = {
  fullName: string;
  role: string;
  picture?: string;
  activationDate: string;
};

const Header = ({ auth }: { auth: Auth }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [previousCount, setPreviousCount] = useState(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const projects = (useDashboardStore((state) => state.projects) as unknown) as Project[];
  const { logout } = useAuth();
  const navigate = useNavigate();

  const initials = auth?.fullName
    ? auth.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get(`${API_BASE_URL}/notification`);
      const payload: Notification[] = res.data.payload || [];
      setNotifications(payload);
      setPreviousCount(payload.length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.delete(`/notification/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  // const handleNotificationClick = (notification: Notification) => {
  //   if (notification.formId && notification.fieldId && notification.formSlug) {
  //     localStorage.setItem("openChat", JSON.stringify({
  //       formId: notification.formId,
  //       fieldId: notification.fieldId,
  //     }));
  //     navigate(`/form/${notification.formSlug}`);
  //   }
  // };

  const handleNotificationClick = (notification: Notification) => {
    // 1. Store chat reference in localStorage
    localStorage.setItem("openChat", JSON.stringify({
      formId: notification.formId,
      fieldId: notification.fieldId
    }));
    
    // 2. Navigate to the form
    navigate(`/form/${notification.formSlug}`);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredProjects([]);
      return;
    }

    const filtered = projects.filter((project) =>
      project.projectName.toLowerCase().includes(value.toLowerCase()) ||
      project.projectNumber.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  return (
    <header className="flex justify-between items-center px-6 bg-white relative z-50">
      <h1 className="text-xl font-semibold text-gray-700">Field Buddy</h1>

      <div className="flex items-center gap-4">

        {/* Search Box */}
        <div className="relative w-80">
      <div className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200">
        <Search className="w-4 h-4 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search Projects..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
        />
      </div>

      {searchTerm && filteredProjects.length > 0 && (
        <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50 animate-fade-in">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => {
                navigate(`/projects/${project.id}`);
                setSearchTerm("");
                setFilteredProjects([]);
              }}
              className="px-4 py-3 hover:bg-blue-50 text-sm cursor-pointer text-gray-800 transition-colors duration-150"
            >
              <div className="font-medium text-blue-600">{project.projectName}</div>
              <div className="text-xs text-gray-500">#{project.projectNumber}</div>
            </div>
          ))}
        </div>
      )}
    </div>
        {/* Theme Toggle */}
        <IconButton onClick={() => document.documentElement.classList.toggle("dark")}>
          <Sun className="text-secondary" />
        </IconButton>

        {/* Notifications */}
        <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
          <Badge badgeContent={notifications.length} color="error">
            <MessageSquareMore className="text-secondary" />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={() => setNotifAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Typography className="px-4 pt-2 font-medium text-gray-800">Last Updates</Typography>
          <Divider />
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <MenuItem key={n._id} divider>
                <div className="flex flex-col w-full">
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className="text-left text-secondary hover:underline text-sm font-medium"
                  >
                    {n.title}
                  </button>
                  <Typography variant="body2" className="text-gray-700">{n.message}</Typography>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-green-600 hover:underline"
                    >
                      Mark as Read
                    </button>
                  </div>
                </div>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No new notifications</MenuItem>
          )}
        </Menu>

        {/* Profile Menu */}
        <IconButton onClick={(e) => setProfileAnchorEl(e.currentTarget)}>
          {auth?.picture ? (
            <Avatar alt={auth.fullName} src={auth.picture} />
          ) : (
            <Avatar sx={{ bgcolor: "#3B82F6" }}>{initials}</Avatar>
          )}
        </IconButton>
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={() => setProfileAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem disabled>
            <div>
              <Typography fontWeight="bold">{auth.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{auth.role}</Typography>
            </div>
          </MenuItem>
          <Divider />
          <MenuItem component="a" href="/update-password">Update Password</MenuItem>
          <MenuItem>Feedback</MenuItem>
          <Divider />
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              Registered: {new Date(auth.activationDate).toLocaleDateString()}
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            sx={{ color: "red" }}
          >
            Logout
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
};

export default Header;
