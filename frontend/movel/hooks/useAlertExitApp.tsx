import {useCallback} from "react";
import { Alert, BackHandler } from 'react-native'
import {useFocusEffect} from "expo-router";
import {useTranslation} from "react-i18next";

export function useAlertExitApp() {
    const {t} = useTranslation()

    useFocusEffect(
        useCallback(() => {

        const backAction = () => {
            Alert.alert(
                t("exitApp.title"),
                t("exitApp.message"),
                [
                    {
                        text: t("exitApp.cancel"),
                        onPress: () => null,
                        style: 'cancel',
                    },
                    {
                        text: t("exitApp.confirm"),
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