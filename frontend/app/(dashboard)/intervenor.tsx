import {Animated, StyleSheet, Text, TextInput, ScrollView, useColorScheme} from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedCard from "../../components/ThemedCard";
import ThemedLoader from "../../components/ThemedLoader";
import {Colors} from "../../constants/Colors";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import {useCallback, useEffect, useState} from "react";
import {useIntervenor} from "../../hooks/useIntervenor";
import {Intervenor} from "../../models/intervenor/Intervenor";
import Spacer from "../../components/Spacer";
import {Dropdown} from "react-native-paper-dropdown";
import {PaperProvider} from "react-native-paper";
import ThemedTextInput from "../../components/ThemedTextInput";
import {useAlertExitApp} from "../../hooks/useAlertExitApp";
import {useOccurrence} from "../../hooks/useOccurrence";

const OPTIONS = [
    {label: "Phone Number", value: "phoneNumber"},
    {label: "Intervenor Identifier", value: "intervenorIdentifier"}
]


const IntervenorSearch = () => {
    const { selectMode, occurrenceId } = useLocalSearchParams()
    const isSelectMode = selectMode === "true"
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [searchType, setSearchType] = useState()

    useAlertExitApp()

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const {getIntervenorByIdNumber, deleteIntervenorByIdNumber, findIntervenorByContactInfo} = useIntervenor()
    const {addIntervenorToOccurrence} = useOccurrence()

    const [idNumber, setIdNumber] = useState("")
    const [intervenor, setIntervenor] = useState<Intervenor | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSearchByNumberId = async () => {
        try {
            setLoading(true)
            const result = await getIntervenorByIdNumber(idNumber)
            setIntervenor(result)
            setError(null)
        } catch (err: any) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    const handleSearchByPhoneNumber = async () => {
        try {
            setLoading(true)
            const result = await findIntervenorByContactInfo(idNumber)
            setIntervenor(result)
            setError(null)
        } catch (err: any) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteIntervenor = async () => {
        const idToDelete = intervenor?.idNumber;
        if (!idToDelete) {
            setError("No intervenor selected to delete.");
            return;
        }

        try {
            setLoading(true)
            await deleteIntervenorByIdNumber(intervenor?.idNumber)
            setIntervenor(null)
        } catch (err: any) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = () => {
        router.push("/intervenors/create");
    };

    const handleUpdate = () => {
        const intervenorId = intervenor?.id;
        if (!intervenorId) {
            setError("No intervenor selected to update.");
            return;
        }
        router.push(`intervenors/${intervenorId}`)
    }

    const handleSearch = async () => {
        setIntervenor(null);
        if (!searchType) return
        if (searchType === "phoneNumber") {
            await handleSearchByPhoneNumber();
        } else {
            await handleSearchByNumberId();
        }
    };

    const handleAddIntervenor = async () => {
        try {
            const intervenorId = intervenor?.id;
            if (!intervenorId) {
                setError("No intervenor selected to update.");
                return;
            }
            await addIntervenorToOccurrence(intervenorId, Number(occurrenceId))
            router.replace(`occurrences/intervenors/${occurrenceId}`)
        } catch (err: any) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        }
    }

    useFocusEffect(
        useCallback(() => {
            return () => {
                setIntervenor(null)
                setIdNumber("")
                setSearchType(undefined)
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
        <PaperProvider>
            <ThemedView style={styles.container} safe={true}>
                <ScrollView>
                    <Spacer />
                    <ThemedText title={true} style={styles.heading}>Intervenors</ThemedText>
                    <ThemedCard style={styles.card}>
                        <Spacer />
                        <ThemedText>Search Intervenor</ThemedText>
                        <Dropdown
                            label={"Search by"}
                            placeholder={"Select search type"}
                            options={OPTIONS}
                            value={searchType}
                            onSelect={setSearchType}
                        />
                        {searchType && <ThemedTextInput
                            style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                            placeholder={searchType === "intervenorIdentifier" ? "Enter ID Number" : "Enter phone number"}
                            keyboardType={searchType === "phoneNumber" ? "phone-pad" : "default"}
                            onChangeText={setIdNumber}
                            value={idNumber}

                        />}
                        {searchType && <ThemedButton onPress={handleSearch} style={styles.create}>
                            <ThemedText style={{color: '#fff', textAlign: 'center'}}>Search</ThemedText>
                        </ThemedButton>}

                        <ThemedButton onPress={handleCreate} style={styles.create}>
                            <ThemedText style={{color: '#fff', textAlign: 'center'}}> Create Intervenor</ThemedText>
                        </ThemedButton>

                        {error && <Text style={styles.error}>{error}</Text>}

                        {intervenor && (
                            <ThemedCard style={{margin: 20, backgroundColor: theme.uiBackground2}}>
                                <ThemedText title={true}>Intervenor Found</ThemedText>
                                <ThemedText>Name: {intervenor.name}</ThemedText>
                                <ThemedText>Contact: {intervenor.contactInfo}</ThemedText>
                                <ThemedText>Address: {intervenor.address}</ThemedText>
                                <ThemedText>ID Type: {intervenor.idType}</ThemedText>
                                <ThemedText>ID Number: {intervenor.idNumber}</ThemedText>

                                <ThemedButton onPress={handleUpdate} style={styles.update}>
                                    <ThemedText style={{color: '#fff', textAlign: 'center'}}> Update Informations</ThemedText>
                                </ThemedButton>
                                {isSelectMode &&(
                                    <ThemedButton onPress={handleAddIntervenor}>
                                        <ThemedText style={{color: '#fff', textAlign: 'center'}}>Add</ThemedText>
                                    </ThemedButton>
                                )}
                            </ThemedCard>
                        )}
                    </ThemedCard>
                </ScrollView>
            </ThemedView>
        </PaperProvider>

    )

};

export default IntervenorSearch;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "stretch",
    },
    title: {
        fontSize: 22,
        marginVertical: 10,
    },
    heading:{
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center'
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
