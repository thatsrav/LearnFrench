import { Text, View } from 'react-native'

type Props = {
  /** 'sm' for tab headers, 'md' for screen tops */
  size?: 'sm' | 'md'
}

export default function FrenchLearnLogo({ size = 'md' }: Props) {
  const box = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl'
  const letter = size === 'sm' ? 'text-base' : 'text-lg'
  const label = size === 'sm' ? 'text-sm' : 'text-base'

  return (
    <View className="flex-row items-center gap-2">
      <View className={`items-center justify-center bg-blue-600 ${box}`}>
        <Text className={`font-bold text-white ${letter}`}>F</Text>
      </View>
      <Text className={`font-bold text-slate-900 ${label}`}>FrenchLearn</Text>
    </View>
  )
}
