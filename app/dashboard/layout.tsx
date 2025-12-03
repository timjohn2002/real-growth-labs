import { DashboardSidebar } from "@/components/DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}

