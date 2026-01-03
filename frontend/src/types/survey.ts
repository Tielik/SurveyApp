export type SurveyResponse = {
  id: number
  title: string
  description: string
  access_code: string
  is_active: boolean
}

export type SurveyDetail = SurveyResponse & {
  questions: Array<{
    id: number
    question_text: string
    choices: Array<{
      id: number
      choice_text: string
      votes: number
    }>
  }>
}

export type CreateSurveyPayload = {
  title: string
  description?: string
  is_active?: boolean
  recaptcha_token?: string
}

export type CreateQuestionPayload = {
  survey: number
  question_text: string
}

export type CreateChoicePayload = {
  question: number
  choice_text: string
}
