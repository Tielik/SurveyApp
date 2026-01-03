import { RecaptchaWidget } from "@/components/recaptcha"
import { Button } from "@/components/ui/button"
import type { Survey } from "./VoteAction"

type Props = {
  survey: Survey | null
  loading: boolean
  error: string
  selectedAnswers: Record<number, number>
  missingQuestionIds: number[]
  submitting: boolean
  recaptchaToken: string
  recaptchaError: string | null
  setRecaptchaToken: (value: string) => void
  setRecaptchaError: (value: string | null) => void
  onSelect: (choiceId: number, questionId: number) => void
  onSubmit: () => void
}

export default function VoteView({
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
  onSelect,
  onSubmit,
}: Props) {
  if (loading) return <div className="p-10 text-center">ƒ???adowanie ankiety...</div>
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>
  if (!survey) return null

  const missingQuestions = survey.questions.filter((q) => missingQuestionIds.includes(q.id))

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="bg-blue-600 p-8 text-center text-white">
          <h1 className="mb-2 text-3xl font-bold">{survey.title}</h1>
          <p className="opacity-90">{survey.description}</p>
        </div>

        <div className="space-y-8 p-8">
          {missingQuestions.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Nie odpowiedziano na pytania:
              <div className="mt-2 space-y-1">
                {missingQuestions.map((q, idx) => (
                  <div key={q.id}>
                    {idx + 1}. {q.question_text}
                  </div>
                ))}
              </div>
            </div>
          )}
          {survey.questions.map((question) => (
            <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">{question.question_text}</h3>
              {missingQuestionIds.includes(question.id) && (
                <p className="mb-3 text-sm font-medium text-red-500">Wymagana odpowiedz.</p>
              )}

              <div className="grid gap-3">
                {question.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => onSelect(choice.id, question.id)}
                    className={`group flex w-full items-center justify-between rounded-lg border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 ${
                      selectedAnswers[question.id] === choice.id
                        ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                        : ""
                    }`}
                  >
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">
                      {choice.choice_text}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                      {choice.votes} gƒ??'.
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t bg-white p-6 text-center">
          <div className="mb-4 space-y-2 text-left">
            <RecaptchaWidget
              onVerify={(token) => {
                setRecaptchaToken(token)
                if (token) setRecaptchaError(null)
              }}
              onExpired={() => setRecaptchaToken("")}
              onError={() => setRecaptchaError("Blad reCAPTCHA. Sprobuj ponownie.")}
            />
            {recaptchaError && <p className="text-sm text-red-500">{recaptchaError}</p>}
          </div>
          <Button onClick={onSubmit} disabled={submitting || !recaptchaToken} className="w-full">
            {submitting ? "Wysylanie..." : "Wyslij"}
          </Button>
        </div>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
          Powered by SurveyPlatform
        </div>
      </div>
    </div>
  )
}
