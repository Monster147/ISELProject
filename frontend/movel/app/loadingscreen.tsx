import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, Animated, Easing } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import Logo from "../assets/img/isel.png";
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import Spacer from "../components/Spacer";
import Home from "./home";
import {useTranslation} from "react-i18next";

const DURATION_MS = 4000;

const LoadingScreen = ()=> {
    const {t} = useTranslation()
    const { token, isAuthLoading } = useAuth();

    const progress = useRef(new Animated.Value(0)).current;
    const [animationDone, setAnimationDone] = useState(false);

    useEffect(() => {
        const anim = Animated.timing(progress, {
            toValue: 1,
            duration: DURATION_MS,
            easing: Easing.linear,
            useNativeDriver: false,
        });

        anim.start(({ finished }) => {
            if (finished) setAnimationDone(true);
        });

        return () => {
            anim.stop();
        };
    }, [progress]);

    const barWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    const finished = !isAuthLoading && animationDone;

    if (finished) {
        if (token) return <Redirect href="/occurrence" />;
        return <Redirect href="/home" />;
    }

    return (
        <ThemedView style={styles.container}>
            <Image source={Logo}/>
            <ThemedText style={styles.title}>{t("home.appName")}</ThemedText>
            <Spacer height={20} />
            <ThemedView style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: barWidth }]} />
            </ThemedView>
        </ThemedView>
    );
}

export default LoadingScreen

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title:{
        fontWeight: 'bold',
        fontSize: 18,
        color: 'purple'
    },
    progressTrack: {
        width: 250,
        height: 12,
        backgroundColor: "#E0E0E0",
        borderRadius: 6,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#1976D2",
    },
});
