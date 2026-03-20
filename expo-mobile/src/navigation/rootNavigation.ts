import { createNavigationContainerRef } from '@react-navigation/native'
import type { RootStackParamList } from './AppNavigator'

/**
 * Navigate to stack routes from tab screens. `getParent()` is not always defined on every
 * navigator configuration; the container ref is reliable.
 */
export const rootNavigationRef = createNavigationContainerRef<RootStackParamList>()

export function navigateRoot<K extends keyof RootStackParamList>(
  name: K,
  ...args: undefined extends RootStackParamList[K]
    ? [params?: RootStackParamList[K]]
    : [params: RootStackParamList[K]]
): void {
  if (!rootNavigationRef.isReady()) return
  const params = args[0]
  type Navigate = (screen: string, p?: object) => void
  const go = rootNavigationRef.navigate as unknown as Navigate
  if (params !== undefined) {
    go(name as string, params as object)
  } else {
    go(name as string)
  }
}
