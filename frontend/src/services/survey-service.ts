import { apiClient } from "@/services/api-client"
import type {
  CreateChoicePayload,
  CreateQuestionPayload,
  CreateSurveyPayload,
  SurveyResponse,
} from "@/types/survey"

const authHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) {
    throw new Error("Brak tokenu uwierzytelniającego.")
  }
  return { Authorization: `Token ${token}` }
}

export const surveyService = {
  async createSurvey(payload: CreateSurveyPayload) {
    const { data } = await apiClient.post<SurveyResponse>("/api/surveys/", payload, {
      headers: authHeaders(),
    })
    return data
  },

  async createQuestion(payload: CreateQuestionPayload) {
    const { data } = await apiClient.post<{ id: number }>("/api/questions/", payload, {
      headers: authHeaders(),
    })
    return data
  },

  async createChoice(payload: CreateChoicePayload) {
    const { data } = await apiClient.post<{ id: number }>("/api/choices/", payload, {
      headers: authHeaders(),
    })
    return data
  },
}
