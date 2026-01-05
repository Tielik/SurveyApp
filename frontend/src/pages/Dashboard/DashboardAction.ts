import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getAuthToken } from "@/helpers/auth"

export interface User {
  username: string
  avatar: string | null
  background_image: string | null
  color_1: string
  color_2: string
  color_3: string
}

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
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()
  const token = getAuthToken()

  const fetchSurveys = useCallback(() => {
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

  const fetchUser = useCallback(() => {
    if (!token) return

    axios
      .get("http://127.0.0.1:8000/api/profile/me/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Błąd pobierania profilu:", error))
  }, [token])

  useEffect(() => {
    fetchSurveys()
    fetchUser()
  }, [fetchSurveys, fetchUser])

  const updateUser = async (formData: FormData) => {
    if (!token) return false

    try {
      const response = await axios.patch(
        "http://127.0.0.1:8000/api/profile/me/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      setUser(response.data)
      toast.success("Profil zaktualizowany!")
      return true
    } catch (error) {
      console.error(error)
      toast.error("Błąd aktualizacji profilu")
      return false
    }
  }

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

  return {
    surveys,
    user,
    fetchUser,
    updateUser,
    handleLogout,
    toggleActive,
    copyVoteLink
  }
}
