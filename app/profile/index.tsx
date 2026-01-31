import { getUserData } from '@/stateManagement/authSlice'
import * as ScreenCapture from 'expo-screen-capture'
import React, { useEffect } from 'react'
import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from 'react-redux'

const Profile = () => {
    const mainBg = '#e9d1cf'
    const mainColor = '#47688e'

    const dispatch = useDispatch()
    const { userData } = useSelector((state: any) => state.auth)

    useEffect(() => {
        if (Platform.OS !== 'web') {
            ScreenCapture.preventScreenCaptureAsync()
            return () => {
                ScreenCapture.allowScreenCaptureAsync()
            }
        }
    }, [])

    useEffect(() => {
        if (!userData) dispatch(getUserData())
    }, [dispatch, userData])

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#e6e6e6ff' }]}>
            <View style={[styles.profile_container, { backgroundColor: mainBg }]}>
                <View style={styles.header}>
                    <View style={styles.header_img}>
                        {userData?.img ?
                                (
                                    <Image source={{ uri: userData.img }} alt='profile' style={{ width: 100, height: 100 }} />
                                )
                                :
                                (
                                    <Icon name='person-circle-outline' color={mainColor} size={100} />
                                )}
                    </View>
                    <View style={styles.header_text}>
                        <Text style={styles.header_text_text}>{userData?.username}</Text>
                        <Text style={styles.header_text_text}>&lt; {userData?.level === null ? 'No Level' : userData?.level} &gt;</Text>
                    </View>
                </View>
                <View style={styles.profile_data}>
                    <View style={styles.data_container}>
                        <Text style={[styles.text_icon]}>
                            <Icon name='chevron-forward-outline' color={mainColor} size={32} />
                        </Text>
                        <Text style={styles.profile_data_text}>{userData?.username}</Text>
                    </View>
                    <View style={styles.data_container}>
                        <Text style={styles.text_icon}>
                            <Icon name='chevron-forward-outline' color={mainColor} size={32} />
                        </Text>
                        <Text style={styles.profile_data_text}>
                            {userData?.phone}
                        </Text>
                    </View>
                    <View style={styles.data_container}>
                        <Text style={styles.text_icon}>
                            <Icon name='chevron-forward-outline' color={mainColor} size={32} />
                        </Text>
                        <Text style={styles.profile_data_text}>
                            {userData?.email}
                        </Text>
                    </View>
                    <View style={styles.data_container}>
                        <Text style={[styles.text_icon]}>
                            <Icon name='chevron-forward-outline' color={mainColor} size={32} />
                        </Text>
                        <Text style={styles.profile_data_text}>
                            {userData?.level === null ? 'No Level' : userData?.level}
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    profile_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    header: {
        width: '100%',
        minHeight: '30%',
        backgroundColor: '#fff',
        overflow: 'hidden',
        position: 'relative',
    },
    header_img: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 30
    },
    header_text: {
        fontSize: 24,
        gap: 10,
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    header_text_text: {
        fontSize: 24
    },
    profile_data: {
        flex: 1,
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 30
    },
    data_container: {
        flexDirection: 'row',
        width: '100%'
    },
    profile_data_text: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#beaaa983',
        fontSize: 18,
        width: '100%',
        padding: 5,
        borderTopEndRadius: 10,
        borderBottomEndRadius: 10
    },
    text_icon: {
        backgroundColor: '#fafafaff',
        height: '100%',
        justifyContent: 'center',
        textAlignVertical: 'center'
    }
})

export default Profile