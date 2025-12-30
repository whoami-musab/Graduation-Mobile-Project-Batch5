import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/Ionicons'

const Dashboard = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'
  
  return (
    <View style={[styles.container, {backgroundColor: '#fff'}]}>
      <View style={[styles.header, {}]}>
        <Text style={[, {color: mainBg, fontSize: 42, fontWeight: '700'}]}>DASHBOARD</Text>
        <TouchableOpacity onPress={()=>{
          Toast.show({
            type: 'info',
            text1: 'Loged out Successful!.'
          })
        }}>
          <Icon name='log-out-outline' size={52} color={mainBg} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    },
    header:{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%'
    }
})

export default Dashboard