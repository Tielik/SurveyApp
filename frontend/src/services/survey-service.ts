import { apiClient } from "@/services/api-client"
import type {
  CreateChoicePayload,
  CreateQuestionPayload,
  CreateSurveyPayload,
  SurveyDetail,
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
  async getSurvey(id: number) {
    const { data } = await apiClient.get<SurveyDetail>(`/api/surveys/${id}/`, {
      headers: authHeaders(),
    })
    return data
  },

  async createSurvey(payload: CreateSurveyPayload) {
    const { data } = await apiClient.post<SurveyResponse>("/api/surveys/", payload, {
      headers: authHeaders(),
    })
    return data
  },

  async updateSurvey(id: number, payload: Partial<CreateSurveyPayload>) {
    const { data } = await apiClient.patch<SurveyResponse>(`/api/surveys/${id}/`, payload, {
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

  async updateQuestion(id: number, payload: Partial<CreateQuestionPayload>) {
    await apiClient.patch(`/api/questions/${id}/`, payload, {
      headers: authHeaders(),
    })
  },

  async createChoice(payload: CreateChoicePayload) {
    const { data } = await apiClient.post<{ id: number }>("/api/choices/", payload, {
      headers: authHeaders(),
    })
    return data
  },

  async updateChoice(id: number, payload: Partial<CreateChoicePayload>) {
    await apiClient.patch(`/api/choices/${id}/`, payload, {
      headers: authHeaders(),
    })
  },

  async deleteQuestion(id: number) {
    await apiClient.delete(`/api/questions/${id}/`, { headers: authHeaders() })
  },

  async deleteChoice(id: number) {
    await apiClient.delete(`/api/choices/${id}/`, { headers: authHeaders() })
  },
}
