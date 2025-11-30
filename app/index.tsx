import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Root = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'
  
  return (
    <SafeAreaView style={[styles.container, {}]}>
      <ThemedText style={[styles.logo, {backgroundColor: mainBg, color: mainColor}]}>
        AI
      </ThemedText>
      <ThemedView style={[styles.welcome_message]}>
        <ThemedText style={[styles.welcomeText, {color: mainColor}]}>Welcome!</ThemedText>
        <ThemedText style={[styles.welcomeText, {color: mainColor}]}>Let&apos;s work on your English, Shall we?</ThemedText>
      </ThemedView>
      <ThemedView style={[styles.btns,{}]}>
        <TouchableOpacity
          style={[styles.btn, {backgroundColor: mainBg}]}
          onPress={()=> router.replace('/login')}
        >
          <ThemedText style={[styles.btn_text, {color: mainColor, lineHeight: 26}]}>Log in</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, {backgroundColor: mainBg, boxShadow: '0 -8px 30px -50px black'}]}
          onPress={()=> router.replace('/register')}
          >
          <ThemedText style={[styles.btn_text, {color: mainColor}]}>Create</ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
  welcome_message: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'none',
    width: '100%'
  },
  welcomeText:{
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '400',
    backgroundColor: 'none',
  },
  btns:{
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'none',
    gap: 80
  },
  btn:{
    width: '60%',
    paddingVertical: 20,
    borderRadius: 25,
    fontSize: 32
  },
  btn_text:{
    textAlign: 'center',
    fontSize: 24
  }
})

export default Root