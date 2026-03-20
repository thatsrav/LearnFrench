import './global.css'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AppNavigator from './src/navigation/AppNavigator'
import { AuthProvider } from './src/contexts/AuthContext'
import { useDatabase } from './src/database'

export default function App() {
  const { isReady, isLoading, error } = useDatabase()

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-sm text-slate-600">Initializing learning database...</Text>
        <StatusBar style="dark" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-lg font-semibold text-rose-700">Database error</Text>
        <Text className="mt-2 text-center text-sm text-rose-600">{error.message}</Text>
        <StatusBar style="dark" />
      </View>
    )
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Text className="text-sm text-slate-600">Preparing app...</Text>
        <StatusBar style="dark" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  )
}

