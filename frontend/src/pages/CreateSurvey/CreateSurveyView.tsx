import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Loader2, Plus, Save, Trash } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RecaptchaWidget } from "@/components/recaptcha"
import type { QuestionDraft } from "./CreateSurveyAction"

type Props = {
  title: string
  description: string
  isActive: boolean
  questions: QuestionDraft[]
  submitting: boolean
  error: string | null
  recaptchaToken: string
  recaptchaError: string | null
  setTitle: (value: string) => void
  setDescription: (value: string) => void
  setIsActive: (value: boolean) => void
  setRecaptchaToken: (value: string) => void
  setRecaptchaError: (value: string | null) => void
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
  questions,
  submitting,
  error,
  recaptchaToken,
  recaptchaError,
  setTitle,
  setDescription,
  setIsActive,
  setRecaptchaToken,
  setRecaptchaError,
  handleQuestionChange,
  handleChoiceChange,
  addQuestion,
  removeQuestion,
  addChoice,
  removeChoice,
  handleSubmit,
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              WrÆˆŽÅ do panelu
            </Link>
          </Button>
          <Button asChild variant="link">
            <Link to="/dashboard">Podglad ankiet</Link>
          </Button>
        </div>

        <Card className="backdrop-blur">
          <CardHeader>
            <CardTitle>Stworz ankiete</CardTitle>
            <CardDescription>Dodaj pytania i odpowiedzi, a nastepnie opublikuj.</CardDescription>
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
                    placeholder="Nps. Badanie satysfakcji"
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
                              Dodaj odpowied‘­
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

              <div className="space-y-2">
                <RecaptchaWidget
                  onVerify={(token) => {
                    setRecaptchaToken(token)
                    if (token) setRecaptchaError(null)
                  }}
                  onExpired={() => setRecaptchaToken("")}
                  onError={() => setRecaptchaError("Blad reCAPTCHA. Sprobuj ponownie.")}
                />
                {recaptchaError && <p className="text-sm text-red-500">{recaptchaError}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={submitting || !recaptchaToken}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Utworz ankietŽt
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Po utworzeniu otrzymasz kod dosetpu do glosowania.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
