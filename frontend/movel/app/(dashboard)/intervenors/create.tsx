import {Animated, StyleSheet, Text, TextInput, ScrollView, useColorScheme} from "react-native";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import ThemedCard from "../../../components/ThemedCard";
import ThemedLoader from "../../../components/ThemedLoader";
import {Colors} from "@commons/constants/Colors";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {useIntervenor} from "../../../hooks/useIntervenor";
import Spacer from "../../../components/Spacer";
import {Dropdown} from "react-native-paper-dropdown";
import {PaperProvider} from "react-native-paper";
import ThemedTextInput from "../../../components/ThemedTextInput";
import {useBackRedirect} from "../../../hooks/useBackRedirect";
import {useTranslation} from "react-i18next";

const IntervenorCreate = () => {
    const {t} = useTranslation()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null);

    useBackRedirect("/intervenor")

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const {createIntervenor} = useIntervenor();

    const [name, setName] = useState<string>("")
    const [identifier, setIdentifier] = useState<string>("")
    const [identifierType, setIdentifierType] = useState<string>("")
    const [phoneNumber, setPhoneNumber] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        try {
            setError(null)
            if (checkErrors()) return
            setLoading(true)
            await createIntervenor(identifier, identifierType, name, phoneNumber, address)
            router.back()
        } catch (err: any) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    const checkErrors = (): boolean => {
        if (!identifier.trim()) {
            setError(t("intervenorCreate.idNumberEmpty"));
            return true;
        }
        if (!identifierType.trim()) {
            setError(t("intervenorCreate.idTypeEmpty"));
            return true;
        }
        if (!name.trim()) {
            setError(t("intervenorCreate.nameEmpty"));
            return true;
        }
        if (!phoneNumber.trim()) {
            setError(t("intervenorCreate.phoneNumberEmpty"));
            return true;
        }
        if (!address.trim()) {
            setError(t("intervenorCreate.addressEmpty"));
            return true;
        }
        return false;
    };

    useFocusEffect(
        useCallback(() => {
            return () => {
                setIdentifier("")
                setIdentifierType("")
                setAddress("")
                setPhoneNumber("")
                setName("")
                setError(null)
            }
        }, [])
    )


    if (loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        );
    }
    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView>
                <ThemedCard style={styles.card}>
                    <ThemedText title={true} style={styles.heading}>
                        {t("intervenorCreate.intervenorMessage")}
                    </ThemedText>
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={t("intervenorCreate.intervenorId")}
                        onChangeText={setIdentifier}
                        value={identifier}
                    />
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={t("intervenorCreate.intervenorIdType")}
                        onChangeText={setIdentifierType}
                        value={identifierType}
                    />
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={t("intervenorCreate.intervenorName")}
                        onChangeText={setName}
                        value={name}
                    />
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={t("intervenorCreate.intervenorPhoneNumber")}
                        keyboardType="phone-pad"
                        onChangeText={setPhoneNumber}
                        value={phoneNumber}
                    />
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={t("intervenorCreate.intervenorAddress")}
                        onChangeText={setAddress}
                        value={address}
                    />

                    {error && <Text style={styles.error}>{error}</Text>}

                    <ThemedButton onPress={handleCreate} style={styles.create}>
                        <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("intervenorCreate.createIntervenor")}</ThemedText>
                    </ThemedButton>

                    <ThemedButton onPress={() => router.back()} style={styles.error}>
                        <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("intervenorCreate.cancel")}</ThemedText>
                    </ThemedButton>
                </ThemedCard>
            </ScrollView>
        </ThemedView>

    )
}

export default IntervenorCreate;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "stretch",
    },
    title: {
        fontSize: 22,
        marginVertical: 10,
    },
    card: {
        margin: 20
    },
    create: {
        marginTop: 40,
        backgroundColor: Colors.success,
        width: 200,
        alignSelf: "center",
    },
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    },
    update: {
        marginTop: 40,
        backgroundColor: Colors.update,
        width: 200,
        alignSelf: "center",
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center'
    }
});