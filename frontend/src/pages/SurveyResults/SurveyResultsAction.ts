import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { hasAuthToken } from "@/helpers/auth"
import { surveyService } from "@/services/survey-service"
import type { SurveyDetail } from "@/types/survey"
import type { SurveyIdParams } from "@/types/router"

type LocationState = { survey?: SurveyDetail }

export const useSurveyResultsAction = () => {
  const { id } = useParams<SurveyIdParams>()
  const navigate = useNavigate()
  const location = useLocation()
  const stateSurvey = (location.state as LocationState | null)?.survey

  const [survey, setSurvey] = useState<SurveyDetail | null>(stateSurvey ?? null)
  const [loading, setLoading] = useState(!stateSurvey)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!hasAuthToken()) {
      navigate("/")
      return
    }
    if (stateSurvey) return
    surveyService
      .getSurvey(Number(id))
      .then(setSurvey)
      .catch(() => {
        setError("Nie znaleziono ankiety albo brak uprawnień")
        toast.error("Nie znaleziono ankiety albo brak uprawnień")
      })
      .finally(() => setLoading(false))
  }, [id, navigate, stateSurvey])

  const questionTotals = useMemo(() => {
    if (!survey) return []
    return survey.questions.map((q) => ({
      id: q.id,
      label: q.question_text,
      total: q.choices.reduce((acc, c) => acc + c.votes, 0),
    }))
  }, [survey])

  const maxTotal = questionTotals.reduce((max, q) => Math.max(max, q.total), 1)
  const totalVotesAll = questionTotals.reduce((acc, q) => acc + q.total, 0)

  return {
    survey,
    loading,
    error,
    questionTotals,
    maxTotal,
    totalVotesAll,
  }
}
