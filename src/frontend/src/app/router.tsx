import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { DashboardSettingsPage } from '@/features/dashboard/components/DashboardSettingsPage'
import { CalendarSettingsPage } from '@/features/calendar/components/CalendarSettingsPage'
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
      { path: 'calendar', element: <CalendarSettingsPage /> },
      { path: 'dashboard', element: <DashboardSettingsPage /> },
    ],
  },
])
