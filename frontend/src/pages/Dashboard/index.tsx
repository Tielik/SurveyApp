import { useDashboardAction } from "./DashboardAction"
import DashboardView from "./DashboardView"

export default function Dashboard() {
  const { surveys, handleLogout, toggleActive, copyVoteLink } = useDashboardAction()

  return (
    <DashboardView
      surveys={surveys}
      onLogout={handleLogout}
      onToggleActive={toggleActive}
      onCopyVoteLink={copyVoteLink}
    />
  )
}
