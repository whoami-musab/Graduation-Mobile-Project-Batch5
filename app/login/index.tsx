import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import * as Authentication from 'expo-local-authentication'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'


const Login = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'
  const passwordInputRef = useRef<TextInput>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authResult, setAuthResult] = useState('');
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsWeb(true);
    }
  }, [])

  useEffect(() => {
    if (authResult.length > 0) {
      Toast.show({
        type: authResult.includes('successful') ? 'success' : 'error',
        text1: authResult,
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      });
    }
  }, [authResult]);

  const handleBiometricAuth = async () => {
    // التأكد اذا كان الجهاز يدعم البصمة
    const isCompatible = await Authentication.hasHardwareAsync();
    if (!isCompatible) {
      setAuthResult('Biometric authentication is not supported on this device.');
      return;
    }
    // التحقق من وجود بصمة\بصمة وجه مسجلة
    const isEnrolled = await Authentication.isEnrolledAsync()
    if (!isEnrolled) {
      setAuthResult('No fingerprints or face registered on this device.');
      return;
    }
    // بدأ عملية المصادقة
    const res = await Authentication.authenticateAsync({
      promptMessage: 'Login with Biometrics',
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false
    })

    // تحقق من تطابق البصمة/بصمة الوجه
    if (res.success) {
      setAuthResult('Authentication successful! ✅');

      // تسجيل الدخول
      router.replace('/dashboard');
    } else {
      setAuthResult('Authentication failed. ❌');
    }
  }

  const handleLogin = () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Please enter both email and password. ❌',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,

      });
      return;
    }
    if (username === 'admin' && password === 'admin') {
      Toast.show({
        type: 'success',
        text1: 'Login successful! ✅',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Invalid credentials. ❌',
      });
      return;
    }
  }

  return (
    <SafeAreaView style={[styles.container, {}]}>
      <ThemedText style={[styles.logo, { backgroundColor: mainBg, color: mainColor }]}>
        AI
      </ThemedText>
      <ThemedText style={[styles.welcomeText, { color: mainColor }]}>Welcome!</ThemedText>
      <View style={[styles.inputContainer]}>
        <TextInput
          style={[styles.input, { color: mainColor, borderColor: mainBg }]}
          value={username}
          onChangeText={(e) => setUsername(e.toLowerCase().trim())}
          placeholder="Email"
          placeholderTextColor={mainColor}
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          returnKeyType='next'
        />
        <TextInput
          style={[styles.input, { color: mainColor, borderColor: mainBg }]}
          placeholder="Password"
          placeholderTextColor={mainColor}
          secureTextEntry
          value={password}
          onChangeText={(e) => setPassword(e)}
          ref={passwordInputRef}
          onSubmitEditing={handleLogin}
          returnKeyType='done'
        />
      </View>
      <View style={[styles.btns, {}]}>
        {
          !isWeb &&
          <TouchableOpacity
            onPress={() => handleBiometricAuth()}
          >
            <Icon name="finger-print" size={55} color={mainColor} />
          </TouchableOpacity>
        }
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: mainBg }]}
          onPress={() => handleLogin()}
        >
          <ThemedText style={[styles.btn_text, { color: mainColor, lineHeight: 26 }]}>Log in</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: mainBg, boxShadow: '0 -8px 30px -50px black' }]}
          onPress={() => router.push('/register')}
        >
          <ThemedText style={[styles.btn_text, { color: mainColor }]}>Create</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedView></ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    fontFamily: 'cursive',
    backgroundColor: '#fafafa'
  },
  logo: {
    fontSize: 42,
    fontWeight: 'semibold',
    padding: 45,
    borderRadius: 15,
    outlineStyle: 'solid',
    outlineColor: '#eee',
    outlineWidth: 8,
    boxShadow: '5px 7px 10px rgb(0, 0, 0)',

  },
  inputContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'none',
  },
  input: {
    width: 300,
    height: 50,
    outline: 'none',
    paddingHorizontal: 15,
    marginVertical: 10,
    fontSize: 18,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderBottomWidth: 2
  },
  welcomeText: {
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '400',
    backgroundColor: 'none',
  },
  btns: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'none',
    gap: 40
  },
  btn: {
    width: '60%',
    paddingVertical: 20,
    borderRadius: 25,
    fontSize: 32
  },
  btn_text: {
    textAlign: 'center',
    fontSize: 24
  }
})

export default Login