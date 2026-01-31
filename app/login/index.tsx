import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { login } from '@/stateManagement/authSlice'
import * as Authentication from 'expo-local-authentication'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from 'react-redux'

const Login = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'

  const passwordInputRef = useRef<TextInput>(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authResult, setAuthResult] = useState('')
  const [isWeb, setIsWeb] = useState(false)

  const dispatch = useDispatch()
  const router = useRouter()

  const { authStatus, token } = useSelector((state: any) => state.auth)

  useEffect(() => {
    setIsWeb(Platform.OS === 'web')
  }, [])

  useEffect(() => {
    if (authResult.length > 0) {
      Toast.show({
        type: authResult.includes('successful') ? 'success' : 'error',
        text1: authResult,
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      })
    }
  }, [authResult])

  // ============================= Redirect to Dashboard if valid Session ============================= 
  useEffect(()=>{
    if(token && authStatus !== 'LOGGED_OUT'){
      router.replace('/dashboard')
    }
  }, [authStatus, token, router])

  // ============================= Biometric Authentication Handler =============================
  const handleBiometricAuth = async () => {
    const isCompatible = await Authentication.hasHardwareAsync()
    if (!isCompatible) {
      setAuthResult('Biometric authentication is not supported on this device.')
      return
    }

    const isEnrolled = await Authentication.isEnrolledAsync()
    if (!isEnrolled) {
      setAuthResult('No fingerprints or face registered on this device.')
      return
    }

    const res = await Authentication.authenticateAsync({
      promptMessage: 'Login with Biometrics',
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
    })



    if (res.success) {
      const savedToken = await SecureStore.getItemAsync('authToken')
      if (savedToken) {
        router.replace('/dashboard')
      } else {
        setAuthResult('No saved session. Please login first.')
      }
    } else {
      setAuthResult('Authentication failed. ❌')
    }
  }

  // ============================= Authentication Handler =============================
  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Please enter both email and password. ❌',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      })
      return
    }

    try {
      const updatedUsername = username.trim()
      await dispatch(login({ username: updatedUsername, password } )).unwrap()
      router.replace('/dashboard')
      Toast.show({
        type: 'success',
        text1: String('Login Successfully ✅'),
        position: 'top',
        visibilityTime: 2000,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: String(error || 'Login failed ❌'),
        position: 'top',
        visibilityTime: 2000,
      })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText style={[styles.logo, { backgroundColor: mainBg, color: mainColor }]}>
        AI
      </ThemedText>

      <ThemedText style={[styles.welcomeText, { color: mainColor }]}>
        Welcome!
      </ThemedText>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: mainColor, borderColor: mainBg }]}
          value={username}
          onChangeText={setUsername}
          placeholder="Email"
          autoCapitalize='none'
          autoCorrect={false}
          placeholderTextColor={mainColor}
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          returnKeyType="next"
        />

        <TextInput
          style={[styles.input, { color: mainColor, borderColor: mainBg }]}
          placeholder="Password"
          placeholderTextColor={mainColor}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          ref={passwordInputRef}
          onSubmitEditing={handleLogin}
          returnKeyType="done"
        />
      </View>

      <View style={styles.btns}>
        {!isWeb && (
          <TouchableOpacity onPress={handleBiometricAuth}>
            <Icon name="finger-print" size={55} color={mainColor} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.btn, { backgroundColor: mainBg }]} onPress={handleLogin}>
          <ThemedText style={[styles.btn_text, { color: mainColor, lineHeight: 26 }]}>
            Log in
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: mainBg }]}
          onPress={() => router.push('/register')}
        >
          <ThemedText style={[styles.btn_text, { color: mainColor }]}>
            Create
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedView />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  logo: {
    fontSize: 42,
    fontWeight: '600',
    padding: 45,
    borderRadius: 15,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: 300,
    height: 50,
    paddingHorizontal: 15,
    marginVertical: 10,
    fontSize: 18,
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
  },
  welcomeText: {
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '400',
  },
  btns: {
    width: '100%',
    alignItems: 'center',
    gap: 40,
  },
  btn: {
    width: '60%',
    paddingVertical: 20,
    borderRadius: 25,
  },
  btn_text: {
    textAlign: 'center',
    fontSize: 24,
  },
})

export default Login
