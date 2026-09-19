export function DashboardEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-24 text-center">
      <p className="text-xl font-medium">No widgets configured yet.</p>
      <p className="text-muted-foreground">Add widgets in Admin mode to see them here.</p>
    </div>
  )
}
