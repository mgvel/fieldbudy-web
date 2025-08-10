import { useNavigate } from "react-router-dom";
import DynamicTable from "../../components/DynamicTable";

import { Button } from "../../components/ui/Button";
import { Map } from "lucide-react";
import { useEffect, useState } from "react";
import { Project } from "../../types/type";
import axiosInstance from "../../api/axiosInstance";
import { ProjectMapView } from "../project/ProjectMapView";
import Breadcrumb from "../../components/ui/Breadcrumb";

const MyRejectedFieldBuddy = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([])
  const [view, setView] = useState<"map" | "list">("list");

  const getproject = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/project/widgets/rejected_by_em`
      );
      setProjects(data.payload.docs as Project[]);
    } catch (err) {
      console.error("Unable to load site visits", err);
    }
  };

  useEffect(() => {
    getproject();
  }, []); 

  const formatSiteVisitDates = (siteVisits: any[]) => {
    if (!siteVisits || siteVisits.length === 0) return "N/A";
    
    return siteVisits.map(visit => 
      new Date(visit.dateOfVisit).toLocaleDateString()
    ).join(", ");
  };

  const columns = [
    { header: "PCG #", accessor: "projectNumber", filterable: true },
    { header: "Insured", accessor: "projectName", filterable: true },
    {
      header: "Client Project #",
      accessor: "clientProjectNumber",
      filterable: true,
    },
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

  const handleRowClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const data = projects.map((project) => ({
    ...project,
    id: project.id, 
  }));

  const toggleView = () => {
    setView(view === "list" ? "map" : "list");
  };

  return (
    <div className="w-[75vw] mx-auto">
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Projects", }
        ]}
      />
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">My Rejected Field Buddy</h2>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-secondary text-white"
          onClick={toggleView}
        >
          <Map className=" w-4" />
          <span>{view === "map" ? "List View" : "Map View"}</span>
        </Button>
      </div>

      {view === "map" ? (
        <ProjectMapView projects={projects} onToggleView={toggleView} />
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

export default MyRejectedFieldBuddy;