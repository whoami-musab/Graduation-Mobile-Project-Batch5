import { get_exams } from '@/stateManagement/examSlice'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

const MyTest = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'
  const dispatch = useDispatch()
  const { oldExams } = useSelector((state: any) => state.exam)

  useEffect(() => {
    dispatch(get_exams()).unwrap()
  }, [dispatch])

  if (!oldExams || oldExams.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#e6e6e6ff' }]}>
        <View style={[styles.no_data_container, { backgroundColor: mainBg }]}>
          <View style={styles.no_data_header}>
            <Text style={styles.no_data_header_text}>There&apos;s no test taken before</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('exam/instructions')}
            style={[styles.new_test_btn]}
          >
            <Text style={styles.btn_text}>Try new test</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.exam_container, { backgroundColor: mainBg }]}>
        {/* ============ Exam data ============ */}
        <View>
          <TouchableOpacity
            onPress={() => router.push('exam/instructions')}
            style={[styles.new_test_btn]}
          >
            <Text style={styles.btn_text}>Try new test</Text>
          </TouchableOpacity>
          <FlatList
            data={oldExams}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const dt = item?.createdAt ? new Date(item?.createdAt) : null;
              const examDate = dt && !isNaN(dt.getTime()) ? dt.toLocaleString() : 'N/A';

              const startTime = item?.startTime ? new Date(item?.startTime) : null;
              const formattedStartTime = startTime && !isNaN(startTime.getTime()) ? startTime.toLocaleTimeString() : 'N/A';

              const endTime = item?.endTime ? new Date(item?.endTime) : null;
              const formattedEndTime = endTime && !isNaN(endTime.getTime()) ? endTime.toLocaleTimeString() : 'N/A';

              return (
                <View style={styles.examsConetnt}>
                  <TouchableOpacity
                    onPress={() => router.push(`exam/details/${item._id}`)}
                    style={styles.examContentHeader}
                  >
                    <Text style={{ color: '#fff', padding: 5 }}>Exam - Details</Text>
                  </TouchableOpacity>
                  <Text>Exam Date: {examDate}</Text>
                  <Text>Start Time: {formattedStartTime} - End Time: {formattedEndTime}</Text>
                  <Text>Level: <Text>{item?.level}</Text></Text>
                </View>
              )
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6e6ff',
    justifyContent: 'center'
  },
  no_data_container: {
    minHeight: '30%',
    width: '85%',
    alignSelf: 'center',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 30,
    padding: 8,
    borderRadius: 15,
    elevation: 3,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.15,
    shadowColor: '#000'
  },
  no_data_header: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    width: '100%'
  },
  no_data_header_text: {
    color: '#fff',
    fontSize: 18
  },
  exam_container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  examsConetnt: {
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
  },
  examContentHeader: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 5,
  },
  new_test_btn: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  btn_text: {
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
  },
});

export default MyTest