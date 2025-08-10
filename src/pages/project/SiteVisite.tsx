import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import DynamicTable from "../../components/DynamicTable";
import Breadcrumb from "../../components/ui/Breadcrumb";

interface Project {
  _id: string;
  id: string;                
  projectName: string;
  projectNumber: string;
  clientProjectNumber?: string;
  claimNumber?: string;
  accountName?: string;
  longitude?: number;
  latitude?: number;
}

interface SiteVisit {
  _id: string;
  slug: string;
  streetAddress: string;
  longitude?: number;
  latitude?: number;
  dateOfVisit: string;     
  project: Project;
  isVisited: boolean;
}


const SiteVisite = () => {
  const navigate = useNavigate();
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);

  const getSiteVisits = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/site-visit?page=1&limit=200`
      );
      setSiteVisits(data.payload as SiteVisit[]);
    } catch (err) {
      console.error("Unable to load site visits", err);
    }
  };

  useEffect(() => {
    getSiteVisits();
  }, []); 



  const formatSiteVisitDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });


  const tableData = siteVisits.map((sv) => ({
    id: sv._id,                              
    projectId: sv.project.id,               
    projectNumber: sv.project.projectNumber,
    projectName: sv.project.projectName,
    claimNumber: sv.project.claimNumber ?? "—",
    streetAddress: sv.streetAddress,
    dateOfVisit: sv.dateOfVisit,
    isVisited: sv.isVisited ? "Visited" : "Pending",
  }));

  const formatAddress = (addr: string) => {
    const max = 40;
    if (addr.length <= max) return addr;
  
    const idx = addr.indexOf(",", max);
    if (idx === -1) return addr;              
    return (
      <>
        {addr.slice(0, idx)}
        <br />
        {addr.slice(idx + 1).trimStart()}
      </>
    );
  };
  


  const columns = [
    { header: "PCG #", accessor: "projectNumber", filterable: true },
    { header: "Insured", accessor: "projectName", filterable: true },
    
    { header: "Claim #", accessor: "claimNumber", filterable: true },
    
    {
        header: "Address",
        accessor: "streetAddress",
        filterable: true,
        render: (addr: string) => (
          <span className="block max-w-xs whitespace-normal break-words">
            {formatAddress(addr)}
          </span>
        ),
      },
    {
      header: "Site Visit Date",
      accessor: "dateOfVisit",
      filterable: false,
      render: formatSiteVisitDate,
    },
    {
        header: "Visited Status",
        accessor: "isVisited",
        filterable: true,
        render: (val: string) => (
          <span
            className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${
              val ==="Visited" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {val }
          </span>
        ),
      },
  ];



  const handleRowClick = (row: typeof tableData[number]) => {
    navigate(`/projects/${row.projectId}`);
  };



  return (
    <div className="w-[75vw] mx-auto">
       <Breadcrumb
        crumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Projects", }
        ]}
      />

      <header className="flex items-center justify-between my-2">
        <h2 className="text-xl font-semibold">Site Visit</h2>
      </header>
        <DynamicTable
          columns={columns}
          data={tableData}
          itemsPerPage={20}
          onRowClick={handleRowClick}
        />
      
    </div>
  );
};

export default SiteVisite;
