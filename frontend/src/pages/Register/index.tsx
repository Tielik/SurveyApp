import { useRegisterAction } from "./RegisterAction"
import RegisterView from "./RegisterView"

export default function Register() {
  const { error, loading, handleRegister } = useRegisterAction()
  return <RegisterView error={error} loading={loading} onSubmit={handleRegister} />
}
