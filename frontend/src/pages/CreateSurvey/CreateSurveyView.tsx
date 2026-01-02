import { useEffect, useRef } from "react"
import type { FormEvent, Dispatch, SetStateAction } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Loader2, Plus, Save, Trash } from "lucide-react"
import '@eastdesire/jscolor'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { QuestionDraft, ThemeColors } from "./CreateSurveyAction"

interface JscolorPickerProps {
  value: string
  onChange: (color: string) => void
}

const JscolorPicker = ({ value, onChange }: JscolorPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    const element = inputRef.current;
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
        // @ts-expect-error
        onChange(this.toHEXString())
      }
    }

    isInitialized.current = true;
    // @ts-expect-error
    new window.jscolor(element, options)
  }, [])

  useEffect(() => {
    if (inputRef.current && (inputRef.current as any).jscolor && value) {
      const picker = (inputRef.current as any).jscolor;
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

type Props = {
  title: string
  description: string
  isActive: boolean
  themeColors: ThemeColors
  questions: QuestionDraft[]
  submitting: boolean
  error: string | null
  setTitle: (value: string) => void
  setDescription: (value: string) => void
  setIsActive: (value: boolean) => void
  setThemeColors: Dispatch<SetStateAction<ThemeColors>>
  handleQuestionChange: (id: string, text: string) => void
  handleChoiceChange: (questionId: string, choiceId: string, text: string) => void
  addQuestion: () => void
  removeQuestion: (id: string) => void
  addChoice: (questionId: string) => void
  removeChoice: (questionId: string, choiceId: string) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function CreateSurveyView({
  title,
  description,
  isActive,
  themeColors,
  questions,
  submitting,
  error,
  setTitle,
  setDescription,
  setIsActive,
  setThemeColors,
  handleQuestionChange,
  handleChoiceChange,
  addQuestion,
  removeQuestion,
  addChoice,
  removeChoice,
  handleSubmit,
}: Props) {
  return (
    <div 
      className="min-h-screen px-4 py-10 transition-colors duration-500 ease-in-out"
      style={{
        background: `linear-gradient(to bottom right, ${themeColors.first}, ${themeColors.second}, ${themeColors.third})`
      }}
    >
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
            <CardTitle>Stwórz ankietę</CardTitle>
            <CardDescription>Dodaj pytania i odpowiedzi, a następnie opublikuj.</CardDescription>
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
                  <div className="flex items-center pt-2">
                     <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
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

              <div className="space-y-3 pt-4 pb-6 border-b border-gray-100">
                <Label>Kolorystyka ankiety</Label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Kolor 1 (Góra-Lewo)</Label>
                    <div className="w-full">
                      <JscolorPicker
                        value={themeColors.first}
                        onChange={(c) => setThemeColors(prev => ({ ...prev, first: c }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Kolor 2 (Środek)</Label>
                    <div className="w-full">
                      <JscolorPicker
                        value={themeColors.second}
                        onChange={(c) => setThemeColors(prev => ({ ...prev, second: c }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Kolor 3 (Dół-Prawo)</Label>
                    <div className="w-full">
                      <JscolorPicker
                        value={themeColors.third}
                        onChange={(c) => setThemeColors(prev => ({ ...prev, third: c }))}
                      />
                    </div>
                  </div>

                </div>
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