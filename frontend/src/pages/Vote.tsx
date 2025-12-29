import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Choice = { id: number; choice_text: string; votes: number }
type Question = { id: number; question_text: string; choices: Choice[] }
type Survey = { title: string; description: string; questions: Question[] }

export default function Vote() {
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
        toast.success("Dziękujemy za głos!")
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
      .catch(() => toast.error("Błąd głosowania."))
  }

  if (loading) return <div className="p-10 text-center">Ładowanie ankiety...</div>
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>
  if (!survey) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 py-10 px-4">
      <div className="mx-auto flex max-w-2xl flex-col">
        <div className="bg-white/80 backdrop-blur-md my-6 overflow-hidden shadow-lg flex-col md:flex-row justify-between items-center border border-white/20 rounded-xl">
        <div className="bg-blue-600 p-8 text-center text-white ">
          <h1 className="mb-2 text-3xl font-bold">{survey.title}</h1>
          <p className="opacity-90">{survey.description}</p>
        </div>

        <div className="space-y-8 p-8">
          {survey.questions.map((question) => (
            <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">{question.question_text}</h3>

              <div className="grid gap-3">
                {question.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleVote(choice.id, question.id)}
                    className="group flex w-full items-center justify-between rounded-lg border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">
                      {choice.choice_text}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                      {choice.votes} gł.
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
          Powered by SurveyPlatform
        </div>
        </div>
      </div>
    </div>
  )
}
