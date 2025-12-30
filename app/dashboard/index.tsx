import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'

const Dashboard = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'

  const ToastInfo = () => {
    return Toast.show({ type: 'info', text1: 'Pressed' })
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      {/* ===================== Header ===================== */}
      <View style={[styles.header, { backgroundColor: mainBg }]}>
        <Text style={{ color: mainColor, fontSize: 32, fontWeight: '700' }}>DASHBOARD</Text>
        <TouchableOpacity onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'Loged out Successful!.'
          })
        }}>
          <Icon name='log-out-outline' size={40} color={mainColor} />
        </TouchableOpacity>
      </View>
      {/* ===================== Content ===================== */}
      <View style={styles.dashboard_content_container}>
        <View style={styles.dashboard_content}>
          <TouchableOpacity
            style={[styles.dashboard_content_divs, { backgroundColor: mainBg }]}
            onPress={ToastInfo}
          >
            <Text style={styles.dashboard_content_divs_text}>
              New Test
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dashboard_content_divs, { backgroundColor: mainBg }]}
            onPress={ToastInfo}
          >
            <Text style={styles.dashboard_content_divs_text}>
              My Tests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dashboard_content_divs, { backgroundColor: mainBg }]}
            onPress={ToastInfo}
          >
            <Text style={styles.dashboard_content_divs_text}>
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dashboard_content_divs, { backgroundColor: mainBg }]}
            onPress={ToastInfo}
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