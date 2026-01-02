import type { Survey } from "./VoteAction"

type Props = {
  survey: Survey | null
  loading: boolean
  error: string
  onVote: (choiceId: number, questionId: number) => void
}

export default function VoteView({ survey, loading, error, onVote }: Props) {
  if (loading) return <div className="p-10 text-center">‘?adowanie ankiety...</div>
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>
  if (!survey) return null

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="bg-blue-600 p-8 text-center text-white">
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
                    onClick={() => onVote(choice.id, question.id)}
                    className="group flex w-full items-center justify-between rounded-lg border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">
                      {choice.choice_text}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                      {choice.votes} g‘'.
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
  )
}
