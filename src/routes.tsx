import { createBrowserRouter, Navigate } from "react-router"
import {
  AdminDashboardScreen,
  AdminWorkflowDetailScreen,
  AdminWorkflowHistoryScreen,
  AdminWorkflowProfileScreen,
  AdminWorkflowQueueScreen,
  AppLayout,
  CreateReportScreen,
  DetailReportScreen,
  IdentitySetupScreen,
  LoginScreen,
} from "./pages"
import { DashboardScreen } from "./features/student/screens/DashboardScreen"
import { ReportHistoryScreen } from "./features/student/screens/ReportHistoryScreen"
import { ProfileScreen } from "./features/student/screens/ProfileScreen"
import { DesignSystemScreen } from "./screens/DesignSystemScreen"

export const router = createBrowserRouter([
  { path: "/login", Component: LoginScreen },
  { path: "/lengkapi-identitas", Component: IdentitySetupScreen },
  { path: "/mahasiswa", element: <Navigate to="/" replace /> },
  { path: "/administrator", Component: AdminDashboardScreen },
  {
    path: "/administrator/antrean-laporan",
    Component: AdminWorkflowQueueScreen,
  },
  {
    path: "/administrator/riwayat-laporan",
    Component: AdminWorkflowHistoryScreen,
  },
  { path: "/administrator/profil-akun", Component: AdminWorkflowProfileScreen },
  { path: "/detail-laporan", Component: AdminWorkflowDetailScreen },
  { path: "/design-system", Component: DesignSystemScreen },
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardScreen },
      { path: "buat-laporan", Component: CreateReportScreen },
      { path: "riwayat-laporan", Component: ReportHistoryScreen },
      { path: "riwayat-laporan/detail-laporan", Component: DetailReportScreen },
      { path: "profil", Component: ProfileScreen },
    ],
  },
])
