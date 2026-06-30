import { useParams } from "react-router-dom";
import { ReportCover } from "../components/ReportPreview/ReportCover";
import { ReportTableOfContents } from "../components/ReportPreview/ReportTableOfContents";
import { ReportPreviewError, ReportPreviewSkeleton } from "../components/ReportPreview/ReportPreviewStates";
import { ProjectInformationSection } from "../components/ReportPreview/sections/ProjectInformationSection";
import { AssignmentInformationSection } from "../components/ReportPreview/sections/AssignmentInformationSection";
import { PropertyInformationSection } from "../components/ReportPreview/sections/PropertyInformationSection";
import { IntervieweeInformationSection } from "../components/ReportPreview/sections/IntervieweeInformationSection";
import { StructureInformationSection } from "../components/ReportPreview/sections/StructureInformationSection";
import { DocumentInformationSection } from "../components/ReportPreview/sections/DocumentInformationSection";
import { NotesAndImagesSection } from "../components/ReportPreview/sections/NotesAndImagesSection";
import { SoilDataSection } from "../components/ReportPreview/sections/SoilDataSection";
import { ConclusionSection } from "../components/ReportPreview/sections/ConclusionSection";
import { InspectionPhotographsSection } from "../components/ReportPreview/sections/InspectionPhotographsSection";
import { SignaturesSection } from "../components/ReportPreview/sections/SignaturesSection";
import { useReportPreview } from "../api/useReportPreview";
import { ReportMediaFile } from "../types/report";

export default function ReportPreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  console.log("slug",slug)
  const { data, isLoading, error, refetch } = useReportPreview(slug);

  if (isLoading) return <ReportPreviewSkeleton />;
  if (error) return <ReportPreviewError message={error} onRetry={refetch} />;
  if (!data) return <ReportPreviewError message="No report data was found." onRetry={refetch} />;

  const { projectInfo, formInfo, inspectorInfo, inspectionPhotographs, versionInfo } = data;
  const responses = formInfo.responses;

  return (
    <div className="min-h-screen bg-slate-50">
      <ReportCover projectInfo={projectInfo} versionInfo={versionInfo} />

      <div className="mx-auto flex max-w-7xl gap-12 px-6 py-10 sm:px-10">
        <ReportTableOfContents />

        <main className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-10">
          <ProjectInformationSection projectInfo={projectInfo} />
          <AssignmentInformationSection responses={responses} />
          <PropertyInformationSection responses={responses} />
          <IntervieweeInformationSection responses={responses} />
          <StructureInformationSection responses={responses} />
          <DocumentInformationSection responses={responses} />

          <NotesAndImagesSection
            id="weather-data"
            number="07"
            title="Weather Data"
            responses={responses}
            emptyMessage="No weather data was provided."
            fields={[
              { label: "Wind Data", notesKey: "wind-notes", imagesKey: "wind-images" },
              { label: "Hail Data", notesKey: "hail-notes", imagesKey: "hail-images" },
              { label: "Tornado Data", notesKey: "tornado-notes", imagesKey: "tornado-images" },
              { label: "Lightning Data", notesKey: "lightning-notes", imagesKey: "lightning-images" },
            ]}
          />

          <NotesAndImagesSection
            id="water-data"
            number="08"
            title="Water Data"
            responses={responses}
            emptyMessage="No water data was provided."
            fields={[
              { label: "River Data", notesKey: "river-notes", imagesKey: "river-images" },
              { label: "Water Data", notesKey: "water-notes", imagesKey: "water-images" },
              { label: "Buoy Data", notesKey: "buoy-notes", imagesKey: "buoy-images" },
              { label: "Distance Data", notesKey: "distance-notes", imagesKey: "distance-images" },
            ]}
          />

          <NotesAndImagesSection
            id="aerial-imagery"
            number="09"
            title="Aerial Imagery"
            responses={responses}
            emptyMessage="No aerial imagery was provided."
            fields={[
              { label: "Aerial Images", notesKey: "aerial-notes", imagesKey: "aerial-images" },
              { label: "Realtor Images", notesKey: "realtor-notes", imagesKey: "realtor-images" },
              { label: "Google Images", notesKey: "google-notes", imagesKey: "google-images" },
              { label: "Zillow Images", notesKey: "zillow-notes", imagesKey: "zillow-images" },
              { label: "Redfin Images", notesKey: "redfin-notes", imagesKey: "redfin-images" },
            ]}
          />

          <SoilDataSection responses={responses} />
          <ConclusionSection responses={responses} />
          <InspectionPhotographsSection
            photographs={inspectionPhotographs.includedMedia as ReportMediaFile[]}
          />
          <SignaturesSection inspectorInfo={inspectorInfo} />
        </main>
      </div>
    </div>
  );
}
