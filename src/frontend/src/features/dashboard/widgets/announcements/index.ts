import { Megaphone } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { AnnouncementsWidget } from './AnnouncementsWidget'

registerWidget({
  type: 'announcements',
  name: 'Announcements',
  description: 'Family notes and reminders',
  icon: Megaphone,
  component: AnnouncementsWidget,
})
