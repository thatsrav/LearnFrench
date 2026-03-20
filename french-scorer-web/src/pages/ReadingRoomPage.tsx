import ReadingRoom from '../components/reading/ReadingRoom'
import { readUserCefrLevel } from '../lib/userCefr'

export default function ReadingRoomPage() {
  const userLevel = readUserCefrLevel()
  return <ReadingRoom userLevel={userLevel} />
}
