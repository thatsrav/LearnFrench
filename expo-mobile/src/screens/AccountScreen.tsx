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
      <ScrollView className="flex-1 bg-[#f8f9fb]" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
        <Text className="font-display text-xl text-slate-900">Account</Text>
        <Text className="font-sans mt-2 text-sm text-slate-600">
          Add <Text className="font-mono">EXPO_PUBLIC_SUPABASE_URL</Text> and{' '}
          <Text className="font-mono">EXPO_PUBLIC_SUPABASE_ANON_KEY</Text> to your .env, then restart Metro with{' '}
          <Text className="font-mono">npx expo start --clear</Text>.
        </Text>
      </ScrollView>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8f9fb]">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (user) {
    return (
      <ScrollView className="flex-1 bg-[#f8f9fb]" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
        <Text className="font-display text-3xl text-slate-900">Bienvenue</Text>
        <Text className="font-sans mt-2 text-sm text-slate-600">Cloud sync and credentials.</Text>
        <Text className="font-sans-semibold mt-4 text-slate-800">{user.email}</Text>
        <Text className="font-sans mt-2 text-xs leading-5 text-slate-500">
          Lesson progress lives in SQLite on this device. Use the buttons below to back up or restore from Supabase.
        </Text>

        {syncMsg ? <Text className="font-sans-semibold mt-3 text-sm text-emerald-700">{syncMsg}</Text> : null}

        <View className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <Ionicons name="person" size={28} color="#4f46e5" />
            </View>
            <View>
              <Text className="font-display text-lg text-slate-900">Scholar</Text>
              <Text className="font-sans text-xs text-slate-500">Connected</Text>
              <View className="mt-1 self-start rounded-full bg-violet-100 px-2 py-0.5">
                <Text className="font-sans text-[10px] font-bold uppercase text-violet-800">Pro</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-5 gap-3">
          <Pressable
            disabled={busy}
            onPress={() => void onUploadProgress()}
            className="rounded-2xl bg-[#2563eb] py-3.5 active:opacity-90"
          >
            <Text className="text-center font-sans-bold text-white">Upload lesson progress → cloud</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() => void onDownloadProgress()}
            className="rounded-2xl border-2 border-[#2563eb] py-3.5 active:bg-blue-50"
          >
            <Text className="text-center font-sans-bold text-[#2563eb]">Download cloud → this device</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() => void onUploadScores()}
            className="rounded-2xl bg-[#4f46e5] py-3.5 active:opacity-90"
          >
            <Text className="text-center font-sans-bold text-white">Upload AI score history → cloud</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() => void onDownloadScores()}
            className="rounded-2xl border-2 border-indigo-600 py-3.5 active:bg-indigo-50"
          >
            <Text className="text-center font-sans-bold text-indigo-700">Download score history from cloud</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={busy}
          onPress={() => void signOut()}
          className="mt-8 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5"
        >
          <Ionicons name="log-out-outline" size={20} color="#475569" />
          <Text className="font-sans-semibold text-slate-800">Sign out</Text>
        </Pressable>
        {busy ? <ActivityIndicator className="mt-4" color="#2563eb" /> : null}
      </ScrollView>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#f8f9fb]"
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
        <Text className="font-display text-3xl text-slate-900">Bienvenue</Text>
        <Text className="font-sans mt-2 text-sm leading-5 text-slate-600">
          Continue your journey toward French mastery in our digital atelier.
        </Text>

        <View className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <Text className="font-sans text-sm text-amber-950">
            <Text className="font-sans-bold">Tip:</Text> sign in to sync progress across devices.
          </Text>
        </View>

        <View className="mt-6 flex-row rounded-2xl bg-slate-200/90 p-1.5">
          <Pressable
            onPress={() => setMode('signin')}
            className={['flex-1 rounded-xl py-2.5', mode === 'signin' ? 'bg-white shadow-sm' : ''].join(' ')}
          >
            <Text
              className={['text-center font-sans-bold text-sm', mode === 'signin' ? 'text-slate-900' : 'text-slate-500'].join(
                ' ',
              )}
            >
              Sign in
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('signup')}
            className={['flex-1 rounded-xl py-2.5', mode === 'signup' ? 'bg-white shadow-sm' : ''].join(' ')}
          >
            <Text
              className={['text-center font-sans-bold text-sm', mode === 'signup' ? 'text-slate-900' : 'text-slate-500'].join(
                ' ',
              )}
            >
              Sign up
            </Text>
          </Pressable>
        </View>

        <View className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <Text className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-500">Email address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            className="font-sans mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
          />
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</Text>
            <Text className="font-sans-bold text-xs text-[#4f46e5]">Forgot?</Text>
          </View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            className="font-sans mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
          />

          <Pressable
            disabled={busy}
            onPress={() => void submitEmail()}
            className="mt-8 rounded-2xl bg-[#1a1c2e] py-3.5 active:opacity-90"
          >
            <Text className="text-center font-sans-bold text-white">
              {mode === 'signin' ? 'Sign in to FrenchLearn' : 'Create your FrenchLearn account'}
            </Text>
          </Pressable>

          <View className="my-6 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-slate-200" />
            <Text className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-400">Or</Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>

          <Pressable
            disabled={busy}
            onPress={() => void google()}
            className="flex-row items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-3.5"
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text className="font-sans-bold text-slate-800">Continue with Google</Text>
          </Pressable>
        </View>

        <View className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-100/80 p-5">
          <Text className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-500">Preview</Text>
          <View className="mt-3 flex-row items-center gap-3">
            <View className="h-12 w-12 rounded-full bg-violet-200" />
            <View>
              <Text className="font-display text-base text-slate-900">Julian Lemaire</Text>
              <Text className="font-sans text-xs text-slate-500">Advanced B2 · Pro member</Text>
            </View>
          </View>
        </View>

        {busy ? <ActivityIndicator className="mt-6" color="#2563eb" /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
