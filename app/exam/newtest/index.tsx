import { ThemedText } from '@/components/themed-text'
import { nextQuestion, previousQuestion, save_exam, saveAnswer, startExam, submit_exam } from '@/stateManagement/examSlice'
import { router } from 'expo-router'
import * as ScreenCapture from 'expo-screen-capture'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useDispatch, useSelector } from 'react-redux'

const NewTest = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'
  const [studentData, setStudentData] = useState([])
  const [timer, setTimer] = useState('00:00')

  const intervalRef = useRef(null);

  const { questions, currentIndex, studentAnswer, started, loading } = useSelector((state: any) => state.exam);
  const question = questions ? questions[currentIndex] : null
  const parts = question ? question.question.split('___') : []
  const [isTimeUp, setIsTimeUp] = useState(false)
  const submittedRef = useRef(false)
  const totalSecRef = useRef(0)

  const dispatch = useDispatch()

  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenCapture.preventScreenCaptureAsync()
      return () => {
        ScreenCapture.allowScreenCaptureAsync()
      }
    }
  }, [])

  useEffect(() => {
    if (!loading && started && questions.length === 0) {
      router.replace('/exam/instructions')
    }
  }, [loading, questions.length, started])

  useEffect(()=>{
    if(!started && questions.length > 0) dispatch(startExam())
  }, [started, dispatch, questions.length])

  // ==================== Submit Exam Handler =======================
  const handleSubmit = useCallback(async () => {
    try {
      if (submittedRef.current) return;
      submittedRef.current = true;

      const examResult = await dispatch(submit_exam()).unwrap();
      await dispatch(save_exam(examResult)).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Your exam has been submitted successfully.',
        position: 'top',
        visibilityTime: 2000
      })
      router.push('/dashboard')
    } catch (error) {
      submittedRef.current = false;
      console.error('Error submitting exam:', error);
      Toast.show({
        type: 'error',
        text1: 'There was an error submitting your exam. Please try again.',
        position: 'top',
        visibilityTime: 2000
      })
      return;
    }
  }, [dispatch])

  useEffect(() => {
    if (!started) return;
    totalSecRef.current = 0
    setTimer('00:00')

    intervalRef.current = setInterval(() => {
      totalSecRef.current += 1

      const min = String(Math.floor(totalSecRef.current / 60)).padStart(2, '0');
      const sec = String(totalSecRef.current % 60).padStart(2, '0');
      setTimer(`${min}:${sec}`);
      // ------------------------------- Stop exam at 20 minutes -------------------------------
      if (min === '20' && sec === '00') {
        clearInterval(intervalRef.current);
        setIsTimeUp(true);
        Toast.show({
          type: 'info',
          text1: 'Your exam time has ended. Submitting your answers.',
        })
        handleSubmit()
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [started, handleSubmit]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#e6e6e6ff' }]}>
      <View style={styles.exam_header}>
        <Text style={[styles.text_counter, { color: mainColor }]}>{currentIndex + 1 + ' of ' + questions.length}</Text>
        <Text style={[styles.text_counter, { color: mainColor }]}>{timer}</Text>
      </View>
      <View style={styles.questions}>
        <Text style={styles.question_text}>{question?.type === 'fill_blanks' ? 'Fill in blanks' : question?.type === 'vocabulary' ? 'Vocabulary' : 'Grammar'}</Text>
        <View style={styles.question_container}>
          {
            question &&
            <View style={[styles.question_row]}>
              <Text style={styles.question_text}>{parts[0]}</Text>
              <TextInput
                style={[styles.question_input, { color: mainColor, borderColor: mainColor }]}
                value={studentAnswer[currentIndex] || ''}
                onChangeText={
                  (text) => {
                    
                    dispatch(saveAnswer({ index: currentIndex, answer: text }))
                  }
                }
                autoCapitalize='none'
                autoCorrect={false}
                placeholderTextColor={mainColor}
              />
                <Text style={styles.question_text}>{parts[1]}</Text>
            </View>
          }
        </View>
      </View>
      <View style={styles.btns}>
        <TouchableOpacity onPress={()=> dispatch(previousQuestion())}>
          <ThemedText style={[styles.btn_text, { color: '#686666', lineHeight: 26 }]}>
            Prev
          </ThemedText>
        </TouchableOpacity>

          {
            currentIndex === questions.length -1 ?
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: mainBg }]}
            onPress={handleSubmit}
          >
            <ThemedText style={[styles.btn_text, { color: mainColor }]}>
              Submit
            </ThemedText>
          </TouchableOpacity>
          :
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: mainBg }]}
            onPress={()=> dispatch(nextQuestion())}
            disabled={isTimeUp}
          >
            <ThemedText style={[styles.btn_text, { color: mainColor }]}>
              Next
            </ThemedText>
          </TouchableOpacity>
        }
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'relative'
  },
  exam_header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  text_counter: {
    fontSize: 32,
    fontWeight: '700'
  },
  questions: {
    width: '90%',
    alignItems: 'flex-start'
  },
  question_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%'
  },
  question_row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%'
  },
  question_text: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    color: '#47688e',
    lineHeight: 35,
    fontWeight: 'bold',
    fontSize: 22,
    paddingVertical: 15,
  },
  question_input: {
    width: 140,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 6,
    borderWidth: 2,
    fontSize: 18,
    borderRadius: 10
  },
  btns: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1
  },
  btn_text:{
    fontSize: 22
  }
})

export default NewTest