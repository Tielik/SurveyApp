import { useVoteAction } from "./VoteAction"
import VoteView from "./VoteView"

export default function Vote() {
  const { survey, loading, error, handleVote } = useVoteAction()
  return <VoteView survey={survey} loading={loading} error={error} onVote={handleVote} />
}
