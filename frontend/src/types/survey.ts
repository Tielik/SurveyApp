export type SurveyResponse = {
  id: number
  title: string
  description: string
  access_code: string
  is_active: boolean
  color_1?: string;
  color_2?: string;
  color_3?: string;
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
    color_1?: string;
    color_2?: string;
    color_3?: string;
  }>
}

export type CreateSurveyPayload = {
  title: string
  description?: string
  is_active?: boolean
  recaptcha_token?: string
  color_1?: string
  color_2?: string
  color_3?: string
}

export type CreateQuestionPayload = {
  survey: number
  question_text: string
}

export type CreateChoicePayload = {
  question: number
  choice_text: string
}
