import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { hasAuthToken } from "@/helpers/auth"
import { createDraftId, validateSurveyDraft } from "@/helpers/survey-draft"
import { surveyService } from "@/services/survey-service"
import type { SurveyDetail } from "@/types/survey"
import type { SurveyIdParams } from "@/types/router"

export type ChoiceDraft = { id: string; text: string; originalId?: number }
export type QuestionDraft = { id: string; text: string; choices: ChoiceDraft[]; originalId?: number }
// 1. Definicja typu kolorów
export type ThemeColors = { first: string; second: string; third: string }

const mapSurveyToDraft = (survey: SurveyDetail): QuestionDraft[] =>
  survey.questions.map((q) => ({
    id: createDraftId(),
    originalId: q.id,
    text: q.question_text,
    choices: q.choices.map((c) => ({
      id: createDraftId(),
      originalId: c.id,
      text: c.choice_text,
    })),
  }))

const createEmptyChoice = (): ChoiceDraft => ({ id: createDraftId(), text: "" })

export const useEditSurveyAction = () => {
  const { id } = useParams<SurveyIdParams>()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(false)
  
  // 2. Stan kolorów
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    first: "#f8fafc",
    second: "#eef2ff",
    third: "#F3F4F6"
  })

  const [questions, setQuestions] = useState<QuestionDraft[]>([])
  const [originalQuestionIds, setOriginalQuestionIds] = useState<number[]>([])
  const [originalChoiceIds, setOriginalChoiceIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasAuthToken()) {
      navigate("/")
      return
    }
    if (!id) return

    surveyService
      .getSurvey(Number(id))
      .then((data) => {
        setTitle(data.title)
        setDescription(data.description || "")
        setIsActive(data.is_active)
        
        // 3. Pobranie kolorów z API
        if (data) {
           setThemeColors({
             first: (data as any).theme_first_color || "#f8fafc",
             second: (data as any).theme_second_color || "#eef2ff",
             third: (data as any).theme_third_color || "#F3F4F6",
           })
        }

        setQuestions(mapSurveyToDraft(data))
        setOriginalQuestionIds(data.questions.map((q) => q.id))
        setOriginalChoiceIds(data.questions.flatMap((q) => q.choices.map((c) => c.id)))
      })
      .catch(() => {
        toast.error("Nie udało się pobrać ankiety.")
        navigate("/dashboard")
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleQuestionChange = (questionId: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, text } : q)))
  }

  const handleChoiceChange = (questionId: string, choiceId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: q.choices.map((c) => (c.id === choiceId ? { ...c, text } : c)) }
          : q,
      ),
    )
  }

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: createDraftId(), text: "", choices: [createEmptyChoice(), createEmptyChoice()] },
    ])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) => (prev.length === 1 ? prev : prev.filter((q) => q.id !== questionId)))
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
    if (!id) return
    setError(null)

    const validationError = validateSurveyDraft(title, questions)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setSubmitting(true)

    try {
      await surveyService.updateSurvey(Number(id), {
        title,
        description,
        is_active: isActive,
        // 4. Wysłanie kolorów do API
        theme_first_color: themeColors.first,
        theme_second_color: themeColors.second,
        theme_third_color: themeColors.third,
      } as any)

      const savedQuestionIds: number[] = []
      const savedChoiceIds: number[] = []

      for (const question of questions) {
        let questionId = question.originalId
        if (question.originalId) {
          await surveyService.updateQuestion(question.originalId, {
            survey: Number(id),
            question_text: question.text.trim(),
          })
        } else {
          const created = await surveyService.createQuestion({
            survey: Number(id),
            question_text: question.text.trim(),
          })
          questionId = created.id
        }

        if (!questionId) continue
        savedQuestionIds.push(questionId)

        for (const choice of question.choices) {
          if (choice.originalId) {
            await surveyService.updateChoice(choice.originalId, {
              question: questionId,
              choice_text: choice.text.trim(),
            })
            savedChoiceIds.push(choice.originalId)
          } else {
            const createdChoice = await surveyService.createChoice({
              question: questionId,
              choice_text: choice.text.trim(),
            })
            savedChoiceIds.push(createdChoice.id)
          }
        }
      }

      const questionsToDelete = originalQuestionIds.filter((qId) => !savedQuestionIds.includes(qId))
      const choicesToDelete = originalChoiceIds.filter((cId) => !savedChoiceIds.includes(cId))

      await Promise.all([
        ...questionsToDelete.map((qid) => surveyService.deleteQuestion(qid)),
        ...choicesToDelete.map((cid) => surveyService.deleteChoice(cid)),
      ])

      toast.success("Ankieta zapisana")
      navigate("/dashboard")
    } catch (err) {
      console.error("Failed to update survey", err)
      setError("Nie udało się zapisać ankiety. Spróbuj ponownie.")
      toast.error("Nie udało się zapisać ankiety.")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    title,
    description,
    isActive,
    themeColors, // Eksport stanu
    questions,
    loading,
    submitting,
    error,
    setTitle,
    setDescription,
    setIsActive,
    setThemeColors, // Eksport settera
    handleQuestionChange,
    handleChoiceChange,
    addQuestion,
    removeQuestion,
    addChoice,
    removeChoice,
    handleSubmit,
  }
}