import {useCallback, useEffect} from 'react'
import { BackHandler } from 'react-native'
import {router, useFocusEffect} from 'expo-router'



export function useBackRedirect(route:string) {
    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                router.replace(route)
                return true
            }

            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction
            )

            return () => backHandler.remove()
        }, [route])
    )
}