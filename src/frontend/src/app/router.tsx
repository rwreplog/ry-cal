import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { ChoresPage } from '@/features/chores/components/ChoresPage'
import { FamilyMembersPage } from '@/features/family/components/FamilyMembersPage'
import { AdminLayout } from './layouts/AdminLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardShell />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="chores" replace /> },
      { path: 'chores', element: <ChoresPage /> },
      { path: 'family', element: <FamilyMembersPage /> },
    ],
  },
])
