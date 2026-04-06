import {Animated, StyleSheet, ScrollView, FlatList, View, Text} from "react-native";
import ThemedView from "../../../../components/ThemedView";
import {Colors} from "../../../../constants/Colors";
import ThemedText from "../../../../components/ThemedText";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useOccurrence} from "../../../../hooks/useOccurrence";
import {Occurrence} from "../../../../models/occurrence/Occurrence";
import ThemedCard from "../../../../components/ThemedCard";
import ThemedLoader from "../../../../components/ThemedLoader";
import ThemedButton from "../../../../components/ThemedButton";
import {useBackRedirect} from "../../../../hooks/useBackRedirect";
import {useIntervenor} from "../../../../hooks/useIntervenor";
import Spacer from "../../../../components/Spacer";
import {useState} from "react";

const OccurrenceIntervenors = () => {
    const {id} = useLocalSearchParams()
    const router = useRouter();
    const { intervenor } = useIntervenor();
    const occurrenceId = Number(id)
    const [error, setError] = useState<string | null>(null);

    useBackRedirect(`/occurrences/${occurrenceId}`)

    const {occurrence, removeIntervenorFromOccurrence} = useOccurrence()
    const actualOccurrence = occurrence.find(o => o.id === occurrenceId);
    const [loading, setLoading] = useState(false)

    if (!actualOccurrence || loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        )
    }

    const handleIntervenors = async () => {
        router.push({
            pathname: "/intervenor",
            params: {
                selectMode: "true",
                occurrenceId: occurrenceId
            }
        })
    }

    const occurrenceIntervenors = intervenor.filter(i =>
        actualOccurrence.intervenors.includes(i.id)
    )

    const handleRemove = async (intervenorId: number) =>{
        try {
            setLoading(true)
            await removeIntervenorFromOccurrence(intervenorId, occurrenceId)
            setError(null)
        } catch (err: any) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    const renderIntervenor = ({item}) => (
        <ThemedCard style={styles.card}>
            <ThemedText>Intervenor Identifier: {item.idNumber}</ThemedText>
            <ThemedText>Intervenor Identifier Type: {item.idType}</ThemedText>
            <ThemedText>Intervenor Name: {item.name}</ThemedText>
            <ThemedText>Intervenor Phone Number: {item.contactInfo}</ThemedText>
            <ThemedText>Intervenor Address: {item.address}</ThemedText>

            <ThemedButton
                onPress={() => handleRemove(item.id)}
                style={styles.remove}
            >
                <ThemedText style={{color: '#fff', textAlign: 'center'}}>
                    Remove
                </ThemedText>
            </ThemedButton>
        </ThemedCard>
    )

    const isEmpty = occurrenceIntervenors.length === 0;

    return (
        <ThemedView safe={true} style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                Intervenors in Occurrence
            </ThemedText>

            <Spacer />

            {isEmpty ? (
                <ThemedView style={styles.emptyContainer}>
                    <ThemedButton onPress={handleIntervenors} style={styles.create}>
                        <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                            Add Intervenors
                        </ThemedText>
                    </ThemedButton>
                </ThemedView>
            ) : (
                <FlatList
                    data={occurrenceIntervenors}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderIntervenor}
                    ListFooterComponent={
                        <ThemedView style={styles.container}>
                            {error && <Text style={styles.error}>{error}</Text>}
                            <ThemedButton onPress={handleIntervenors} style={styles.create}>
                                <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                                    Add Intervenors
                                </ThemedText>
                            </ThemedButton>
                        </ThemedView>
                    }
                />
            )}
        </ThemedView>
    );

}

export default OccurrenceIntervenors

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "stretch",
    },
    card: {
        margin: 20
    },
    create: {
        marginTop: 20,
        backgroundColor: Colors.success,
        width: 200,
        alignSelf: "center",
    },
    remove: {
        marginTop: 15,
        backgroundColor: Colors.warning,
        width: 120,
        alignSelf: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    heading:{
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center'
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
})