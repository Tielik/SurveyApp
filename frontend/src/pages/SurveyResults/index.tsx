import { useSurveyResultsAction } from "./SurveyResultsAction"
import SurveyResultsView from "./SurveyResultsView"

export default function SurveyResults() {
  const props = useSurveyResultsAction()
  return <SurveyResultsView {...props} />
}
