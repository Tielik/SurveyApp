<<<<<<< HEAD:frontend/src/pages/CreateSurvey.tsx
import { useEffect, useMemo, useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
=======
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
>>>>>>> 2216ec5d86d792325e9961a1e2682b9ac0ab5ee2:frontend/src/pages/EditSurvey/EditSurveyView.tsx
import { ArrowLeft, Loader2, Plus, Save, Trash } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
<<<<<<< HEAD:frontend/src/pages/CreateSurvey.tsx
import { surveyService } from "@/services/survey-service"
import type { CreateChoicePayload } from "@/types/survey"
import '@eastdesire/jscolor'

interface JscolorPickerProps {
  value: string
  onChange: (color: string) => void
}

const JscolorPicker = ({ value, onChange }: JscolorPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const isInitialized = useRef(false) // Flaga zabezpieczająca

  useEffect(() => {
    const element = inputRef.current;

    // Zabezpieczenie przed podwójną inicjalizacją
    if (!element || isInitialized.current || (element as any).jscolor) {
      return
    }

    const options = {
      value: value,
      format: 'hex',
      previewSize: 40,
      borderRadius: 4,
      padding: 8,
      width: 200,
      closeButton: true,
      closeText: 'OK',
      onInput: function () {
        // @ts-ignore
        onChange(this.toHEXString())
      }
    }

    isInitialized.current = true;
    // @ts-ignore
    new window.jscolor(element, options)
  }, [])

  useEffect(() => {
    if (inputRef.current && (inputRef.current as any).jscolor && value) {
      const picker = (inputRef.current as any).jscolor;
      // Aktualizujemy tylko jeśli wartości są różne (ignorując wielkość liter)
      if (picker.toHEXString().toLowerCase() !== value.toLowerCase()) {
        picker.fromString(value)
      }
    }
  }, [value])

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        className="w-full h-9 border border-gray-300 rounded-md px-2 font-mono text-xs uppercase cursor-pointer text-center"
      />
    </div>
  )
}
=======
import type { QuestionDraft } from "./EditSurveyAction"
>>>>>>> 2216ec5d86d792325e9961a1e2682b9ac0ab5ee2:frontend/src/pages/EditSurvey/EditSurveyView.tsx

type Props = {
  title: string
  description: string
  isActive: boolean
  questions: QuestionDraft[]
  loading: boolean
  submitting: boolean
  error: string | null
  setTitle: (value: string) => void
  setDescription: (value: string) => void
  setIsActive: (value: boolean) => void
  handleQuestionChange: (id: string, text: string) => void
  handleChoiceChange: (questionId: string, choiceId: string, text: string) => void
  addQuestion: () => void
  removeQuestion: (id: string) => void
  addChoice: (questionId: string) => void
  removeChoice: (questionId: string, choiceId: string) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

<<<<<<< HEAD:frontend/src/pages/CreateSurvey.tsx
const createId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

const createEmptyChoice = (): ChoiceDraft => ({ id: createId(), text: "" })
const createEmptyQuestion = (): QuestionDraft => ({
  id: createId(),
  text: "",
  choices: [createEmptyChoice(), createEmptyChoice()],
})

export default function CreateSurvey() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [themeColors, setThemeColors] = useState({
    first: "#f8fafc",
    second: "#eef2ff",
    third: "#F3F4F6"
  })
  const [questions, setQuestions] = useState<QuestionDraft[]>([createEmptyQuestion()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasToken = useMemo(() => Boolean(localStorage.getItem("token")), [])

  useEffect(() => {
    if (!hasToken) {
      navigate("/")
    }
  }, [hasToken, navigate])

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

  const addQuestion = () => setQuestions((prev) => [...prev, createEmptyQuestion()])

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
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setSubmitting(true)
    try {
      const survey = await surveyService.createSurvey({
        title,
        description,
        is_active: isActive,
        // @ts-ignore - jeśli typy nie są zaktualizowane
        theme_primary_color: themeColors.first,
        // @ts-ignore
        theme_secondary_color: themeColors.second,
        // @ts-ignore
        theme_background_color: themeColors.third
      })

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

  return (
    <div 
      className="min-h-screen py-10 px-4 transition-colors duration-500 ease-in-out"
      style={{
        background: `linear-gradient(to bottom right, ${themeColors.first}, ${themeColors.second}, ${themeColors.third})`
      }}
    >
=======
export default function EditSurveyView({
  title,
  description,
  isActive,
  questions,
  loading,
  submitting,
  error,
  setTitle,
  setDescription,
  setIsActive,
  handleQuestionChange,
  handleChoiceChange,
  addQuestion,
  removeQuestion,
  addChoice,
  removeChoice,
  handleSubmit,
}: Props) {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 px-4 py-10">
>>>>>>> 2216ec5d86d792325e9961a1e2682b9ac0ab5ee2:frontend/src/pages/EditSurvey/EditSurveyView.tsx
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              WrÆˆŽÅ do panelu
            </Link>
          </Button>
        </div>

        <Card className="backdrop-blur">
          <CardHeader>
            <CardTitle>Edytuj ankietŽt</CardTitle>
            <CardDescription>Zaktualizuj tresc i odpowiedzi, nastepnie zapisz.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Blad</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Tytul</Label>
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
                      Widoczna do glosowania po zapisaniu
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
                  placeholder="Krotko opisz cel ankiety..."
                />
              </div>

              <div className="space-y-3 pt-4 pb-6 border-b border-gray-100">
                <Label>Kolorystyka ankiety</Label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    
                    {/* Picker 1: Główny */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Główny</Label>
                      <div className="flex items-center gap-3">
                          <div className="w-full">
                              <JscolorPicker 
                                  value={themeColors.first} 
                                  onChange={(c) => setThemeColors(prev => ({...prev, first: c}))} 
                              />
                          </div>
                          <div className="w-8 h-8 rounded border border-gray-300 shadow-sm flex-shrink-0" 
                               style={{ backgroundColor: themeColors.first }} />
                      </div>
                    </div>

                    {/* Picker 2: Akcent */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Dodatkowy</Label>
                      <div className="flex items-center gap-3">
                          <div className="w-full">
                              <JscolorPicker 
                                  value={themeColors.second} 
                                  onChange={(c) => setThemeColors(prev => ({...prev, second: c}))} 
                              />
                          </div>
                          <div className="w-8 h-8 rounded border border-gray-300 shadow-sm flex-shrink-0" 
                               style={{ backgroundColor: themeColors.second }} />
                      </div>
                    </div>

                    {/* Picker 3: Tło */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Tło</Label>
                      <div className="flex items-center gap-3">
                          <div className="w-full">
                              <JscolorPicker 
                                  value={themeColors.third} 
                                  onChange={(c) => setThemeColors(prev => ({...prev, third: c}))} 
                              />
                          </div>
                          <div className="w-8 h-8 rounded border border-gray-300 shadow-sm flex-shrink-0" 
                               style={{ backgroundColor: themeColors.third }} />
                      </div>
                    </div>

                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pytania</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
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
                              placeholder="Tresc pytania"
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
                              Dodaj odpowiedz
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
                                  placeholder={`Odpowiedz ${choiceIndex + 1}`}
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
                      Zapisz ankiete
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Po zapisaniu zmiany beda widoczne w glosowaniu.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
