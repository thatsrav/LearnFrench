import { Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

type Props = {
  /** 'sm' for tab headers, 'md' for screen tops */
  size?: 'sm' | 'md'
}

export default function FrenchLearnLogo({ size = 'md' }: Props) {
  const dim = size === 'sm' ? 32 : 36
  const rad = size === 'sm' ? 8 : 12
  const letter = size === 'sm' ? 'text-base' : 'text-lg'
  const label = size === 'sm' ? 'text-sm' : 'text-base'

  return (
    <View className="flex-row items-center gap-2">
      <View style={{ width: dim, height: dim, borderRadius: rad, overflow: 'hidden' }}>
        <LinearGradient
          colors={['#2563eb', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text className={`font-display text-white ${letter}`}>F</Text>
        </LinearGradient>
      </View>
      <Text className={`font-display text-slate-900 ${label}`}>FrenchLearn</Text>
    </View>
  )
}
