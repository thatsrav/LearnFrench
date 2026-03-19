import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LessonScreen from '../screens/LessonScreen'
import SyllabusScreen from '../screens/SyllabusScreen'

export type RootStackParamList = {
  SyllabusScreen: undefined
  LessonScreen: { unitId: string; level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SyllabusScreen"
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleStyle: { fontWeight: '700' },
          headerTintColor: '#0f172a',
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen
          name="SyllabusScreen"
          component={SyllabusScreen}
          options={{ title: 'French Syllabus' }}
        />
        <Stack.Screen
          name="LessonScreen"
          component={LessonScreen}
          options={{ title: 'Lesson' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

