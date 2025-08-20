import { Navigate } from "react-router-dom";
import { SignIn } from "./pages/SignIn";
import { Dashboard } from "./pages/Dashboard";
import { ForgotPassword } from "./pages/ForgotPassword";
import { SetNewPassword } from "./pages/SetNewPassword";
import { Unauthorized } from "./pages/Unauthorized";
import { RequireAuth } from "./components/auth/RequireAuth";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Projects from "./pages/project/Projects";
import FormComponent from "./pages/forms/FormComponent";
import ProjectDetail from "./pages/project/ProjectDetail";
import InspectionPhotograph from "./pages/inspection-photograph/InspectionPhotograph";
import MyPendingFb from "./pages/project/MyPendingFb";
import SiteVisite from "./pages/project/SiteVisite";
import MyApprovedFb from "./pages/widgets/MyApprovedFb";
import MyPendingSiteVisits from "./pages/widgets/MyPendingSiteVisits";
import MyRejectedFieldBuddy from "./pages/widgets/MyRejectedFieldBuddy";
import ReportstobeReviewed from "./pages/widgets/ReportstobeReviewed";
import MyPendingFbPendingReview from "./pages/widgets/MyPendingFbPendingReview";
import ReportToREviewByEM from "./pages/widgets/ReportToREviewByEM";
import PendingDraft from "./pages/widgets/PendingDraft";
import PendindRejectedReview from "./pages/widgets/PendindRejectedReview";
import PendingQrReport from "./pages/widgets/PendingQrReport";
import VersionComparison from "./pages/forms/version-change/VersionComparison";
import Logs from "./pages/Logs";
import StatusGroup from "./pages/StatusGroup";
import ArchivedProjects from "./pages/project/ArchivedProjects";
import ArchivedProjectDetail from "./pages/project/ArchivedProjectDetail";
import SuspendedProject from "./pages/project/SuspendedProject";
import UsersList from "./pages/UsersList";
import { UpdatePassword } from "./pages/UpdatePassword";
import { RequireDummyPassword } from "./components/auth/RequireDummyPassword";

export const routes = [
  {
    path: "/login",
    element: <SignIn />,
    condition: (user: any) => !user,
    redirect: "/dashboard",
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/set-new-password/:token",
    element: <SetNewPassword />,
  },
  {
    path:"/update-password",
    element: (
      // <RequireDummyPassword>
        <UpdatePassword />
      // </RequireDummyPassword>
    )
  },  
  {
    path: "/",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "form/:id", element: <FormComponent /> },
      { path: "projects", element: <Projects /> },
      { path: "projects/:id", element: <ProjectDetail /> },
      {
        path: "inspection-photographs/:projectId",
        element: <InspectionPhotograph />,
      },
      { path: "field-buddy", element: <MyPendingFb /> },
      { path: "site-visits", element: <SiteVisite /> },
      { path: "field-buddy/approved", element: <MyApprovedFb /> },
      { path: "my-pending-site-visit", element: <MyPendingSiteVisits /> },
      { path: "my-rejected-fb", element: <MyRejectedFieldBuddy /> },
      { path: "reports-to-be-reviewed", element: <ReportstobeReviewed /> },
      { path: "fb-pending-review", element: <MyPendingFbPendingReview /> },
      { path: "fb-pending-report-review", element: <ReportToREviewByEM /> },
      { path: "pending-draft", element: <PendingDraft /> },
      { path: "pending-rejected-review", element: <PendindRejectedReview /> },
      { path: "pending-qr-reports", element: <PendingQrReport /> },
      { path: "field-buddy/versions", element: <VersionComparison /> },
      {path:"status-group",element:<StatusGroup/>},
      {path:"archived-projects",element:<ArchivedProjects/>},
      {path:"archived-projects/:id",element:<ArchivedProjectDetail/>},
      {path:"suspended-projects",element:<SuspendedProject/>},
      {path:"users",element:<UsersList/>},
      { path: "settings", element: <div>Settings</div> },
      { path: "logs", element: <Logs/> },
      { path: "*", element: <Unauthorized /> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
];
