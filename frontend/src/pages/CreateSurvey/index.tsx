import { useCreateSurveyAction } from "./CreateSurveyAction"
import CreateSurveyView from "./CreateSurveyView"

export default function CreateSurvey() {
  const props = useCreateSurveyAction()
  return <CreateSurveyView {...props} />
}
