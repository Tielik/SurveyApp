import { useVoteAction } from "./VoteAction"
import VoteView from "./VoteView"

export default function Vote() {
  const {
    survey,
    loading,
    error,
    selectedAnswers,
    missingQuestionIds,
    submitting,
    recaptchaToken,
    recaptchaError,
    setRecaptchaToken,
    setRecaptchaError,
    handleSelect,
    handleSubmit,
  } = useVoteAction()
  return (
    <VoteView
      survey={survey}
      loading={loading}
      error={error}
      selectedAnswers={selectedAnswers}
      missingQuestionIds={missingQuestionIds}
      submitting={submitting}
      recaptchaToken={recaptchaToken}
      recaptchaError={recaptchaError}
      setRecaptchaToken={setRecaptchaToken}
      setRecaptchaError={setRecaptchaError}
      onSelect={handleSelect}
      onSubmit={handleSubmit}
    />
  )
}
