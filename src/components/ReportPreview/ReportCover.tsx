import { useState } from "react";
;
import axiosInstance from "../../api/axiosInstance";
import { ProjectInfo, VersionInfo } from "../../types/report";
import { toast } from "react-toastify";

export function ReportCover({
  projectInfo,
  versionInfo,
}: {
  projectInfo: ProjectInfo;
  versionInfo: VersionInfo;
}) {
  const [loadingReport, setLoadingReport] = useState(false);

  const handleDownload = async () => {
    try {
      setLoadingReport(true);

      const res = await axiosInstance.get(
        `/project/generate-report/${projectInfo?.slug}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = res.headers["content-disposition"];

      let filename = "report.docx";

      if (contentDisposition) {
        const filenameMatch =
          contentDisposition.match(/filename="?(.+)"?/);

        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
          Complete Form Data Report
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {projectInfo.projectName}
        </h1>

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4 sm:justify-start">
            <dt className="text-slate-400">Prepared for</dt>
            <dd className="font-medium text-slate-700">
              {projectInfo.clientName}
            </dd>
          </div>

          <div className="flex justify-between gap-4 sm:justify-start">
            <dt className="text-slate-400">Project No.</dt>
            <dd className="font-medium text-slate-700">
              {projectInfo.projectNumber}
            </dd>
          </div>

          <div className="flex justify-between gap-4 sm:justify-start">
            <dt className="text-slate-400">Status</dt>
            <dd className="font-medium text-slate-700">
              {projectInfo.status}
            </dd>
          </div>

          <div className="flex justify-between gap-4 sm:justify-start">
            <dt className="text-slate-400">Version</dt>
            <dd className="font-medium text-slate-700">
              {versionInfo.currentVersion}
            </dd>
          </div>
        </dl>

        <button
          onClick={handleDownload}
          disabled={loadingReport}
          className="mt-6 inline-flex items-center rounded-full bg-[#077013] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#05580f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingReport ? "Generating..." : "Generate Report"}
        </button>
      </div>
    </header>
  );
}