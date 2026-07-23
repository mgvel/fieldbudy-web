import { Button } from "../components/ui/Button";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import bluebg from "../assets/img/blue-rectangle.png";
import blackbg from "../assets/img/black-rectangle.png";
import creambg from "../assets/img/cream-rectangle.png";
import purplebg from "../assets/img/purple-rectangle.png";
import { Map } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { UserRole, normalizeUserRole } from "../types/user";

interface Widget {
  id: string;
  title: string;
  value: number;
}

interface FieldBuddyCounts {
  approved?: number;
  rejected?: number;
  pendingReview?: number;
  pendingDrafts?: number;
}

interface Project {
  pcg: string;
  account: string;
  insured: string;
  claim: string;
  lossDate: string;
  sv: string;
}

export const Dashboard = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  // const [fieldBuddyCounts, setFieldBuddyCounts] = useState<FieldBuddyCounts>({});

  const { User } = useAuthStore((state) => ({
    User: state.user,
  }));

  const [loading, setLoading] = useState({
    widgets: true,
    fieldBuddy: true,
    visits: true,
    archived: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const widgetsRes = await axiosInstance.get("/project/widgets");
        setWidgets(widgetsRes.data.payload);
        setLoading((prev) => ({ ...prev, widgets: false }));

        // const fieldBuddyRes = await axiosInstance.get('/field-buddy/counts');
        // setFieldBuddyCounts(fieldBuddyRes.data.payload);
        // setLoading(prev => ({ ...prev, fieldBuddy: false }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }

    fetchData();
  }, []);

  const StatCard = ({
    value,
    label,
    color,
    icon,
    link,
  }: {
    value: number;
    label: string;
    color: string;
    icon?: React.ReactNode;
    link?: string;
  }) => {
    const textColors = {
      blue: "text-white",
      purple: "text-white",
      cream: "text-gray-800",
      black: "text-white",
      orange: "text-white",
      gray: "text-white",
    };

    // Map background images to colors
    const bgImages: Record<string, string> = {
      blue: bluebg,
      purple: purplebg,
      cream: creambg,
      black: blackbg,
    };

    return (
      <a
        href={link}
        className={`relative rounded-lg p-4 md:p-6 ${
          textColors[color as keyof typeof textColors]
        } bg-cover bg-no-repeat bg-right-top`}
        style={{
          backgroundImage: `url(${
            bgImages[color as keyof typeof bgImages] || ""
          })`,
          height: "170px",
          width: "100%",
          maxWidth: "257px",
        }}
      >
        <div className="absolute right-4 top-4 w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          {icon || <Map className="text-white w-5 h-5 md:w-6 md:h-6" />}
        </div>

        <div className="z-10 relative">
          <p className="text-2xl md:text-3xl font-bold">{value}</p>
          <p className="text-lg mt-5 font-medium">{label}</p>
        </div>
      </a>
    );
  };

  const renderRoleSpecificCards = () => {
    const role = normalizeUserRole(User?.role);

    switch (role) {
      case UserRole.ProjectCoordinator:
        return (
          <>
            {widgets
              .filter((widget) => widget.title === "Live Projects")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label={widget.title}
                  color="blue"
                  link="/projects"
                />
              ))}
            {widgets
              .filter((widget) => widget.id === "idp_approved_projects")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Approved Field Buddy"
                  color="purple"
                  link="/field-buddy/approved"
                />
              ))}
          </>
        );

      case UserRole.FieldEngineer:
        return (
          <>
            {widgets
              .filter((widget) => widget.id === "my_assigned_project")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label={widget.title}
                  color="blue"
                  link="/projects"
                />
              ))}
            {widgets
              .filter((widget) => widget.id === "my_pending_fb")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label={widget.title}
                  color="blue"
                  link="/field-buddy"
                />
              ))}
            {widgets
              .filter((widget) => widget.id === "my_pending_site_visits")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label={widget.title}
                  color="cream"
                  link="/my-pending-site-visit"
                />
              ))}
            <StatCard
              value={0}
              label="My Rejected Field Buddy"
              color="blue"
              link="/my-rejected-fb"
            />
            {widgets
              .filter(
                (widget) => widget.id === "my_pending_report_review_as_fe",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Reports to be Reviewed"
                  color="black"
                  link="/reports-to-be-reviewed"
                />
              ))}
          </>
        );

      case UserRole.EngineeringManager:
        return (
          <>
            {widgets
              .filter((widget) => widget.id === "my_assigned_project")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label={widget.title}
                  color="blue"
                  link="/projects"
                />
              ))}

            {widgets
              .filter((widget) => widget.id === "my_idp_pending_approval")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Pending FB Pending Review"
                  color="purple"
                  link="/fb-pending-review"
                />
              ))}
            {widgets
              .filter(
                (widget) => widget.id === "my_pending_report_review_as_em",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Reports to be Reviewed"
                  color="black"
                  link="/fb-pending-report-review"
                />
              ))}
          </>
        );
      case UserRole.ReportApproverPeerReviewer:
        return (
          <>
            {widgets
              .filter((widget) => widget.id === "my_assigned_project")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Assigned project"
                  color="blue"
                  link="/projects"
                />
              ))}

            {widgets
              .filter(
                (widget) => widget.id === "my_pending_report_review_as_ra",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Reports to Approve (RA)"
                  color="cream"
                  link="/reports-to-approve"
                />
              ))}

            {/* Engineering Manager Widgets */}
            {widgets
              .filter((widget) => widget.id === "my_idp_pending_approval")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Pending FB Review"
                  color="purple"
                  link="/fb-pending-review"
                />
              ))}

            {widgets
              .filter(
                (widget) => widget.id === "my_pending_report_review_as_em",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Reports to Review (EM)"
                  color="black"
                  link="/fb-pending-report-review"
                />
              ))}

            {widgets
              .filter((widget) => widget.id === "my_completed_projects")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Completed Projects"
                  color="gray"
                  link="/completed-projects"
                />
              ))}

            {/* Optional: Additional EM widgets you might want to show */}
            {/* {widgets
              .filter(
                (widget) => widget.id === "my_fes_reports_in_client_review",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Reports in Client Review"
                  color="orange"
                  link="/reports-in-client-review"
                />
              ))}

            {widgets
              .filter((widget) => widget.id === "my_fes_pending_idp")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Pending IDP (FE)"
                  color="red"
                  link="/pending-idp"
                />
              ))}

            {widgets
              .filter(
                (widget) =>
                  widget.id === "my_fes_reports_in_authoring_pending_authoring",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Reports in Authoring"
                  color="teal"
                  link="/reports-in-authoring"
                />
              ))}

            {widgets
              .filter(
                (widget) => widget.id === "my_fes_reports_in_pending_qr_review",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Reports in QR Review"
                  color="indigo"
                  link="/reports-in-qr-review"
                />
              ))}

            {widgets
              .filter((widget) => widget.id === "todays_svs")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Today's Site Visits"
                  color="yellow"
                  link="/todays-svs"
                />
              ))}

            {widgets
              .filter((widget) => widget.id === "tomorrows_svs")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Tomorrow's Site Visits"
                  color="cyan"
                  link="/tomorrows-svs"
                />
              ))} */}
          </>
        );
      case UserRole.TechnicalWriter:
        return (
          <>
            {widgets
              .filter((widget) => widget.id === "my_assigned_project")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label={widget.title}
                  color="blue"
                  link="/projects"
                />
              ))}{" "}
            {/* {widgets
              .filter((widget) => widget.id === "field_buddy_approved_projects")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Approved Field Buddy"
                  color="purple"
                  link="/projects"
                />
              ))} */}
            {widgets
              .filter((widget) => widget.id === "my_pending_draft_report")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Pending Draft Reports"
                  color="purple"
                  link="/pending-draft"
                />
              ))}
            {widgets
              .filter(
                (widget) =>
                  widget.id ===
                  "my_pending_rejected_review_comments_implementation",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Pending Review Comments Implementation"
                  color="black"
                  link="pending-rejected-review"
                />
              ))}
          </>
        );

      case UserRole.QualityReviewer:
        return (
          <>
            {widgets
              .filter((widget) => widget.id === "my_assigned_project")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label={widget.title}
                  color="blue"
                  link="/projects"
                />
              ))}
            {widgets
              .filter((widget) => widget.id === "field_buddy_approved_projects")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Approved Field Buddy"
                  color="purple"
                  link="/field-buddy/approved"
                />
              ))}

            {widgets
              .filter(
                (widget) => widget.id === "my_pending_report_review_as_qr",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Pending QR Reports"
                  color="black"
                  link="/pending-qr-reports"
                />
              ))}
          </>
        );

      case UserRole.TechnicalWriterQualityReviewer:
        return (
          <>
            {/* TW Widgets */}
            {widgets
              .filter((widget) => widget.id === "my_assigned_project")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Assigned Project"
                  color="blue"
                  link="/projects"
                />
              ))}

            {widgets
              .filter((widget) => widget.id === "my_pending_draft_report")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Pending Draft Reports"
                  color="purple"
                  link="/pending-draft"
                />
              ))}

            {widgets
              .filter(
                (widget) =>
                  widget.id ===
                  "my_pending_rejected_review_comments_implementation",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Pending Review Comments Implementation"
                  color="black"
                  link="/pending-rejected-review"
                />
              ))}

            {/* QR Widgets */}
            {widgets
              .filter((widget) => widget.id === "field_buddy_approved_projects")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Approved Field Buddy"
                  color="purple"
                  link="/field-buddy/approved"
                />
              ))}

            {widgets
              .filter(
                (widget) => widget.id === "my_pending_report_review_as_qr",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="My Pending QR Reports"
                  color="black"
                  link="/pending-qr-reports"
                />
              ))}
          </>
        );

      case UserRole.ReportApprover:
        return (
          <>
            {widgets
              .filter((widget) => widget.id === "my_assigned_project")
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label={widget.title}
                  color="blue"
                  link="/projects"
                />
              ))}

            {widgets
              .filter(
                (widget) => widget.id === "my_pending_report_review_as_ra",
              )
              .map((widget) => (
                <StatCard
                  key={widget.id}
                  value={widget.value}
                  label="Reports to Approve"
                  color="purple"
                  link="/reports-to-approve"
                />
              ))}
          </>
        );

      default:
        return (
          <>
            <StatCard
              value={widgets.find((w) => w.id === "live_projects")?.value || 0}
              label="Live Projects"
              color="blue"
            />
            <StatCard
              value={
                widgets.find((w) => w.id === "completed_projects")?.value || 0
              }
              label="Completed Projects"
              color="purple"
            />
            <StatCard
              value={
                widgets.find((w) => w.id === "suspended_projects")?.value || 0
              }
              label="Suspended Projects"
              color="orange"
            />
            <StatCard
              value={
                widgets.find((w) => w.id === "cancelled_projects")?.value || 0
              }
              label="Cancelled Projects"
              color="gray"
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6 relative overflow-hidden">
        <div className="absolute right-4 top-4 w-12 h-12 md:w-16 md:h-16 bg-secondary rounded-full flex items-center justify-center">
          <Map className="text-white w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div className="max-w-3xl pr-10 md:pr-0">
          <h1 className="text-xl md:text-2xl  font-bold mb-2">
            Welcome Back, {User?.fullName || "Guest"}
          </h1>
          <p className="text-gray-600 mb-4 md:mb-6 text-xs md:text-sm">
            Welcome to your{" "}
            <span className="text-secondary font-bold">
              Field Buddy Dashboard!
            </span>{" "}
            Here, you can efficiently create and manage all your Inspection Data
            Packages (IDP) and Engineering Reports. This tool will assist you to
            stay organized, track progress and collaborate effortlessly with
            your Peer Reviewer (PR), Staff Engineer (SE), and/or Staff Engineer
            & Quality Reviewer (SEQ). As always, any feedback on this tool
            and/or our processes is welcome. We aim to make things highly
            efficient for our entire team and deliver an outstanding product to
            our clients with an industry leading turnaround time (TAT).
          </p>
          <a href="/projects">
            <Button className="hover:bg-secondary bg-secondary text-white text-sm md:text-base">
              Go To My Projects
            </Button>
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {loading.widgets ? (
          <div className="col-span-4 flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          renderRoleSpecificCards()
        )}
      </div>
    </div>
  );
};
