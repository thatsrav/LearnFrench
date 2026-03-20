import WritingArea from '../components/writing/WritingArea'
import { readUserCefrLevel } from '../lib/userCefr'

export default function WritingAreaPage() {
  return <WritingArea userLevel={readUserCefrLevel()} />
}
