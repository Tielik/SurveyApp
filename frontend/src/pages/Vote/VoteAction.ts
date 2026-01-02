import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Choice = { id: number; choice_text: string; votes: number }
type Question = { id: number; question_text: string; choices: Choice[] }
export type Survey = { id: number; title: string; description: string; questions: Question[] }

export const useVoteAction = () => {
  const { code } = useParams()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [missingQuestionIds, setMissingQuestionIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get<Survey>(`http://127.0.0.1:8000/api/surveys/vote_access/?code=${code}`)
      .then((response) => {
        setSurvey(response.data)
        setSelectedAnswers({})
        setMissingQuestionIds([])
        setLoading(false)
      })
      .catch(() => {
        setError("Nie znaleziono ankiety lub jest nieaktywna.")
        setLoading(false)
        toast.error("Nie znaleziono ankiety lub jest nieaktywna.")
      })
  }, [code])

  const handleSelect = (choiceId: number, questionId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choiceId }))
    setMissingQuestionIds((prev) => prev.filter((id) => id !== questionId))
  }

  const handleSubmit = async () => {
    if (!survey) return
    const questionIds = survey.questions.map((question) => question.id)
    const missing = questionIds.filter((id) => selectedAnswers[id] === undefined)

    if (missing.length > 0) {
      setMissingQuestionIds(missing)
      toast.error("Odpowiedz na wszystkie pytania.")
      return
    }
    if (!recaptchaToken) {
      setRecaptchaError("Potwierdz reCAPTCHA.")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        answers: questionIds.map((questionId) => ({
          question_id: questionId,
          choice_id: selectedAnswers[questionId],
        })),
        recaptcha_token: recaptchaToken,
      }
      await axios.post(`http://127.0.0.1:8000/api/surveys/${survey.id}/submit_votes/`, payload)
      toast.success("Dziekujemy za glos!")

      const updatedQuestions = survey.questions.map((question) => {
        const choiceId = selectedAnswers[question.id]
        const updatedChoices = question.choices.map((choice) =>
          choice.id === choiceId ? { ...choice, votes: choice.votes + 1 } : choice,
        )
        return { ...question, choices: updatedChoices }
      })
      setSurvey({ ...survey, questions: updatedQuestions })
    } catch (err: any) {
      const missingFromServer = err?.response?.data?.missing_questions
      if (Array.isArray(missingFromServer)) {
        setMissingQuestionIds(missingFromServer)
      }
      toast.error("Nie udalo sie wyslac odpowiedzi.")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    survey,
    loading,
    error,
    selectedAnswers,
    missingQuestionIds,
    submitting,
    recaptchaToken,
    recaptchaError,
    setRecaptchaToken,
    setRecaptchaError,
    handleSelect,
    handleSubmit,
  }
}
