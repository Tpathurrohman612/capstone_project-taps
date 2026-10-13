import { RouterProvider } from 'react-router'
import { router } from './routes'
import { WorkflowStorageNotice } from './shared/components/WorkflowStorageNotice'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <WorkflowStorageNotice />
    </>
  )
}
