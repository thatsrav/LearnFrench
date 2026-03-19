import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import HomeScreen from '../screens/HomeScreen'
import SyllabusScreen from '../screens/SyllabusScreen'
import UnitOverviewScreen from '../screens/UnitOverviewScreen'
import ReadingRoomScreen from '../screens/ReadingRoomScreen'
import SpeakingCoachScreen from '../screens/SpeakingCoachScreen'
import LeaderboardScreen from '../screens/LeaderboardScreen'
import LessonScreen from '../screens/LessonScreen'

export type RootStackParamList = {
  MainTabs: undefined
  UnitOverviewScreen: { moduleId: string }
  LessonScreen: { unitId: string; level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'; moduleId?: string }
}

export type MainTabParamList = {
  Home: undefined
  Syllabus: undefined
  Reading: undefined
  Speaking: undefined
  Leaderboard: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '700', color: '#0f172a' },
        headerTintColor: '#0f172a',
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          borderTopColor: '#e2e8f0',
          backgroundColor: '#fff',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Writing Lab',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Syllabus"
        component={SyllabusScreen}
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reading"
        component={ReadingRoomScreen}
        options={{
          title: 'Reading',
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Speaking"
        component={SpeakingCoachScreen}
        options={{
          title: 'Speaking',
          tabBarIcon: ({ color, size }) => <Ionicons name="mic-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          title: 'Scores',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleStyle: { fontWeight: '700' },
          headerTintColor: '#0f172a',
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="UnitOverviewScreen" component={UnitOverviewScreen} options={{ title: 'Unit' }} />
        <Stack.Screen name="LessonScreen" component={LessonScreen} options={{ title: 'Lesson' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
