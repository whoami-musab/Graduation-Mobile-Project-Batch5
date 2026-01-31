import { logoutThunk } from '@/stateManagement/authSlice'
import { get_exam_details } from '@/stateManagement/examSlice'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

export default function TestDetailsById() {
  const mainBg = '#e9d1cf'
  const mainColor = '#333'

  const dispatch = useDispatch()
  const { id } = useLocalSearchParams()
  const examId = Array.isArray(id) ? id[0] : id

  const { getExamDetails, loading, error } = useSelector((state: any) => state.exam)

  useEffect(() => {
    if (examId) dispatch(get_exam_details(examId))
  }, [dispatch, examId])

  useEffect(()=>{
    if (error === 'Not authenticated' || error === 'Unauthorized') {
    dispatch(logoutThunk())
    router.replace('/login')
  }
  }, [dispatch, error])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red' }}>{String(error)}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const start = getExamDetails.startTime ? new Date(getExamDetails.startTime).toLocaleTimeString() : 'N/A'
  const end = getExamDetails.endTime ? new Date(getExamDetails.endTime).toLocaleTimeString() : 'N/A'

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={[styles.card, { backgroundColor: mainBg }]}>
        <View>
          <Text style={[styles.title, {color: mainColor}]}>Exam Details</Text>
          <Text style={{color: mainColor}}>Level: {getExamDetails.level ?? 'No Level'}</Text>
          <Text style={{color: mainColor}}>Start: {start}</Text>
          <Text style={{color: mainColor}}>End: {end}</Text>
        </View>
        <FlatList
          data={getExamDetails.questions}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={{paddingVertical: 10}}
          renderItem={({ item, index }) => (
            <View style={[styles.qRow, {backgroundColor: '#e6e6e6ff'}]}>
              <Text style={[styles.question, { backgroundColor: mainColor }]}>{index + 1}. {item.question}</Text>
              <Text>Your answer: {item.userAnswer === '' ? 'Not answered' : item.userAnswer}</Text>
              <Text>Correct: {item.correctAnswer || '-'}</Text>
              <Text>Status: {item.isCorrect ? '✅' : '❌'}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    flex: 1,
    backgroundColor: '#e6e6e6ff',
    padding: 10
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6
  },
  qRow: {
    width: '100%',
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    gap: 10
  },
  question: {
    fontWeight: '700',
    padding: 8,
    borderRadius: 10,
    color: '#fff',
    width: '100%',
    lineHeight: 22,
  },
})
