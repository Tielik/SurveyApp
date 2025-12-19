export type SurveyResponse = {
  id: number
  title: string
  description: string
  access_code: string
  is_active: boolean
}

export type CreateSurveyPayload = {
  title: string
  description?: string
  is_active?: boolean
}

export type CreateQuestionPayload = {
  survey: number
  question_text: string
}

export type CreateChoicePayload = {
  question: number
  choice_text: string
}
