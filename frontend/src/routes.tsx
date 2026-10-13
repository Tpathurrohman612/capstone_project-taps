import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from './features/student/layout/AppLayout'
import { IdentitySetupScreen } from './features/auth/screens/IdentitySetupScreen'
import { LoginScreen } from './features/auth/screens/LoginScreen'
import { AdminWorkflowDetailScreen } from './features/admin/screens/AdminWorkflowDetailScreen'
import { AdminWorkflowProfileScreen } from './features/admin/screens/AdminWorkflowProfileScreen'
import { AdminWorkflowHistoryScreen } from './features/admin/screens/AdminWorkflowHistoryScreen'
import { AdminWorkflowQueueScreen } from './features/admin/screens/AdminWorkflowQueueScreen'
import { AdminDashboardScreen } from './features/admin/screens/AdminDashboardScreen'
import { DetailReportScreen } from './features/student/screens/DetailReportScreen'
import { CreateReportScreen } from './features/student/screens/CreateReportScreen'
import { DashboardScreen } from './features/student/screens/DashboardScreen'
import { ReportHistoryScreen } from './features/student/screens/ReportHistoryScreen'
import { ProfileScreen } from './features/student/screens/ProfileScreen'
import { DesignSystemScreen } from './screens/DesignSystemScreen'
import { RoleGuard } from './shared/components/RoleGuard'

export const router = createBrowserRouter([
  { path: '/login', Component: LoginScreen },
  {
    path: '/lengkapi-identitas',
    element: (
      <RoleGuard role="Mahasiswa">
        <IdentitySetupScreen />
      </RoleGuard>
    ),
  },
  { path: '/mahasiswa', element: <Navigate to="/" replace /> },
  {
    path: '/administrator',
    element: (
      <RoleGuard role="Administrator">
        <AdminDashboardScreen />
      </RoleGuard>
    ),
  },
  {
    path: '/administrator/antrean-laporan',
    element: (
      <RoleGuard role="Administrator">
        <AdminWorkflowQueueScreen />
      </RoleGuard>
    ),
  },
  {
    path: '/administrator/riwayat-laporan',
    element: (
      <RoleGuard role="Administrator">
        <AdminWorkflowHistoryScreen />
      </RoleGuard>
    ),
  },
  {
    path: '/administrator/profil-akun',
    element: (
      <RoleGuard role="Administrator">
        <AdminWorkflowProfileScreen />
      </RoleGuard>
    ),
  },
  {
    path: '/detail-laporan',
    element: (
      <RoleGuard role="Administrator">
        <AdminWorkflowDetailScreen />
      </RoleGuard>
    ),
  },
  { path: '/design-system', Component: DesignSystemScreen },
  {
    path: '/',
    element: (
      <RoleGuard role="Mahasiswa">
        <AppLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, Component: DashboardScreen },
      { path: 'buat-laporan', Component: CreateReportScreen },
      { path: 'riwayat-laporan', Component: ReportHistoryScreen },
      { path: 'riwayat-laporan/detail-laporan', Component: DetailReportScreen },
      { path: 'profil', Component: ProfileScreen },
    ],
  },
])
