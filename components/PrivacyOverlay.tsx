import { BlurView } from 'expo-blur'
import React, { useEffect, useRef, useState } from 'react'
import { AppState, Platform, StyleSheet, View } from 'react-native'

export default function PrivacyOverlay() {
    const [hidden, setHidden] = useState(AppState.currentState !== 'active')
    const t = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            const shouldHide = state === 'inactive' || state === 'background'

            if (t.current) {
                clearTimeout(t.current)
                t.current = null
            }

            if (shouldHide) {
                setHidden(true)
            } else {
                t.current = setTimeout(() => setHidden(false), 150)
            }
        })

        return () => {
            if (t.current) clearTimeout(t.current)
            sub.remove()
        }
    }, [])

    if (!hidden) return null

    if (Platform.OS === 'android') {
        return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />
    }

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <BlurView intensity={80} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
        </View>
    )
}
