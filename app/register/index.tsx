import { ThemedText } from '@/components/themed-text'
import React, { useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const Register = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [step, setStep] = useState(1);


  const handleRegister = () => {
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

  const handleNext = () => {
    // if(!fullName || !username || !email || !phone || !password || !confirmPassword || terms === false){
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Please fill in all fields.',
    //     position: 'top',
    //     autoHide: true,
    //     visibilityTime: 2000,
    //   });
    //   return;
    // }
    if (step === 1 && (!fullName || !username)) {
      Toast.show({
        type: 'error',
        text1: 'Please enter your name and username. ❌',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      });
      return;
    }
    if (step === 2 && (!email || !phone)) {
      Toast.show({
        type: 'error',
        text1: 'Please enter your email and phone. ❌',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      });
      return;
    }
    if (step === 3) {
      if (!password || !confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Please enter and confirm your password. ❌',
          position: 'top',
          autoHide: true,
          visibilityTime: 2000,
        });
        return;
      }
      if (terms === false) {
        Toast.show({
          type: 'error',
          text1: 'You must agree to the Terms and Conditions to register. ❌',
          position: 'top',
          autoHide: true,
          visibilityTime: 2000,
        });
        return;
      }
    }
    setStep(step < 3 ? step + 1 : step)
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
      >
        <View style={{ gap: 20, alignItems: 'center' }}>
          <ThemedText style={[styles.logo, { backgroundColor: mainBg, color: mainColor }]}>
            AI
          </ThemedText>
          <ThemedText style={[styles.welcomeText, { color: mainColor }]}>Welcome!</ThemedText>
          <Text style={{ fontSize: 32, color: mainColor }}>Step: {step} / 3</Text>
        </View>
      </KeyboardAvoidingView>
      <View style={[styles.inputContainer]}>
        {step === 1 && (
          <>
            <TextInput
              style={[styles.input, { color: mainColor, borderColor: mainBg }]}
              value={fullName}
              onChangeText={(e) => setFullName(e.toLowerCase().trim())}
              placeholder="Name ex. Musab Mohamed"
              placeholderTextColor={mainColor}
              onSubmitEditing={() => usernameRef.current?.focus()}
              returnKeyType='next'
            />
            <TextInput
              style={[styles.input, { color: mainColor, borderColor: mainBg }]}
              value={username}
              onChangeText={(e) => setUsername(e.toLowerCase().trim())}
              placeholder="Username"
              placeholderTextColor={mainColor}
              ref={usernameRef}
              onSubmitEditing={handleNext}
              returnKeyType='next'
            />
          </>
        )}
        {step === 2 && (
          <>
            <TextInput
              style={[styles.input, { color: mainColor, borderColor: mainBg }]}
              value={email}
              onChangeText={(e) => setEmail(e.toLowerCase().trim())}
              placeholder="Email"
              placeholderTextColor={mainColor}
              ref={emailRef}
              onSubmitEditing={() => phoneRef.current?.focus()}
              returnKeyType='next'
            />
            <TextInput
              style={[styles.input, { color: mainColor, borderColor: mainBg }]}
              value={phone}
              onChangeText={(e) => setPhone(e.toLowerCase().trim())}
              placeholder="Phone"
              placeholderTextColor={mainColor}
              ref={phoneRef}
              onSubmitEditing={handleNext}
              returnKeyType='next'
            />
          </>
        )}
        {step === 3 && (
          <>
            <TextInput
              style={[styles.input, { color: mainColor, borderColor: mainBg }]}
              placeholder="Password"
              placeholderTextColor={mainColor}
              secureTextEntry
              value={password}
              onChangeText={(e) => setPassword(e)}
              ref={passwordInputRef}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              returnKeyType='next'
            />
            <TextInput
              style={[styles.input, { color: mainColor, borderColor: mainBg }]}
              placeholder="Confirm Password"
              placeholderTextColor={mainColor}
              secureTextEntry
              value={confirmPassword}
              onChangeText={(e) => setConfirmPassword(e)}
              ref={confirmPasswordRef}
              onSubmitEditing={handleRegister}
              returnKeyType='done'
            />
            <View style={styles.terms}>
              <Switch
                value={terms}
                onValueChange={setTerms}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text style={{ color: mainColor }} id='terms'>I agree to the Terms and Conditions</Text>
            </View>
          </>
        )}
        <View style={[styles.btns]}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: mainBg, boxShadow: '0 -8px 30px -50px black' }]}
            onPress={()=> setStep(step > 1 && step <= 3 ? step - 1 : step)}
            disabled={step <= 1}
          >
            <ThemedText style={[styles.btn_text, { color: mainColor }]}>{step > 1 ? 'Previous' : 'Previous'}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: mainBg, boxShadow: '0 -8px 30px -50px black' }]}
            onPress={handleNext}
          >
            <ThemedText style={[styles.btn_text, { color: mainColor }]}>{step === 1 ? 'Next' : step === 2 ? 'Next' : 'Create'}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center'
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'none',
    gap: 20,
    marginVertical: 15
  },
    btn: {
    width: '40%',
    paddingVertical: 20,
    borderRadius: 25,
    fontSize: 32
  },
  terms: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 50
  },
  btn_text: {
    textAlign: 'center',
    fontSize: 24
  }
})

export default Register