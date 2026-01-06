import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { hasAuthToken } from "@/helpers/auth"
import { createDraftId, validateSurveyDraft } from "@/helpers/survey-draft"
import { surveyService } from "@/services/survey-service"
import type { CreateChoicePayload, CreateSurveyPayload } from "@/types/survey"

export type ChoiceDraft = { id: string; text: string }
export type QuestionDraft = { 
  id: string; 
  text: string; 
  choices: ChoiceDraft[];
  type: 'text' | 'rating'; 
}
export type ThemeColors = { first: string; second: string; third: string }

const createEmptyChoice = (): ChoiceDraft => ({ id: createDraftId(), text: "" })
const createEmptyQuestion = (): QuestionDraft => ({
  id: createDraftId(),
  text: "",
  type: 'text',
  choices: [createEmptyChoice(), createEmptyChoice()],
})

export const useCreateSurveyAction = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    first: "#f8fafc",
    second: "#eef2ff",
    third: "#f3f4f6"
  })
  const [questions, setQuestions] = useState<QuestionDraft[]>([createEmptyQuestion()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasAuthToken()) {
      navigate("/")
    }
  }, [navigate])

  const handleQuestionChange = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  const handleChoiceChange = (questionId: string, choiceId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q

        const updatedChoices = q.choices.map((c) => (c.id === choiceId ? { ...c, text } : c))

        const values = updatedChoices.map(c => c.text.trim()).sort()
        const target = ["1", "2", "3", "4", "5"]
        const isRatingSet = JSON.stringify(values) === JSON.stringify(target)

        if (isRatingSet) {
             return { ...q, choices: updatedChoices, type: 'rating' }
        }

        return { ...q, choices: updatedChoices }
      }),
    )
  }

  const addQuestion = () => setQuestions((prev) => [...prev, createEmptyQuestion()])

  const addQuestionRating = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: createDraftId(),
        type: 'rating',
        text: "",
        choices: ["1", "2", "3", "4", "5"].map((val) => ({
          id: createDraftId(),
          text: val,
        })),
      },
    ])
  }

  const changeQuestionType = (questionId: string, newType: 'text' | 'rating') => {
    setQuestions((prev) => prev.map((q) => {
        if (q.id !== questionId) return q;
        return { ...q, type: newType };
    }))
  }

  const removeQuestion = (id: string) => {
    setQuestions((prev) => (prev.length === 1 ? prev : prev.filter((q) => q.id !== id)))
  }

  const addChoice = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, choices: [...q.choices, createEmptyChoice()] } : q,
      ),
    )
  }

  const removeChoice = (questionId: string, choiceId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        if (q.choices.length <= 2) return q
        return { ...q, choices: q.choices.filter((c) => c.id !== choiceId) }
      }),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const validationError = validateSurveyDraft(title, questions)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }
    if (!recaptchaToken) {
      setRecaptchaError("Potwierdz reCAPTCHA.")
      return
    }

    setSubmitting(true)
    try {
      const survey = await surveyService.createSurvey({ 
        title, 
        description, 
        is_active: isActive,
        recaptcha_token: recaptchaToken,
        color_1: themeColors.first,
        color_2: themeColors.second,
        color_3: themeColors.third,
      } as CreateSurveyPayload)

      for (const question of questions) {
        const questionResponse = await surveyService.createQuestion({
          survey: survey.id,
          question_text: question.text.trim(),
        })

        const choices: CreateChoicePayload[] = question.choices
          .filter((choice) => choice.text.trim())
          .map((choice) => ({
            question: questionResponse.id,
            choice_text: choice.text.trim(),
          }))

        for (const choice of choices) {
          await surveyService.createChoice(choice)
        }
      }

      toast.success("Ankieta utworzona", {
        description: `Kod dostępu: ${survey.access_code}`,
      })
      navigate("/dashboard")
    } catch (err) {
      console.error("Failed to create survey", err)
      setError("Nie udało się utworzyć ankiety. Spróbuj ponownie.")
      toast.error("Nie udało się utworzyć ankiety.")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    title,
    description,
    isActive,
    themeColors,
    questions,
    submitting,
    error,
    recaptchaToken,
    recaptchaError,
    setTitle,
    setDescription,
    setIsActive,
    setThemeColors,
    setRecaptchaToken,
    setRecaptchaError,
    handleQuestionChange,
    handleChoiceChange,
    addQuestion,
    addQuestionRating,
    changeQuestionType,
    removeQuestion,
    addChoice,
    removeChoice,
    handleSubmit,
  }
}