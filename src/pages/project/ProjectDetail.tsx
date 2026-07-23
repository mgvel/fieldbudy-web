import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../api/config";
import {
  ArrowDownToDotIcon,
  AlertCircle,
  X,
  Box,
  Calendar,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import Breadcrumb from "../../components/ui/Breadcrumb";

type Project = {
  id: string;
  projectName: string;
  projectNumber: string;
  projectType: string;
  claimNumber: string;
  status: string;
  clientProjectNumber: string;
  dateOfLoss: string;
  lossLocationStreetAddress: string;
  accountName: string;
  ownerName: string;
  insurer: string;
  insurerContactName: string;
  scopeOfService: string;
  description: string;
  projectFolderWorkdrive: string;
  form: { slug: string };
  fe?: { fullName: string };
  qr?: { fullName: string };
  em?: { fullName: string };
  tw?: { fullName: string };
  lastRejectedStatus?: string;
  lastRejectedDate?: string;
  rejectionCount?: number;
  rejectionHistory?: Array<{
    status: string;
    rejectedBy: string;
    date: string;
    comments?: string;
  }>;
};

export default function ProjectDetail() {
  const [project, setProject] = useState<Project | null>(null);
  const [openScope, setOpenScope] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);
  const { id } = useParams();

  const fetchProject = async () => {
    try {
      const res = await axiosInstance.get(`${API_BASE_URL}/project/${id}`);
      setProject(res.data.payload.project);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  const handleToggleView = () => {
    const params = new URLSearchParams(window.location.search);
    const viewMode = params.get("viewMode");
    params.set("viewMode", viewMode === "map" ? "list" : "map");
    window.location.href = window.location.pathname + "?" + params.toString();
  };

  if (!project)
    return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="mx-auto">
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Projects", to: "/projects" },
          { label: "Project Details" },
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-2 gap-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {project.projectName}
          </h1>
        </div>
        <div className="flex gap-3">
          <a
            href={project.projectFolderWorkdrive}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outlined" className="w-full h-10 border border-secondary text-secondary py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
              {/* <Box size={18} /> */}
              <img className="w-[20px]" src="https://klamp.io/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fklamp-cms-storage-bucket%2FZoho_workdrive_5cbdb6df15%2FZoho_workdrive_5cbdb6df15.png&w=256&q=75" alt="" />
              Open WorkDrive
            </Button>
          </a>

          <a href={`/form/${project.id}`}>
            <button className="flex items-center gap-2 px-4 py-2 h-10 bg-secondary text-white rounded-lg hover:bg-secondary transition">
              <ExternalLink size={18} />
              Open Field Buddy
            </button>
          </a>
        </div>
      </div>

      <div className="pb-[2rem] shadow-lg rounded-xl overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Project Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ["Project ID", project.id],
              ["Project Number", project.projectNumber],
              ["Project Type", project.projectType],
              ["Claim Number", project.claimNumber],
              [
                "Status",
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {project.status}
                </span>,
              ],
              ["Client Project Number", project.clientProjectNumber],
              [
                "Date of Loss",
                new Date(project.dateOfLoss).toLocaleDateString(),
              ],
              ["Loss Location", project.lossLocationStreetAddress],
              ["Account Name", project.accountName],
              ["Owner Name", project.ownerName],
              ["Carrier Name", project.insurer],
              ["Insurer Contact Name", project.insurerContactName],
            ].map(([label, value], i) => (
              <div key={i} className="space-y-1">
                <div className="text-sm text-gray-500">{label}</div>
                <div className="text-base text-gray-800 font-medium">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Team Assignments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["Project Manager", project.fe?.fullName, "Assign Project Manager"],
              [
                "Staff Engineer & Quality Reviewer",
                project.qr?.fullName,
                "Assign Staff Engineer & Quality Reviewer",
              ],
              [
                "Peer Reviewer",
                project.em?.fullName,
                "Assign Peer Reviewer",
              ],
              [
                "Staff Engineer",
                project.tw?.fullName,
                "Assign Staff Engineer",
              ],
            ].map(([role, name, fallback], i) => (
              <div key={i} className="space-y-1">
                <div className="text-sm text-gray-600">{role}</div>
                {name ? (
                  <div className="w-full border border-gray-200 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg">
                    {name}
                  </div>
                ) : (
                  <a
                    href={`https://creatorapp.zoho.com/premaconsultinggroupllc/pemo#Page:Project_Summary_Page?project_num=${project.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <button className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition">
                      {fallback}
                    </button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Project Scope
            </h3>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 h-full">
              <div
                className="prose max-w-none line-clamp-4"
                dangerouslySetInnerHTML={{ __html: project.scopeOfService }}
              />
              <button
                onClick={() => setOpenScope(true)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Full Scope
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Project Description
            </h3>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 h-full">
              <div
                className="prose max-w-none line-clamp-4"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
              <button
                onClick={() => setOpenDescription(true)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Full Description
              </button>
            </div>
          </div>
        </div>
      </div>

      {project.lastRejectedStatus && (
        <div className="mt-6 bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <h3 className="text-lg font-semibold text-red-800">
              Rejection Details
            </h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-red-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Rejected Status</p>
                  <p className="font-medium text-red-600">
                    {project.lastRejectedStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Date Card */}
            <div className="bg-white border border-red-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Calendar className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Rejected On</p>
                  <p className="font-medium">
                    {project.lastRejectedDate
                      ? new Date(project.lastRejectedDate).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Count Card */}
            <div className="bg-white border border-red-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <X className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rejections</p>
                  <p className="font-medium">{project.rejectionCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection History Table */}
          {project.rejectionHistory?.length > 0 && (
            <div className="p-6 border-t">
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                Rejection History
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {project.rejectionHistory.map((history, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            {history.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {history.rejectedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {new Date(history.date).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scope Modal */}
      <Dialog open={openScope} onClose={() => setOpenScope(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Project Scope</DialogTitle>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: project.scopeOfService }}
          />
        </DialogContent>
      </Dialog>

      {/* Description Modal */}
      <Dialog open={openDescription} onClose={() => setOpenDescription(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Project Description</DialogTitle>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
