type ChoiceLike = { text: string }
type QuestionLike = { text: string; choices: ChoiceLike[] }

export const createDraftId = () =>
  crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

export const validateSurveyDraft = (title: string, questions: QuestionLike[]) => {
  if (!title.trim()) return "Podaj tytul ankiety."
  if (questions.some((q) => !q.text.trim())) return "Kazde pytanie musi miec tresc."
  if (questions.some((q) => q.choices.filter((c) => c.text.trim()).length < 2)) {
    return "Kazde pytanie musi miec co najmniej dwie odpowiedzi."
  }
  return null
}
