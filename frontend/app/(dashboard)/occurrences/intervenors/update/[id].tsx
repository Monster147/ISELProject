import {Animated, StyleSheet, Text, TextInput, ScrollView, useColorScheme} from "react-native";
import ThemedView from "../../../../../components/ThemedView";
import ThemedText from "../../../../../components/ThemedText";
import ThemedButton from "../../../../../components/ThemedButton";
import ThemedCard from "../../../../../components/ThemedCard";
import ThemedLoader from "../../../../../components/ThemedLoader";
import {Colors} from "../../../../../constants/Colors";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useEffect, useState} from "react";
import {useIntervenor} from "../../../../../hooks/useIntervenor";
import {Intervenor} from "../../../../../models/intervenor/Intervenor";
import Spacer from "../../../../../components/Spacer";
import {Dropdown, MultiSelectDropdown} from "react-native-paper-dropdown";
import {PaperProvider} from "react-native-paper";
import ThemedTextInput from "../../../../../components/ThemedTextInput";

const MULTI_SELECT_OPTIONS = [
    {label: "Intervenor Identifier", value: "intervenorIdentifier"},
    {label: "Intervenor Identifier Type", value: "intervenorIdentifierType"},
    {label: "Intervenor Name", value: "intervenorName"},
    {label: "Intervenor Phone Number", value: "intervenorPhoneNumber"},
    {label: "Intervenor Address", value: "intervenorAddress"},
]

const IntervenorUpdate = () => {
    const {id} = useLocalSearchParams()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null);
    const [change, setChange] = useState<string[]>([]);
    const selected = (key: string) => change.includes(key);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const {findIntervenorById, updateIntervenor} = useIntervenor();
    const intervenorId = Number(id)

    const [intervenor, setIntervenor] = useState<Intervenor | null>(null);
    const [name, setName] = useState<string | null>(null)
    const [identifier, setIdentifier] = useState<string | null>(null)
    const [identifierType, setIdentifierType] = useState<string | null>(null)
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
    const [address, setAddress] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const intervenorData = await findIntervenorById(intervenorId)
                setIntervenor(intervenorData)
                setName(intervenorData.name)
                setIdentifier(intervenorData.idNumber)
                setIdentifierType(intervenorData.idType)
                setPhoneNumber(intervenorData.contactInfo)
                setAddress(intervenorData.address)
            } catch (err: any) {
                if (err instanceof Error) setError(err.message);
                else setError(String(err));
            } finally {
                setLoading(false);
            }
        }
        load()
    }, [intervenorId])

    const handleUpdate = async () => {
        try {
            setError(null);
            setLoading(true);
            await updateIntervenor(intervenorId, identifier, identifierType, name, phoneNumber, address);
            router.back();
        } catch (err: any) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        );
    }

    return (
        <PaperProvider>
            <ThemedView safe style={styles.container}>
                <ScrollView>
                    <ThemedCard style={styles.card}>
                        <ThemedText title style={styles.title}>
                            Update Intervenor
                        </ThemedText>
                        <MultiSelectDropdown
                            label={"Select fields to update"}
                            placeholder={"Select fields to update"}
                            options={MULTI_SELECT_OPTIONS}
                            value={change}
                            onSelect={setChange}
                        />

                        {change.includes("intervenorIdentifier") && (
                            <ThemedTextInput
                                style={{width: "80%", margin: 20, backgroundColor: theme.uiBackground2}}
                                placeholder="Enter ID Number"
                                onChangeText={setIdentifier}
                                value={identifier}
                            />
                        )}

                        {change.includes("intervenorIdentifierType") && (
                            <ThemedTextInput
                                style={{width: "80%", margin: 20, backgroundColor: theme.uiBackground2}}
                                placeholder="Enter ID Type"
                                onChangeText={setIdentifierType}
                                value={identifierType}
                            />
                        )}

                        {change.includes("intervenorName") && (
                            <ThemedTextInput
                                style={{width: "80%", margin: 20, backgroundColor: theme.uiBackground2}}
                                placeholder="Enter name"
                                onChangeText={setName}
                                value={name}
                            />
                        )}

                        {change.includes("intervenorPhoneNumber") && (
                            <ThemedTextInput
                                style={{width: "80%", margin: 20, backgroundColor: theme.uiBackground2}}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                                onChangeText={setPhoneNumber}
                                value={phoneNumber}
                            />
                        )}

                        {change.includes("intervenorAddress") && (
                            <ThemedTextInput
                                style={{width: "80%", margin: 20, backgroundColor: theme.uiBackground2}}
                                placeholder="Enter address"
                                onChangeText={setAddress}
                                value={address}
                            />
                        )}

                        {change && <ThemedButton onPress={handleUpdate} style={styles.update}>
                            <ThemedText style={{color: '#fff', textAlign: 'center'}}>Save changes</ThemedText>
                        </ThemedButton>
                        }

                        <ThemedButton onPress={() => router.back()} style={styles.error}>
                            <ThemedText style={{color: '#fff', textAlign: 'center'}}> Cancel</ThemedText>
                        </ThemedButton>
                    </ThemedCard>
                </ScrollView>
            </ThemedView>
        </PaperProvider>
    );
};


export default IntervenorUpdate;

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
});