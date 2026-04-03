import {Animated, StyleSheet, Text, TextInput, ScrollView, useColorScheme} from "react-native";
import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../components/ThemedText";
import ThemedButton from "../../../../components/ThemedButton";
import ThemedCard from "../../../../components/ThemedCard";
import ThemedLoader from "../../../../components/ThemedLoader";
import {Colors} from "../../../../constants/Colors";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {useIntervenor} from "../../../../hooks/useIntervenor";
import {Intervenor} from "../../../../models/intervenor/Intervenor";
import Spacer from "../../../../components/Spacer";
import {Dropdown} from "react-native-paper-dropdown";
import {PaperProvider} from "react-native-paper";
import ThemedTextInput from "../../../../components/ThemedTextInput";

const MULTI_SELECT_OPTIONS = [
    {label: "Intervenor Identifier", value: "intervenorIdentifier"},
    {label: "Intervenor Identifier Type", value: "intervenorIdentifierType"},
    {label: "Intervenor Name", value: "intervenorName"},
    {label: "Intervenor Phone Number", value: "intervenorPhoneNumber"}, // na API é contactInfo
    {label: "Intervenor Address", value: "intervenorAddress"},
];

const IntervenorCreate = () => {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null);

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
            setError("ID Number cannot be empty");
            return true;
        }
        if (!identifierType.trim()) {
            setError("ID Type cannot be empty");
            return true;
        }
        if (!name.trim()) {
            setError("Name cannot be empty");
            return true;
        }
        if (!phoneNumber.trim()) {
            setError("Phone number cannot be empty");
            return true;
        }
        if (!address.trim()) {
            setError("Address cannot be empty");
            return true;
        }
        return false;
    };


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
                        Create a new Intervenor
                    </ThemedText>
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={"Intervenor Identifier"}
                        onChangeText={setIdentifier}
                        value={identifier}
                    />
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={"Intervenor Identifier Type"}
                        onChangeText={setIdentifierType}
                        value={identifierType}
                    />
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={"Intervenor Name"}
                        onChangeText={setName}
                        value={name}
                    />
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={"Intervenor Phone Number"}
                        onChangeText={setPhoneNumber}
                        value={phoneNumber}
                    />
                    <ThemedTextInput
                        style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                        placeholder={"Intervenor Address"}
                        onChangeText={setAddress}
                        value={address}
                    />

                    <ThemedButton onPress={handleCreate} style={styles.create}>
                        <ThemedText style={{color: '#fff', textAlign: 'center'}}> Create Intervenor</ThemedText>
                    </ThemedButton>

                    <ThemedButton onPress={() => router.back()} style={styles.error}>
                        <ThemedText style={{color: '#fff', textAlign: 'center'}}> Cancel</ThemedText>
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