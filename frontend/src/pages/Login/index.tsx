import { useLoginAction } from "./LoginAction"
import LoginView from "./LoginView"

export default function Login() {
  const { error, loading, handleLogin } = useLoginAction()
  return <LoginView error={error} loading={loading} onSubmit={handleLogin} />
}
