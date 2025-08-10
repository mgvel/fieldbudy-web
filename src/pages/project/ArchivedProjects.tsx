import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import DynamicTable from "../../components/DynamicTable";
import { Button } from "../../components/ui/Button";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { Skeleton } from "@mui/material";

const ArchivedProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "list">("list");
  const navigate = useNavigate();

  const fetchProjects = async (cursor?: string) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/project/get/archived${cursor ? `?cursor=${cursor}` : ""}`
      );
      const newProjects = data?.payload?.data || [];
      const cursorFromResponse = data?.payload?.nextCursor || null;

      setProjects(prev => [...prev, ...newProjects]);
      setNextCursor(cursorFromResponse);
    } catch (err) {
      console.error("Failed to fetch archived projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? dateStr : parsed.toLocaleDateString();
  };

  const columns = [
    { header: "PCG #", accessor: "Project_Number", filterable: true },
    { header: "Insured", accessor: "Project_Name", filterable: true },
    { header: "Client Project #", accessor: "Client_Project_Number", filterable: true },
    { header: "Claim #", accessor: "Claim_Number", filterable: true },
    { header: "Account Name", accessor: "Account_Name", filterable: true },
    { header: "Carrier Name", accessor: "Insurer", filterable: true },
    {
      header: "Completion Status",
      accessor: "PS_5.Completion_Status",
      render: (val: string) => (
        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
          {val}
        </span>
      ),
    },
    {
      header: "Transmitted On",
      accessor: "PS_5.Transmitted_Report_and_Invoice_to_the_Client",
      render: (val: string) => formatDate(val),
    },
  ];

  const handleRowClick = (row: any) => {
    navigate(`/archived-projects/${row.ID}`);
  };

  return (
    <div className="w-[75vw] mx-auto">
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Archived Projects" },
        ]}
      />

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Archived Projects</h2>
        {/* <Button
          variant="outline"
          size="lg"
          className="flex items-center gap-2 bg-secondary text-white"
          onClick={() => setView(view === "list" ? "map" : "list")}
        >
          <Map className="w-4" />
          <span>{view === "map" ? "List View" : "Map View"}</span>
        </Button> */}
      </div>

      {loading && projects.length === 0 ? (
        <Skeleton variant="rectangular" height={300} />
      ) : (
        <>
          <DynamicTable
            columns={columns}
            data={projects}
            // itemsPerPage={200}
            onRowClick={handleRowClick}
          />
          {nextCursor && (
            <div className="flex justify-center mt-4">
              <Button onClick={() => fetchProjects(nextCursor)} loading={loading}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArchivedProjects;
