import { ThemedText } from '@/components/themed-text'
import { make_exam, resetExam, startExam } from '@/stateManagement/examSlice'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useDispatch } from 'react-redux'

const Instructions = () => {
    const mainBg = '#e9d1cf'
    const mainColor = '#47688e'

    const [terms, setTerms] = useState(false)
    const dispatch = useDispatch()
    const router = useRouter()

    const handleExam = async () => {
        if (terms === false) {
            Toast.show({
                type: 'info',
                text1: 'You should agree the test terms to continue.',
                position: 'top',
                visibilityTime: 2000
            })
            return
        }

        try {
            dispatch(resetExam())
            await dispatch(make_exam()).unwrap()
            dispatch(startExam());
            router.push('/exam/newtest');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: String(error) || 'Failed to start the exam. Please try again.',
                position: 'top',
                visibilityTime: 2000
            });
        }

    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.form_container}>
                <Text style={{ color: mainColor }}>
                    Test Instructions. Read carefully!.
                </Text>
                <View style={styles.instructions}>
                    <Text style={[styles.instructions_text, {}]}>1. Make sure you have a stable internet connection throughout the test.</Text>
                    <Text style={[styles.instructions_text, {}]}>2. Do not navigate or back away during the test.</Text>
                    <Text style={[styles.instructions_text, {}]}>3. Each question must be answered within the allotted time.</Text>
                    <Text style={[styles.instructions_text, {}]}>4. Exam time is just 20 minutes.</Text>
                    <Text style={[styles.instructions_text, {}]}>5. Be careful before submitting your answer.</Text>
                    <Text style={[styles.instructions_text, {}]}>6. Once you submit your answers, you cannot change them.</Text>
                    <Text style={[styles.instructions_text, {}]}>7. Good luck.</Text>
                </View>
                <View style={styles.terms}>
                    <Switch
                        value={terms}
                        onValueChange={setTerms}
                        style={{ width: 20, height: 20, marginRight: 10 }}
                    />
                    <Text style={{ color: mainColor }} id='terms'>I agree to the Terms and Conditions</Text>
                </View>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: mainBg }]} onPress={handleExam}>
                <ThemedText style={[styles.btn_text, { color: mainColor, lineHeight: 26 }]}>
                    Next
                </ThemedText>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    form_container: {
        width: '100%',
        height: '80%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    instructions: {
        width: '90%',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    terms: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    instructions_text: {
        color: '#47688e',
        lineHeight: 35,
        fontWeight: 'bold',
    },
    btn: {
        width: '60%',
        paddingVertical: 20,
        borderRadius: 25,
    },
    btn_text: {
        textAlign: 'center',
        fontSize: 24,
    },
})

export default Instructions