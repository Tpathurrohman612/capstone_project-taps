import { RouterProvider } from 'react-router'
import { router } from './routes'
import { AuthProvider } from './shared/lib/auth-context'
import { WorkflowStorageNotice } from './shared/components/WorkflowStorageNotice'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <WorkflowStorageNotice />
    </AuthProvider>
  )
}
