import {useCallback} from "react";
import { Alert, BackHandler } from 'react-native'
import {useFocusEffect} from "expo-router";

export function useAlertExitApp() {
    useFocusEffect(
        useCallback(() => {

        const backAction = () => {
            Alert.alert(
                'Hold on!',
                'Are you sure you want to go leave the app?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    {
                        text: 'YES',
                        onPress: () => BackHandler.exitApp(),
                    },
                ]
            )

            return true
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )

            return () => backHandler.remove()
        }, [])
    )
}

// https://reactnative.dev/docs/backhandler