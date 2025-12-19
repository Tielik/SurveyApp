import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, Plus, Save, Trash } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { surveyService } from "@/services/survey-service"
import type { SurveyDetail } from "@/types/survey"

type ChoiceDraft = { id: string; text: string; originalId?: number }
type QuestionDraft = { id: string; text: string; choices: ChoiceDraft[]; originalId?: number }

const createId = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const mapSurveyToDraft = (survey: SurveyDetail): QuestionDraft[] =>
  survey.questions.map((q) => ({
    id: createId(),
    originalId: q.id,
    text: q.question_text,
    choices: q.choices.map((c) => ({
      id: createId(),
      originalId: c.id,
      text: c.choice_text,
    })),
  }))

export default function EditSurvey() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [questions, setQuestions] = useState<QuestionDraft[]>([])
  const [originalQuestionIds, setOriginalQuestionIds] = useState<number[]>([])
  const [originalChoiceIds, setOriginalChoiceIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasToken = useMemo(() => Boolean(localStorage.getItem("token")), [])

  useEffect(() => {
    if (!hasToken) {
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
        setQuestions(mapSurveyToDraft(data))
        setOriginalQuestionIds(data.questions.map((q) => q.id))
        setOriginalChoiceIds(data.questions.flatMap((q) => q.choices.map((c) => c.id)))
      })
      .catch(() => {
        toast.error("Nie udało się pobrać ankiety.")
        navigate("/dashboard")
      })
      .finally(() => setLoading(false))
  }, [hasToken, id, navigate])

  const handleQuestionChange = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)))
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
      { id: createId(), text: "", choices: [createEmptyChoice(), createEmptyChoice()] },
    ])
  }

  const removeQuestion = (id: string) => {
    setQuestions((prev) => (prev.length === 1 ? prev : prev.filter((q) => q.id !== id)))
  }

  const createEmptyChoice = (): ChoiceDraft => ({ id: createId(), text: "" })

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

  const validateForm = () => {
    if (!title.trim()) return "Podaj tytuł ankiety."
    if (questions.some((q) => !q.text.trim())) return "Każde pytanie musi mieć treść."
    if (questions.some((q) => q.choices.filter((c) => c.text.trim()).length < 2)) {
      return "Każde pytanie musi mieć co najmniej dwie odpowiedzi."
    }
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id) return
    setError(null)
    const validationError = validateForm()
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
      })

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Wróć do panelu
            </Link>
          </Button>
        </div>

        <Card className="backdrop-blur">
          <CardHeader>
            <CardTitle>Edytuj ankietę</CardTitle>
            <CardDescription>Zaktualizuj treść i odpowiedzi, następnie zapisz.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Błąd</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Tytuł</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Np. Badanie satysfakcji"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>Opublikowana</span>
                    <span className="text-xs text-muted-foreground">
                      Widoczna do głosowania po zapisaniu
                    </span>
                  </Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis (opcjonalnie)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Krótko opisz cel ankiety..."
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pytania</h3>
                  <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj pytanie
                  </Button>
                </div>

                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="border-dashed">
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex items-start gap-4">
                          <div className="mt-2 text-sm font-semibold text-muted-foreground">
                            {index + 1}.
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Pytanie</Label>
                            <Input
                              value={question.text}
                              onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                              placeholder="Treść pytania"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={questions.length === 1}
                            onClick={() => removeQuestion(question.id)}
                          >
                            <Trash className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Odpowiedzi</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addChoice(question.id)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Dodaj odpowiedź
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {question.choices.map((choice, choiceIndex) => (
                              <div key={choice.id} className="flex items-center gap-2">
                                <Input
                                  value={choice.text}
                                  onChange={(e) =>
                                    handleChoiceChange(question.id, choice.id, e.target.value)
                                  }
                                  placeholder={`Odpowiedź ${choiceIndex + 1}`}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={question.choices.length <= 2}
                                  onClick={() => removeChoice(question.id, choice.id)}
                                >
                                  <Trash className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Zapisz ankietę
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Po zapisaniu zmiany będą widoczne w głosowaniu.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
