import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardRoute } from '@/features/dashboard/components/DashboardRoute'
import { DashboardSettingsPage } from '@/features/dashboard/components/DashboardSettingsPage'
import { AnnouncementsPage } from '@/features/announcements/components/AnnouncementsPage'
import { BirthdaysPage } from '@/features/birthdays/components/BirthdaysPage'
import { CalendarSettingsPage } from '@/features/calendar/components/CalendarSettingsPage'
import { ChoresPage } from '@/features/chores/components/ChoresPage'
import { CountdownsPage } from '@/features/countdowns/components/CountdownsPage'
import { FamilyMembersPage } from '@/features/family/components/FamilyMembersPage'
import { MealPlanPage } from '@/features/meals/components/MealPlanPage'
import { ShoppingListPage } from '@/features/shopping-list/components/ShoppingListPage'
import { AdminLayout } from './layouts/AdminLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardRoute />,
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
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'meals', element: <MealPlanPage /> },
      { path: 'shopping', element: <ShoppingListPage /> },
      { path: 'birthdays', element: <BirthdaysPage /> },
      { path: 'countdowns', element: <CountdownsPage /> },
    ],
  },
])
