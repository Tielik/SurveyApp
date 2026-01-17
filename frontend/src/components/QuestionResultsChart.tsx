import type { SurveyDetail } from "@/types/survey"

type Question = SurveyDetail["questions"][number]

interface Props {
  question: Question
}

export default function QuestionResultsChart({ question }: Props) {
  const totalVotes = question.choices.reduce((acc, c) => acc + c.votes, 0)
  const maxVotes = Math.max(...question.choices.map((c) => c.votes), 1)

  return (
    <div className="mt-4 space-y-3">
      {question.choices.map((choice) => {
        const widthPercent = totalVotes === 0 ? 0 : Math.round((choice.votes / totalVotes) * 100)
        const relative = Math.max((choice.votes / maxVotes) * 100, 0)

        return (
          <div key={choice.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-700">{choice.choice_text}</span>
              <span className="font-mono text-[11px] text-gray-600">
                {choice.votes} gl. {totalVotes > 0 ? `(${widthPercent}%)` : ""}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all"
                style={{ width: `${relative}%` }}
              />
            </div>
          </div>
        )
      })}
      {totalVotes === 0 && (
        <p className="text-xs italic text-gray-400">Brak głosów - wykres zaktualizuje się po pierwszym głosie.</p>
      )}
    </div>
  )
}
