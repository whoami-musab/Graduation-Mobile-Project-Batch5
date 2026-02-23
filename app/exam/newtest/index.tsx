import { router } from 'expo-router'
import * as ScreenCapture from 'expo-screen-capture'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useDispatch, useSelector } from 'react-redux'

import {
  nextQuestion,
  previousQuestion,
  resetExam,
  save_exam,
  saveAnswer,
  saveSpeakingAudio,
  startExam,
} from '@/stateManagement/examSlice'

import { ThemedText } from '@/components/themed-text'

// expo-audio
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'

import { LISTENING_AUDIO, pickAudioKey } from '@/assets/listening/listeningMap'

type RootState = any

const EXAM_SECONDS = 20 * 60
const normalizeType = (t: any) => String(t ?? '').toLowerCase().trim()

const NewTest = () => {
  const mainBg = '#e9d1cf'
  const mainColor = '#47688e'
  const dispatch = useDispatch()

  // ✅ Safe selectors (مهم عشان crash undefined)
  const examState = useSelector((s: RootState) => s?.exam) ?? {}
  const questions: any[] = Array.isArray(examState.questions) ? examState.questions : []
  const currentIndex: number = Number.isFinite(examState.currentIndex) ? examState.currentIndex : 0

  // ✅ studentAnswerByKey لازم object
  const studentAnswerByKey =
    examState?.studentAnswerByKey && typeof examState.studentAnswerByKey === 'object'
      ? examState.studentAnswerByKey
      : {}

  const started: boolean = !!examState.started
  const loading: boolean = !!examState.loading

  const question = questions?.[currentIndex] || null
  const qType = normalizeType(question?.type)
  const isListening = !!question && qType === 'listening'
  const isSpeaking = !!question && qType === 'speaking'

  const [timer, setTimer] = useState('00:00')
  const [isTimeUp, setIsTimeUp] = useState(false)
  const intervalRef = useRef<any>(null)
  const submittedRef = useRef(false)
  const totalSecRef = useRef(0)

  // Listening local index داخل نفس المقطع
  const [listeningLocalIndex, setListeningLocalIndex] = useState(0)

  // ===================== expo-audio: Speaking Recorder =====================
  /**
   * recorder:
   * - useAudioRecorder مع preset
   * - state hook لمعرفة isRecording
   */
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(audioRecorder)
  const isRecording = !!recorderState?.isRecording

  // حفظ التسجيلات حسب index (لـ playback)
  const [recordedByIndex, setRecordedByIndex] = useState<Record<number, { uri: string }>>({})
  const currentRecordingUri = recordedByIndex[currentIndex]?.uri || ''

  // permissions + audio mode (مرة واحدة)
  useEffect(() => {
    ;(async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync()
        if (!status.granted) {
          Toast.show({
            type: 'error',
            text1: 'Microphone permission denied',
            text2: 'Enable microphone permission to record speaking answers.',
            position: 'top',
            visibilityTime: 2500,
          })
          return
        }

        // ✅ minimal mode (لا تستخدم DoNotMix وغيرها لأنها كانت من expo-av)
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        })
      } catch (e) {
        console.log('audio init error:', e)
      }
    })()
  }, [])

  const stopRecordingNow = useCallback(async () => {
    try {
      await audioRecorder.stop()
      const uri = audioRecorder.uri
      if (!uri) return

      const idx = currentIndex
      setRecordedByIndex((prev) => ({ ...prev, [idx]: { uri } }))

      // ✅ file object للـ multipart
      dispatch(
        saveSpeakingAudio({
          index: String(idx),
          file: {
            uri,
            name: `speaking_${idx}.m4a`,
            type: 'audio/m4a',
          },
        })
      )
    } catch (e) {
      console.log('stopRecording error:', e)
    }
  }, [audioRecorder, currentIndex, dispatch])

  const handleRecording = useCallback(async () => {
    if (isTimeUp) return

    if (isRecording) {
      await stopRecordingNow()
      return
    }

    try {
      // امسح تسجيل قديم لنفس السؤال
      setRecordedByIndex((prev) => {
        const copy = { ...prev }
        delete copy[currentIndex]
        return copy
      })

      await audioRecorder.prepareToRecordAsync()
      audioRecorder.record()
    } catch (e) {
      console.log('recording start error:', e)
      Toast.show({
        type: 'error',
        text1: 'Recording failed',
        text2: 'Could not start recording.',
        position: 'top',
        visibilityTime: 2500,
      })
    }
  }, [audioRecorder, currentIndex, isRecording, isTimeUp, stopRecordingNow])

  // لو خرجت من speaking، اقفل التسجيل
  useEffect(() => {
    if (isRecording && !isSpeaking) stopRecordingNow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isSpeaking])

  // ===================== Listening Groups (محلي من assets) =====================
  /**
   * group by audio_id/audio_url... (نفس فكرة الويب)
   * لكن بدلاً من URL remote:
   * - نحول rawUrl لـ key (audio_1)
   * - نجيب require asset من LISTENING_AUDIO
   */
  const listeningGroups = useMemo(() => {
    if (!Array.isArray(questions)) return []
    const map = new Map<any, any>()

    questions.forEach((q: any, globalIndex: number) => {
      if (normalizeType(q?.type) !== 'listening') return

      const audioGroupKey = q.audio_id ?? q.audio_url ?? q.audio ?? q.question

      const rawUrl = q.audio_url ?? q.audio_url_path ?? q.audio ?? q.question
      const fileKey = pickAudioKey(rawUrl)
      const audioAsset = LISTENING_AUDIO[fileKey] ?? null

      if (!map.has(audioGroupKey)) {
        map.set(audioGroupKey, {
          audioKey: audioGroupKey,
          audio_asset: audioAsset,
          audio_fileKey: fileKey,
          items: [],
          startIndex: globalIndex,
          endIndex: globalIndex,
        })
      }

      const group = map.get(audioGroupKey)
      group.items.push({
        ...q,
        globalIndex,
        group_index: Number.isFinite(Number(q.group_index)) ? Number(q.group_index) : 0,
      })
      group.startIndex = Math.min(group.startIndex, globalIndex)
      group.endIndex = Math.max(group.endIndex, globalIndex)
    })

    const groups = Array.from(map.values())
    groups.forEach((g) => g.items.sort((a: any, b: any) => (a.group_index ?? 0) - (b.group_index ?? 0)))
    return groups
  }, [questions])

  const currentListeningGroup = useMemo(() => {
    if (!isListening || !question) return null
    const audioGroupKey = question.audio_id ?? question.audio_url ?? question.audio ?? question.question
    return listeningGroups.find((g: any) => g.audioKey === audioGroupKey) || null
  }, [isListening, question, listeningGroups])

  const listeningItem = currentListeningGroup?.items?.[listeningLocalIndex] || null

  useEffect(() => {
    if (!question) return
    if (!isListening || !currentListeningGroup) {
      setListeningLocalIndex(0)
      return
    }
    const idxInGroup = currentListeningGroup.items.findIndex((it: any) => it.globalIndex === currentIndex)
    setListeningLocalIndex(idxInGroup >= 0 ? idxInGroup : 0)
  }, [currentIndex, isListening, question, currentListeningGroup])

  const skipToAfterListeningGroup = useCallback(() => {
    if (!currentListeningGroup) {
      dispatch(nextQuestion())
      return
    }
    const steps = Math.max(1, currentListeningGroup.endIndex - currentIndex + 1)
    for (let i = 0; i < steps; i++) dispatch(nextQuestion())
    setListeningLocalIndex(0)
  }, [currentListeningGroup, currentIndex, dispatch])

  const skipToBeforeListeningGroup = useCallback(() => {
    if (!currentListeningGroup) {
      dispatch(previousQuestion())
      return
    }
    const steps = Math.max(1, currentIndex - currentListeningGroup.startIndex + 1)
    for (let i = 0; i < steps; i++) dispatch(previousQuestion())
    setListeningLocalIndex(0)
  }, [currentListeningGroup, currentIndex, dispatch])

  const handleListeningNext = useCallback(() => {
    if (!currentListeningGroup) {
      dispatch(nextQuestion())
      return
    }
    if (listeningLocalIndex < currentListeningGroup.items.length - 1) {
      setListeningLocalIndex((x) => x + 1)
      return
    }
    skipToAfterListeningGroup()
  }, [currentListeningGroup, listeningLocalIndex, dispatch, skipToAfterListeningGroup])

  const handleListeningPrev = useCallback(() => {
    if (!currentListeningGroup) {
      dispatch(previousQuestion())
      return
    }
    if (listeningLocalIndex > 0) {
      setListeningLocalIndex((x) => x - 1)
      return
    }
    skipToBeforeListeningGroup()
  }, [currentListeningGroup, listeningLocalIndex, dispatch, skipToBeforeListeningGroup])

  // ===================== Exam lifecycle =====================
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenCapture.preventScreenCaptureAsync()
      return () => {
        ScreenCapture.allowScreenCaptureAsync()
      }
    }
  }, [])

  useEffect(() => {
    if (!started && questions.length > 0) dispatch(startExam())
  }, [started, dispatch, questions.length])

  useEffect(() => {
    if (!loading && started && questions.length === 0) router.replace('/exam/instructions')
  }, [loading, questions.length, started])

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return
    submittedRef.current = true

    try {
      if (isRecording) await stopRecordingNow()

      // ✅ save_exam ONLY
      await dispatch(save_exam()).unwrap()

      Toast.show({
        type: 'success',
        text1: 'Exam Submitted',
        text2: 'Your exam has been submitted successfully.',
        position: 'top',
        visibilityTime: 2000,
      })

      dispatch(resetExam())
      router.push('/dashboard')
    } catch (e) {
      submittedRef.current = false
      console.log('submit error:', e)
      Toast.show({
        type: 'error',
        text1: 'Submission Error',
        text2: 'There was an error submitting your exam.',
        position: 'top',
        visibilityTime: 2500,
      })
    }
  }, [dispatch, isRecording, stopRecordingNow])

  useEffect(() => {
    if (!started) return

    totalSecRef.current = 0
    setTimer('00:00')
    setIsTimeUp(false)

    intervalRef.current = setInterval(() => {
      totalSecRef.current += 1
      const min = String(Math.floor(totalSecRef.current / 60)).padStart(2, '0')
      const sec = String(totalSecRef.current % 60).padStart(2, '0')
      setTimer(`${min}:${sec}`)

      if (totalSecRef.current >= EXAM_SECONDS) {
        clearInterval(intervalRef.current)
        setIsTimeUp(true)
        Toast.show({ type: 'info', text1: 'Time is up!', text2: 'Submitting...', position: 'top' })
        handleSubmit()
      }
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [started, handleSubmit])

  // ===================== Navigation =====================
  const handlePrev = useCallback(() => {
    if (isTimeUp) return
    if (isListening) return handleListeningPrev()
    dispatch(previousQuestion())
  }, [isTimeUp, isListening, handleListeningPrev, dispatch])

  const handleNext = useCallback(() => {
    if (isTimeUp) return
    if (isListening) return handleListeningNext()

    const isLastGlobal = currentIndex === questions.length - 1
    if (isLastGlobal) {
      handleSubmit()
      return
    }
    dispatch(nextQuestion())
  }, [isTimeUp, isListening, handleListeningNext, currentIndex, questions.length, dispatch, handleSubmit])

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#e6e6e6ff' }]}>
        <Text style={{ color: mainColor, fontSize: 18, fontWeight: '700' }}>Loading...</Text>
      </SafeAreaView>
    )
  }

  // answer index (listening uses globalIndex)
  const answerIndex = isListening ? (listeningItem?.globalIndex ?? currentIndex) : currentIndex
  const answerKey = String(answerIndex)

  const qText = String(question?.question || '')
  const hasBlank = !isListening && !isSpeaking && qText.includes('___')
  const splitParts = hasBlank ? qText.split('___') : []

  const listeningProgressText =
    isListening && currentListeningGroup
      ? `Listening: ${listeningLocalIndex + 1}/${currentListeningGroup.items.length}`
      : null

  const isLastGlobal = currentIndex === questions.length - 1
  const isLastListeningLocal =
    isListening && currentListeningGroup
      ? listeningLocalIndex === currentListeningGroup.items.length - 1
      : false

  const shouldShowSubmit = isLastGlobal && (!isListening || isLastListeningLocal)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#e6e6e6ff' }]}>
      {/* Header */}
      <View style={styles.exam_header}>
        <Text style={[styles.text_counter, { color: mainColor }]}>
          {question ? String(question.type) : 'Exam'} {listeningProgressText ? `(${listeningProgressText})` : ''}
        </Text>
        <Text style={[styles.text_counter, { color: mainColor }]}>{timer}</Text>
      </View>

      {/* Body */}
      <View style={styles.questions}>
        {/* LISTENING */}
        {isListening && currentListeningGroup && (
          <View style={{ width: '100%' }}>
            <Text style={[styles.question_text, { paddingVertical: 8 }]}>Listening</Text>

            {currentListeningGroup.audio_asset ? (
              <ListeningPlayer asset={currentListeningGroup.audio_asset} mainColor={mainColor} />
            ) : (
              <Text style={{ color: mainColor, opacity: 0.7 }}>
                Missing audio in assets map: {String(currentListeningGroup.audio_fileKey || '')}
              </Text>
            )}

            <Text style={styles.question_text}>{listeningItem?.question || 'Listening question'}</Text>

            <TextInput
              style={[styles.input_full, { color: mainColor, borderColor: mainColor }]}
              value={studentAnswerByKey?.[answerKey] ?? ''}
              editable={!isTimeUp}
              onChangeText={(text) => {
                const value = text.replace(/[^a-zA-Z0-9\s']/g, '')
                dispatch(saveAnswer({ index: answerKey, answer: value }))
              }}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Type your answer..."
              placeholderTextColor={mainColor}
            />
          </View>
        )}

        {/* SPEAKING */}
        {isSpeaking && question && (
          <View style={{ width: '100%' }}>
            <Text style={[styles.question_text, { paddingVertical: 8 }]}>Speaking</Text>

            <TouchableOpacity
              style={[
                styles.micBtn,
                { borderColor: mainColor, backgroundColor: isRecording ? '#ffd1d1' : mainBg },
              ]}
              onPress={handleRecording}
              disabled={isTimeUp}
            >
              <Text style={{ color: mainColor, fontWeight: '800', fontSize: 18 }}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.question_text}>{question.question || 'Speaking question'}</Text>

            {currentRecordingUri ? (
              <Playback uri={currentRecordingUri} mainColor={mainColor} />
            ) : (
              <Text style={{ color: mainColor, opacity: 0.7 }}>No recording yet.</Text>
            )}
          </View>
        )}

        {/* OTHER */}
        {!isListening && !isSpeaking && question && (
          <View style={{ width: '100%' }}>
            <Text style={[styles.question_text, { paddingVertical: 8 }]}>
              {qType === 'fill_blanks' ? 'Fill in blanks' : qType === 'vocabulary' ? 'Vocabulary' : 'Grammar'}
            </Text>

            {hasBlank ? (
              <View style={[styles.question_row]}>
                <Text style={styles.question_text}>{splitParts[0]}</Text>
                <TextInput
                  style={[styles.question_input, { color: mainColor, borderColor: mainColor }]}
                  value={studentAnswerByKey?.[String(currentIndex)] ?? ''}
                  editable={!isTimeUp}
                  onChangeText={(text) => {
                    const value = text.replace(/[^a-zA-Z0-9\s']/g, '')
                    dispatch(saveAnswer({ index: String(currentIndex), answer: value }))
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={mainColor}
                />
                <Text style={styles.question_text}>{splitParts[1]}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.question_text}>{qText}</Text>
                <TextInput
                  style={[styles.input_full, { color: mainColor, borderColor: mainColor }]}
                  value={studentAnswerByKey?.[String(currentIndex)] ?? ''}
                  editable={!isTimeUp}
                  onChangeText={(text) => {
                    const value = text.replace(/[^a-zA-Z0-9\s']/g, '')
                    dispatch(saveAnswer({ index: String(currentIndex), answer: value }))
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Type your answer..."
                  placeholderTextColor={mainColor}
                />
              </>
            )}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.btns}>
        <TouchableOpacity onPress={handlePrev} disabled={isTimeUp}>
          <ThemedText style={[styles.btn_text, { color: '#686666', lineHeight: 26 }]}>Prev</ThemedText>
        </TouchableOpacity>

        {shouldShowSubmit ? (
          <TouchableOpacity style={[styles.btn, { backgroundColor: mainBg }]} onPress={handleSubmit} disabled={isTimeUp}>
            <ThemedText style={[styles.btn_text, { color: mainColor }]}>Submit</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, { backgroundColor: mainBg }]} onPress={handleNext} disabled={isTimeUp}>
            <ThemedText style={[styles.btn_text, { color: mainColor }]}>Next</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {isListening && currentListeningGroup ? (
        <Text style={{ width: '90%', color: mainColor, opacity: 0.7, marginTop: 6 }}>
          This audio contains {currentListeningGroup.items.length} question(s). Use Prev/Next inside same audio.
        </Text>
      ) : null}
    </SafeAreaView>
  )
}

/**
 * ListeningPlayer
 * --------------
 * يشغل audio asset محلي (require) باستخدام expo-audio player hooks.
 * - asset لازم يكون require(...) وليس path string.
 */
const ListeningPlayer = ({ asset, mainColor }: { asset: any; mainColor: string }) => {
  const player = useAudioPlayer(asset, { updateInterval: 400 })
  const status = useAudioPlayerStatus(player)

  const toggle = useCallback(() => {
    if (status?.playing) player.pause()
    else {
      if (status?.didJustFinish) player.seekTo(0)
      player.play()
    }
  }, [player, status?.playing, status?.didJustFinish])

  return (
    <TouchableOpacity style={[styles.audioBtn, { borderColor: mainColor }]} onPress={toggle}>
      <Text style={{ color: mainColor, fontWeight: '800' }}>
        {status?.playing ? 'Pause Audio' : 'Play Audio'}
      </Text>
    </TouchableOpacity>
  )
}

/**
 * Playback
 * --------
 * لتشغيل تسجيل الطالب من URI.
 */
const Playback = ({ uri, mainColor }: { uri: string; mainColor: string }) => {
  const player = useAudioPlayer({ uri }, { updateInterval: 400 })
  const status = useAudioPlayerStatus(player)

  const toggle = useCallback(() => {
    if (status?.playing) player.pause()
    else {
      if (status?.didJustFinish) player.seekTo(0)
      player.play()
    }
  }, [player, status?.playing, status?.didJustFinish])

  return (
    <TouchableOpacity style={[styles.audioBtn, { borderColor: mainColor, marginTop: 10 }]} onPress={toggle}>
      <Text style={{ color: mainColor, fontWeight: '800' }}>
        {status?.playing ? 'Pause Recording' : 'Play Recording'}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-around', alignItems: 'center', position: 'relative' },
  exam_header: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  text_counter: { fontSize: 18, fontWeight: '800' },
  questions: { width: '90%', alignItems: 'flex-start' },
  question_row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', width: '100%' },
  question_text: { color: '#47688e', lineHeight: 30, fontWeight: 'bold', fontSize: 20, paddingVertical: 10 },
  question_input: { width: 140, paddingHorizontal: 8, paddingVertical: 4, marginHorizontal: 6, borderWidth: 2, fontSize: 18, borderRadius: 10 },
  input_full: { width: '100%', paddingHorizontal: 10, paddingVertical: 10, borderWidth: 2, fontSize: 18, borderRadius: 10 },
  btns: { width: '90%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderStyle: 'solid', borderWidth: 1 },
  btn_text: { fontSize: 20 },
  audioBtn: { width: '100%', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  micBtn: { width: '100%', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
})

export default NewTest