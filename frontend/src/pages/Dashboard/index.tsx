import { useDashboardAction } from "./DashboardAction"
import DashboardView from "./DashboardView"

export default function Dashboard() {
  const { 
      surveys, 
      user, 
      handleLogout, 
      toggleActive, 
      copyVoteLink, 
      updateUser 
  } = useDashboardAction()

return (
    <DashboardView
      surveys={surveys}
      user={user}
      onLogout={handleLogout}
      onToggleActive={toggleActive}
      onCopyVoteLink={copyVoteLink}
      onUpdateUser={updateUser}
    />
  )
}
