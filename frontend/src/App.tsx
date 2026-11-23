import { RouterProvider } from 'react-router'
import { router } from './routes'
import { AuthProvider } from './shared/lib/auth-context'
import { WorkflowStorageNotice } from './shared/components/WorkflowStorageNotice'
import { AppCheckNotice } from './shared/components/AppCheckNotice'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <WorkflowStorageNotice />
      <AppCheckNotice />
    </AuthProvider>
  )
}
