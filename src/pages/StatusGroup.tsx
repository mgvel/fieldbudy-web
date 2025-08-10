import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import { Map } from "lucide-react";

import DynamicTable from "../components/DynamicTable";
import { useDashboardStore } from "../store/dashboardStore";
import { Button } from "../components/ui/Button";

import { Project } from "../types/type";
import Breadcrumb from "../components/ui/Breadcrumb";
import { ProjectMapView } from "./project/ProjectMapView";

const STATUS_TABS = [
  "IDP Not Started",
  "IDP Completed - By FE",
  "IDP Approved - By EM",
  "IDP Rejected - By EM",
  "Draft Report Submitted",
  "Draft Report Rejected - By QR",
  "Draft Report Approved - By QR",
  "Draft Report Rejected - By EM",
  "Draft Report Approved - By EM",
  "Draft Report Rejected - By FE",
  "Draft Report Approved - By FE",
  "Client Comments Received",
  "Generate Final Report",
];

const StatusGroup = () => {
  const navigate = useNavigate();
  const projects = (useDashboardStore((state) => state.projects) as unknown) as Project[];

  const [view, setView] = useState<"map" | "list">("list");
  const [selectedStatus, setSelectedStatus] = useState<string>(STATUS_TABS[0]);

  const toggleView = () => {
    setView(view === "list" ? "map" : "list");
  };

  const handleRowClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const formatSiteVisitDates = (siteVisits: any[]) => {
    if (!siteVisits || siteVisits.length === 0) return "N/A";
    return siteVisits.map((visit) => new Date(visit.dateOfVisit).toLocaleDateString()).join(", ");
  };

  const columns = [
    { header: "PCG #", accessor: "projectNumber", filterable: true },
    { header: "Insured", accessor: "projectName", filterable: true },
    { header: "Client Project #", accessor: "clientProjectNumber", filterable: true },
    { header: "Claim #", accessor: "claimNumber", filterable: true },
    { header: "Account Name", accessor: "accountName", filterable: true },
    { header: "Carrier Name", accessor: "insurer", filterable: true },
    {
      header: "Site Visits",
      accessor: "siteVisits",
      filterable: false,
      render: (val: any[]) => formatSiteVisitDates(val),
    },
    {
      header: "IDP Status",
      accessor: "idpStatus",
      filterable: true,
      render: (val: string) => (
        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
          {val}
        </span>
      ),
    },
    {
      header: "Report Status",
      accessor: "reportStatus",
      filterable: false,
      render: (val: string) => (
        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
          {val}
        </span>
      ),
    },
  ];

  const filteredProjects = projects.filter(
    (project) =>
      project.status === selectedStatus
  );

  const data = filteredProjects.map((project) => ({
    ...project,
    id: project.id,
  }));

  return (
    <div className="w-[75vw] mx-auto">
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Projects" },
        ]}
      />

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{selectedStatus}</h2>

        <Button
          variant="outline"
          size="lg"
          className="flex items-center gap-2 bg-secondary text-white"
          onClick={toggleView}
        >
          <Map className="w-4" />
          <span>{view === "map" ? "List View" : "Map View"}</span>
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={selectedStatus}
        onChange={(_, newValue) => setSelectedStatus(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        className="mb-4"
      >
        {STATUS_TABS.map((status) => (
          <Tab key={status} label={status} value={status} />
        ))}
      </Tabs>

      {view === "map" ? (
        <ProjectMapView projects={filteredProjects} onToggleView={toggleView} />
      ) : (
        <DynamicTable
          columns={columns}
          data={data}
          itemsPerPage={20}
          onRowClick={(row) => handleRowClick(row.id)}
        />
      )}
    </div>
  );
};

export default StatusGroup;
