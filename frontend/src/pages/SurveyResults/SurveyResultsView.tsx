import { Link } from "react-router-dom"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Download, Loader2 } from "lucide-react"

import { SurveyPDF } from "@/components/SurveyPDF"
import QuestionResultsChart from "@/components/QuestionResultsChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SurveyDetail } from "@/types/survey"

type QuestionTotal = { id: number; label: string; total: number }

type Props = {
  survey: SurveyDetail | null
  loading: boolean
  error: string
  questionTotals: QuestionTotal[]
  maxTotal: number
  totalVotesAll: number
}

export default function SurveyResultsView({
  survey,
  loading,
  error,
  questionTotals,
  maxTotal,
  totalVotesAll,
}: Props) {
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
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-500 mb-1">Podglad wynikow</p>
            <h1 className="text-3xl font-bold text-gray-800">{survey.title}</h1>
            <p className="text-gray-500">{survey.description}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/dashboard">Wróć</Link>
            </Button>
            <Button asChild>
              <Link to={`/vote/${survey.access_code}`} target="_blank">
                Otwórz głosowanie
              </Link>
            </Button>
            <PDFDownloadLink
              document={<SurveyPDF survey={survey} totalVotes={totalVotesAll} />}
              fileName={`wyniki_ankiety_${survey.id}.pdf`}
            >
              {({ loading }: { loading: boolean }) => (
                <Button
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generowanie...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Zapisz jako PDF
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
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
                  <span>Liczba pytań</span>
                  <span className="font-semibold">{survey.questions.length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Suma głosów</span>
                  <span className="font-semibold">{totalVotesAll}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Link do głosowania</span>
                  <span className="font-mono text-xs text-indigo-600 break-all">
                    /vote/{survey.access_code}
                  </span>
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
                  Suma głosów: {q.choices.reduce((acc, c) => acc + c.votes, 0)}
                </span>
              </CardHeader>
              <CardContent>
                <QuestionResultsChart question={q} />
              </CardContent>
            </Card>
          ))}
          {survey.questions.length === 0 && (
            <p className="text-center text-gray-400">Brak pytań do wyświetlenia.</p>
          )}
        </div>
      </div>
    </div >
  )
}
