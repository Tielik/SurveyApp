import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getAuthToken } from "@/helpers/auth"

interface Choice {
  id: number
  choice_text: string
  votes: number
}

interface Question {
  id: number
  question_text: string
  choices: Choice[]
}

export interface Survey {
  id: number
  title: string
  description: string
  questions: Question[]
  access_code: string
  is_active: boolean
}

export const useDashboardAction = () => {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const navigate = useNavigate()

  const fetchSurveys = useCallback(() => {
    const token = getAuthToken()
    if (!token) {
      navigate("/")
      return
    }

    axios
      .get("http://127.0.0.1:8000/api/surveys/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => setSurveys(response.data))
      .catch((error) => console.error(error))
  }, [navigate])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const toggleActive = (survey: Survey) => {
    const token = getAuthToken()
    if (!token) {
      navigate("/")
      return
    }

    const updatedSurveys = surveys.map((s) =>
      s.id === survey.id ? { ...s, is_active: !s.is_active } : s,
    )
    setSurveys(updatedSurveys)

    axios
      .patch(
        `http://127.0.0.1:8000/api/surveys/${survey.id}/`,
        { is_active: !survey.is_active },
        { headers: { Authorization: `Token ${token}` } },
      )
      .then(() => {
        toast.success(!survey.is_active ? "Ankieta opublikowana" : "Ankieta przeniesiona do szkicow")
      })
      .catch(() => {
        toast.error("Blad aktualizacji statusu")
        fetchSurveys()
      })
  }

  const copyVoteLink = (accessCode: string) => {
    navigator.clipboard
      .writeText(`/vote/${accessCode}`)
      .then(() => toast.success("Link skopiowany!"))
      .catch(() => toast.error("Blad kopiowania"))
  }

  return { surveys, handleLogout, toggleActive, copyVoteLink }
}
