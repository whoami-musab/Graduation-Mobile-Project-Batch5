import { logoutThunk } from '@/stateManagement/authSlice'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { Alert, BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'
import { useDispatch } from 'react-redux'

const Dashboard = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'
  const router = useRouter()
  const lastPress = useRef(0)

  const dispatch = useDispatch()


    useEffect(()=>{
    const sub = BackHandler.addEventListener('hardwareBackPress', ()=>{
      if(router.canGoBack()){
        return false
      }

      const now = Date.now()

      if(now - lastPress.current < 2000) return false

      lastPress.current = now

      Toast.show({
        type: 'info',
        text1: 'Press again to  exit.',
        position: 'bottom',
        visibilityTime: 1500
      })

      return true

    })
    return ()=> sub.remove()
  }, [router])

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'If you logged out next time you should login with username & password?. Are you sure',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logoutThunk())
            router.replace('/login')
          },
        },
      ],
    { cancelable: true }
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      {/* ===================== Header ===================== */}
      <View style={[styles.header, { backgroundColor: mainBg }]}>
        <Text style={{ color: mainColor, fontSize: 32, fontWeight: '700' }}>DASHBOARD</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name='log-out-outline' size={40} color={mainColor} />
        </TouchableOpacity>
      </View>
      {/* ===================== Content ===================== */}
      <View style={styles.dashboard_content_container}>
        <View style={styles.dashboard_content}>
          <TouchableOpacity
            style={[styles.dashboard_content_divs, { backgroundColor: mainBg }]}
            onPress={()=> router.push('/exam/instructions')}
          >
            <Text style={styles.dashboard_content_divs_text}>
              New Test
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dashboard_content_divs, { backgroundColor: mainBg }]}
            onPress={()=> router.push('/exam/mytest')}
          >
            <Text style={styles.dashboard_content_divs_text}>
              My Tests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dashboard_content_divs, { backgroundColor: mainBg }]}
            onPress={()=>router.push('/profile')}
          >
            <Text style={styles.dashboard_content_divs_text}>
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dashboard_content_divs, { backgroundColor: mainBg }]}
            onPress={()=> null}
          >
            <Text style={styles.dashboard_content_divs_text}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20
  },
  dashboard_content_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  dashboard_content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  dashboard_content_divs: {
    width: '45%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1
  },
  dashboard_content_divs_text: {
    fontSize: 24,
    color: '#47688e'
  }
})

export default Dashboard