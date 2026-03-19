import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Scroll content bottom padding for screens inside the tab bar.
 * Tab bar already respects home indicator; keep modest spacing for all OEMs.
 */
export function useTabScreenBottomPadding(extra = 20) {
  const { bottom } = useSafeAreaInsets()
  return extra + (bottom > 0 ? Math.min(bottom, 12) : 0)
}

/**
 * Full-width stack routes (no tab bar): reserve space for iPhone home indicator /
 * Android gesture inset when tallies use edge-to-edge.
 */
export function useStackScreenBottomPadding(extra = 24) {
  const { bottom } = useSafeAreaInsets()
  return extra + bottom
}
