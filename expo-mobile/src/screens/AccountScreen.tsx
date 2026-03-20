import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  downloadScoreHistoryFromCloud,
  downloadUnitProgressFromCloud,
  syncScoreHistoryToCloud,
  uploadUnitProgressToCloud,
} from '../services/cloudProgress'
import { loadRecentScores, saveRecentScores } from '../lib/history'
import { useTabScreenBottomPadding } from '../lib/screenPadding'

export default function AccountScreen() {
  const { user, loading, configured, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } = useAuth()
  const bottomPad = useTabScreenBottomPadding(28)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [busy, setBusy] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const runSync = async (fn: () => Promise<void>, label: string) => {
    if (!supabase || !user) return
    setBusy(true)
    setSyncMsg(null)
    try {
      await fn()
      setSyncMsg(`${label} — OK`)
    } catch (e) {
      Alert.alert('Sync error', e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const onUploadProgress = () =>
    runSync(() => uploadUnitProgressToCloud(supabase!, user!.id), 'Progress uploaded')

  const onDownloadProgress = () =>
    runSync(() => downloadUnitProgressFromCloud(supabase!, user!.id), 'Progress downloaded')

  const onUploadScores = () =>
    runSync(async () => {
      const scores = await loadRecentScores()
      await syncScoreHistoryToCloud(supabase!, user!.id, scores)
    }, 'Scores uploaded')

  const onDownloadScores = () =>
    runSync(async () => {
      const scores = await downloadScoreHistoryFromCloud(supabase!, user!.id)
      await saveRecentScores(scores)
    }, 'Scores downloaded')

  const submitEmail = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter email and password.')
      return
    }
    setBusy(true)
    const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail
    const { error } = await fn(email, password)
    setBusy(false)
    if (error) Alert.alert(mode === 'signin' ? 'Sign in failed' : 'Sign up failed', error.message)
    else if (mode === 'signup') {
      Alert.alert(
        'Check email',
        'If email confirmation is enabled in Supabase, confirm your address before signing in.',
      )
    }
  }

  const google = async () => {
    setBusy(true)
    const { error } = await signInWithGoogle()
    setBusy(false)
    if (error) Alert.alert('Google sign-in', error.message)
  }

  if (!configured) {
    return (
      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
        <Text className="text-lg font-bold text-slate-900">Account</Text>
        <Text className="mt-2 text-sm text-slate-600">
          Add <Text className="font-mono">EXPO_PUBLIC_SUPABASE_URL</Text> and{' '}
          <Text className="font-mono">EXPO_PUBLIC_SUPABASE_ANON_KEY</Text> to your .env, then restart Metro with{' '}
          <Text className="font-mono">npx expo start --clear</Text>.
        </Text>
      </ScrollView>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (user) {
    return (
      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
        <Text className="text-lg font-bold text-slate-900">Signed in</Text>
        <Text className="mt-1 text-sm text-slate-600">{user.email}</Text>
        <Text className="mt-3 text-xs text-slate-500">
          Lesson progress lives in SQLite on this device. Use the buttons below to back it up or restore from your
          Supabase account.
        </Text>

        {syncMsg ? <Text className="mt-2 text-sm font-semibold text-emerald-700">{syncMsg}</Text> : null}

        <View className="mt-4 gap-2">
          <Pressable
            disabled={busy}
            onPress={() => void onUploadProgress()}
            className="rounded-xl bg-blue-600 py-3 active:opacity-90"
          >
            <Text className="text-center font-bold text-white">Upload lesson progress → cloud</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() => void onDownloadProgress()}
            className="rounded-xl border border-blue-600 py-3 active:bg-blue-50"
          >
            <Text className="text-center font-bold text-blue-700">Download cloud → this device</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() => void onUploadScores()}
            className="rounded-xl bg-indigo-600 py-3 active:opacity-90"
          >
            <Text className="text-center font-bold text-white">Upload AI score history → cloud</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() => void onDownloadScores()}
            className="rounded-xl border border-indigo-600 py-3 active:bg-indigo-50"
          >
            <Text className="text-center font-bold text-indigo-700">Download score history from cloud</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={busy}
          onPress={() => void signOut()}
          className="mt-8 rounded-xl border border-slate-300 py-3"
        >
          <Text className="text-center font-semibold text-slate-800">Sign out</Text>
        </Pressable>
        {busy ? <ActivityIndicator className="mt-4" color="#2563eb" /> : null}
      </ScrollView>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50"
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
        <Text className="text-lg font-bold text-slate-900">Account</Text>
        <Text className="mt-1 text-sm text-slate-600">Sign in to save progress to Supabase (email or Google).</Text>

        <View className="mt-4 flex-row rounded-xl bg-slate-200 p-1">
          <Pressable
            onPress={() => setMode('signin')}
            className={['flex-1 rounded-lg py-2', mode === 'signin' ? 'bg-white shadow-sm' : ''].join(' ')}
          >
            <Text className={['text-center text-sm font-semibold', mode === 'signin' ? 'text-slate-900' : 'text-slate-500'].join(' ')}>
              Sign in
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('signup')}
            className={['flex-1 rounded-lg py-2', mode === 'signup' ? 'bg-white shadow-sm' : ''].join(' ')}
          >
            <Text className={['text-center text-sm font-semibold', mode === 'signup' ? 'text-slate-900' : 'text-slate-500'].join(' ')}>
              Sign up
            </Text>
          </Pressable>
        </View>

        <Text className="mb-1 mt-4 text-xs font-semibold text-slate-500">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#94a3b8"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
        />
        <Text className="mb-1 mt-3 text-xs font-semibold text-slate-500">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
        />

        <Pressable
          disabled={busy}
          onPress={() => void submitEmail()}
          className="mt-5 rounded-xl bg-slate-900 py-3.5 active:opacity-90"
        >
          <Text className="text-center font-bold text-white">{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>
        </Pressable>

        <View className="my-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-slate-200" />
          <Text className="text-xs text-slate-400">or</Text>
          <View className="h-px flex-1 bg-slate-200" />
        </View>

        <Pressable
          disabled={busy}
          onPress={() => void google()}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3"
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text className="font-semibold text-slate-800">Continue with Google</Text>
        </Pressable>

        {busy ? <ActivityIndicator className="mt-6" color="#2563eb" /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
