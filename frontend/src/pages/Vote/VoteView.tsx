import { RecaptchaWidget } from "@/components/recaptcha"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Survey, Choice } from "./VoteAction"

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

const isRatingQuestion = (choices: Choice[]) => {
  if (choices.length !== 5) return false
  const standardValues = ["1", "2", "3", "4", "5"]
  const texts = choices.map((c) => c.choice_text).sort()
  return JSON.stringify(texts) === JSON.stringify(standardValues)
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
  if (loading) return <div className="p-10 text-center">Ładowanie ankiety...</div>
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>
  if (!survey) return null

  const { color_1, color_2, color_3 } = survey
  
  const validColors = [color_1, color_2, color_3].filter((c): c is string => !!c && c.trim() !== "")

  const missingQuestions = survey.questions.filter((q) => missingQuestionIds.includes(q.id))

  return (
    <div className="min-h-screen py-10 px-4 font-sans"
      style={{
        background: `linear-gradient(to bottom right, ${validColors[0]}, ${validColors[1]}, ${validColors[2]})`
      }}>
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

          {survey.questions.map((question) => {
            const isRating = isRatingQuestion(question.choices)
            const isMissing = missingQuestionIds.includes(question.id)

            const selectedChoiceId = selectedAnswers[question.id]
            const selectedChoiceObj = question.choices.find(c => c.id === selectedChoiceId)
            const selectedNumericValue = selectedChoiceObj ? parseInt(selectedChoiceObj.choice_text) : 0

            return (
              <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">{question.question_text}</h3>
                {isMissing && <p className="mb-3 text-sm font-medium text-red-500">Wymagana odpowiedź.</p>}

                {isRating ? (
                  <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="relative flex items-center justify-between w-full max-w-xs px-4">
                      <div className="absolute left-6 right-6 top-1/2 h-1 bg-gray-300 -z-10 rounded-full" />

                      {question.choices
                        .sort((a, b) => parseInt(a.choice_text) - parseInt(b.choice_text))
                        .map((choice) => {
                          const isSelected = selectedAnswers[question.id] === choice.id
                          const currentValue = parseInt(choice.choice_text)

                          const isLower = currentValue < selectedNumericValue

                          return (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() => onSelect(choice.id, question.id)}
                              className={cn(
                                "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100",
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white scale-110 shadow-md z-10"
                                  : isLower
                                    ? "border-blue-400 bg-blue-50 text-blue-600"
                                    : "border-gray-300 bg-white text-gray-500 hover:border-blue-300 hover:scale-105"
                              )}
                            >
                              <span className="text-lg font-bold">{choice.choice_text}</span>
                            </button>
                          )
                        })}
                    </div>
                    <div className="flex justify-between w-full max-w-xs px-2 mt-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      <span>Bardzo źle</span>
                      <span>Doskonale</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">

                    {question.choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => onSelect(choice.id, question.id)}
                        className={cn(
                          "group flex w-full items-center justify-between rounded-lg border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50",
                          selectedAnswers[question.id] === choice.id
                            ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                            : "bg-white"
                        )}
                      >
                        <span className="font-medium text-gray-700 group-hover:text-blue-700">
                          {choice.choice_text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="border-t bg-white p-6 text-center">
          <div className="mb-4 space-y-2 text-left">
            <RecaptchaWidget
              onVerify={(token) => {
                setRecaptchaToken(token)
                if (token) setRecaptchaError(null)
              }}
              onExpired={() => setRecaptchaToken("")}
              onError={() => setRecaptchaError("Błąd reCAPTCHA. Spróbuj ponownie.")}
            />
            {recaptchaError && <p className="text-sm text-red-500">{recaptchaError}</p>}
          </div>
          <Button onClick={onSubmit} disabled={submitting || !recaptchaToken} className="w-full text-lg py-6">
            {submitting ? "Wysyłanie..." : "Wyślij odpowiedź"}
          </Button>
        </div>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
          Powered by SurveyPlatform
        </div>
      </div>
    </div>
  )
}