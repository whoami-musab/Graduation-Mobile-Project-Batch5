import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import React from 'react'
import { StyleSheet } from 'react-native'

const Dashboard = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Dashboard</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    },
})

export default Dashboard