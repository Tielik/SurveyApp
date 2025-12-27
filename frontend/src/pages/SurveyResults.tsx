import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import QuestionResultsChart from "@/components/QuestionResultsChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { surveyService } from "@/services/survey-service"
import type { SurveyDetail } from "@/types/survey"
import type { SurveyIdParams } from "@/types/router"

type LocationState = { survey?: SurveyDetail }

export default function SurveyResults() {
  const { id } = useParams<SurveyIdParams>()
  const navigate = useNavigate()
  const location = useLocation()
  const stateSurvey = (location.state as LocationState | null)?.survey

  const [survey, setSurvey] = useState<SurveyDetail | null>(stateSurvey ?? null)
  const [loading, setLoading] = useState(!stateSurvey)
  const [error, setError] = useState("")
  const hasToken = useMemo(() => Boolean(localStorage.getItem("token")), [])

  useEffect(() => {
    if (!hasToken) {
      navigate("/")
      return
    }
    if (stateSurvey) return
    surveyService
      .getSurvey(Number(id))
      .then(setSurvey)
      .catch(() => {
        setError("Nie znaleziono ankiety albo brak uprawnien.")
        toast.error("Nie znaleziono ankiety albo brak uprawnien.")
      })
      .finally(() => setLoading(false))
  }, [hasToken, id, navigate, stateSurvey])

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

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Ladowanie wynikow...</div>
  }

  if (error || !survey) {
    return (
      <div className="p-10 text-center text-red-500 font-semibold">
        {error || "Brak danych ankiety."}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-500 mb-1">Podglad wynikow</p>
            <h1 className="text-3xl font-bold text-gray-800">{survey.title}</h1>
            <p className="text-gray-500">{survey.description}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/dashboard">Wroc</Link>
            </Button>
            <Button asChild>
              <Link to={`/vote/${survey.access_code}`} target="_blank">
                Otworz glosowanie
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/60 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-xs uppercase text-indigo-500 tracking-wide">Podsumowanie</p>
                <CardTitle className="text-lg">Glosy w pytaniach</CardTitle>
              </div>
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-mono text-indigo-700">
                Suma: {totalVotesAll}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {questionTotals.map((q, idx) => {
                const width = maxTotal === 0 ? 0 : (q.total / maxTotal) * 100
                return (
                  <div key={q.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="font-medium text-gray-700">
                        {idx + 1}. {q.label}
                      </span>
                      <span className="font-mono text-gray-700">{q.total} gl.</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {questionTotals.length === 0 && (
                <p className="text-sm text-gray-400 italic">Brak pytan w ankiecie.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/60 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-xs uppercase text-indigo-500 tracking-wide">Szybki status</p>
                <CardTitle className="text-lg">Krotki opis</CardTitle>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                ID {survey.id}
              </span>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center justify-between">
                  <span>Liczba pytan</span>
                  <span className="font-semibold">{survey.questions.length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Suma glosow</span>
                  <span className="font-semibold">{totalVotesAll}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Link do glosowania</span>
                  <span className="font-mono text-xs text-indigo-600 break-all">/vote/{survey.access_code}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          {survey.questions.map((q, idx) => (
            <Card key={q.id} className="border-white/60 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg">
                  {idx + 1}. {q.question_text}
                </CardTitle>
                <span className="text-xs font-mono text-gray-500">
                  Suma glosow: {q.choices.reduce((acc, c) => acc + c.votes, 0)}
                </span>
              </CardHeader>
              <CardContent>
                <QuestionResultsChart question={q} />
              </CardContent>
            </Card>
          ))}
          {survey.questions.length === 0 && (
            <p className="text-center text-gray-400">Brak pytan do wyswietlenia.</p>
          )}
        </div>
      </div>
    </div>
  )
}
