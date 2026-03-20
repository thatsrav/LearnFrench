import './global.css'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AppNavigator from './src/navigation/AppNavigator'
import { AuthProvider } from './src/contexts/AuthContext'
import { useDatabase } from './src/database'
import { useAppFonts } from './src/theme/fonts'

export default function App() {
  const [fontsLoaded] = useAppFonts()
  const { isReady, isLoading, error } = useDatabase()

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8f9fb]">
        <ActivityIndicator size="large" color="#2563eb" />
        <StatusBar style="dark" />
      </View>
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8f9fb]">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 font-sans text-sm text-slate-600">Initializing learning database...</Text>
        <StatusBar style="dark" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8f9fb] px-6">
        <Text className="text-lg font-semibold text-rose-700">Database error</Text>
        <Text className="mt-2 text-center text-sm text-rose-600">{error.message}</Text>
        <StatusBar style="dark" />
      </View>
    )
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8f9fb]">
        <Text className="font-sans text-sm text-slate-600">Preparing app...</Text>
        <StatusBar style="dark" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AuthProvider>
            <AppNavigator />
            <StatusBar style="dark" />
          </AuthProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

