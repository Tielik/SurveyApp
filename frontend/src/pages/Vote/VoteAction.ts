import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Choice = { id: number; choice_text: string; votes: number }
type Question = { id: number; question_text: string; choices: Choice[] }
export type Survey = { title: string; description: string; questions: Question[] }

export const useVoteAction = () => {
  const { code } = useParams()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios
      .get<Survey>(`http://127.0.0.1:8000/api/surveys/vote_access/?code=${code}`)
      .then((response) => {
        setSurvey(response.data)
        setLoading(false)
      })
      .catch(() => {
        setError("Nie znaleziono ankiety lub jest nieaktywna.")
        setLoading(false)
        toast.error("Nie znaleziono ankiety lub jest nieaktywna.")
      })
  }, [code])

  const handleVote = (choiceId: number, questionId: number) => {
    axios
      .post(`http://127.0.0.1:8000/api/choices/${choiceId}/vote/`)
      .then(() => {
        toast.success("Dziekujemy za glos!")
        if (!survey) return

        const updatedQuestions = survey.questions.map((question) => {
          if (question.id !== questionId) return question
          const updatedChoices = question.choices.map((choice) =>
            choice.id === choiceId ? { ...choice, votes: choice.votes + 1 } : choice,
          )
          return { ...question, choices: updatedChoices }
        })
        setSurvey({ ...survey, questions: updatedQuestions })
      })
      .catch(() => toast.error("Blad glosowania."))
  }

  return { survey, loading, error, handleVote }
}
