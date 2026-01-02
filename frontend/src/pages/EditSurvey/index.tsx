import { useEditSurveyAction } from "./EditSurveyAction"
import EditSurveyView from "./EditSurveyView"

export default function EditSurvey() {
  const props = useEditSurveyAction()
  return <EditSurveyView {...props} />
}
