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
import FrenchLearnLogo from '../components/FrenchLearnLogo'
import TefPrepHubScreen from '../screens/TefPrepHubScreen'
import TefPrepUnitScreen from '../screens/TefPrepUnitScreen'
import TefPrepActivityScreen from '../screens/TefPrepActivityScreen'
import AccountScreen from '../screens/AccountScreen'
import SpacedReviewScreen from '../screens/SpacedReviewScreen'
import WritingJournalScreen from '../screens/WritingJournalScreen'
import JournalEntryDetailScreen from '../screens/JournalEntryDetailScreen'
import AtelierScreen from '../screens/AtelierScreen'
import type { TefSkill } from '../content/tefPrepA1'

export type RootStackParamList = {
  MainTabs: undefined
  UnitOverviewScreen: { moduleId: string }
  WritingJournal: { focusTab?: 'new' | 'entries' | 'insights'; editEntryId?: number } | undefined
  JournalEntryDetail: { entryId: number }
  LessonScreen: {
    unitId: string
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
    moduleId?: string
    /** Opened from Home daily plan — used for recommendation engagement */
    fromRecommendation?: boolean
  }
  SpacedReview: { maxItems?: number } | undefined
  TefPrepHub: undefined
  TefPrepUnit: { unit: number }
  TefPrepActivity: { unit: number; skill: TefSkill }
  GrammarAtelier: undefined
}

export type MainTabParamList = {
  Home: undefined
  Syllabus: undefined
  Reading: undefined
  Speaking: undefined
  Leaderboard: undefined
  Account: undefined
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          paddingTop: 6,
          /**
           * No fixed height — lets React Navigation + safe areas adapt on
           * iPhone home indicator, Samsung/Pixel gesture bars, and foldables.
           */
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <FrenchLearnLogo size="sm" />,
          headerTitleAlign: 'left',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Syllabus"
        component={SyllabusScreen}
        options={{
          headerTitle: () => <FrenchLearnLogo size="sm" />,
          headerTitleAlign: 'left',
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
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Account',
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '700', color: '#0f172a' },
        headerTintColor: '#2563eb',
        contentStyle: { backgroundColor: '#f8f9fb' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="UnitOverviewScreen" component={UnitOverviewScreen} options={{ title: 'Unit' }} />
      <Stack.Screen name="WritingJournal" component={WritingJournalScreen} options={{ title: 'Writing journal' }} />
      <Stack.Screen name="JournalEntryDetail" component={JournalEntryDetailScreen} options={{ title: 'Entry' }} />
      <Stack.Screen name="LessonScreen" component={LessonScreen} options={{ title: 'Lesson' }} />
      <Stack.Screen name="SpacedReview" component={SpacedReviewScreen} options={{ title: 'Daily review' }} />
      <Stack.Screen name="TefPrepHub" component={TefPrepHubScreen} options={{ title: 'TEF Prep' }} />
      <Stack.Screen name="TefPrepUnit" component={TefPrepUnitScreen} options={{ title: 'TEF — Unit' }} />
      <Stack.Screen
        name="TefPrepActivity"
        component={TefPrepActivityScreen}
        options={({ route }) => ({
          title:
            route.params.skill === 'listening'
              ? 'TEF Listening'
              : `${route.params.skill} · U${route.params.unit}`,
        })}
      />
      <Stack.Screen
        name="GrammarAtelier"
        component={AtelierScreen}
        options={{
          title: 'Grammar Atelier',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: '#f8fafc',
          headerTitleStyle: { color: '#f8fafc', fontWeight: '700' },
          contentStyle: { backgroundColor: '#e2e8f0' },
        }}
      />
    </Stack.Navigator>
  )
}
