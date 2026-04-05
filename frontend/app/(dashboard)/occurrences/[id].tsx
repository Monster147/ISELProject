import {Animated, StyleSheet, ScrollView} from "react-native";
import ThemedView from "../../../components/ThemedView";
import {Colors} from "../../../constants/Colors";
import ThemedText from "../../../components/ThemedText";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useOccurrence} from "../../../hooks/useOccurrence";
import {useEffect, useState} from "react";
import {Occurrence} from "../../../models/occurrence/Occurrence";
import ThemedCard from "../../../components/ThemedCard";
import ThemedLoader from "../../../components/ThemedLoader";
import ThemedButton from "../../../components/ThemedButton";
import {useBackRedirect} from "../../../hooks/useBackRedirect";
import {useIntervenor} from "../../../hooks/useIntervenor";

const OccurrenceDetails = () => {
    const {id} = useLocalSearchParams()
    const router = useRouter();
    const { intervenor } = useIntervenor();
    console.log(intervenor)

    useBackRedirect("/occurrence")

    //const [currentOccurrence, setCurrentOccurrence] = useState<Occurrence|null>(null);
    //const {getOccurrence} = useOccurrence()

    const occurrenceId = Number(id)
    const {occurrence} = useOccurrence()
    const actualOccurrence = occurrence.find(o => o.id === occurrenceId);

    /*
    useEffect(() => {
        async function loadOccurrence(){
            const occurrenceData= await getOccurrence(idNumber)
            setCurrentOccurrence(occurrenceData)
        }

        loadOccurrence()
    }, [id])
     */

    if (!actualOccurrence) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        )
    }

    const handleEvidences = async () => {
        console.log("Navegar Evidencias")
    };

    const handleIntervenors = async () => {
        router.push({
            pathname: "/intervenor",
            params: {
                selectMode: "true",
                occurrenceId: occurrenceId
            }
        })
    }


    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView>
                <ThemedCard style={styles.card}>
                    <ThemedText title={true} style={styles.title}>Occurrence Details</ThemedText>

                    <ThemedText>ID: {actualOccurrence.id}</ThemedText>

                    <ThemedText>Initial Date: {actualOccurrence.initDate}</ThemedText>

                    <ThemedText>End Date: {actualOccurrence.endDate}</ThemedText>

                    <ThemedText>Reporter: {actualOccurrence.reporterId}</ThemedText>

                    <ThemedText>Importance: {actualOccurrence.importance}</ThemedText>

                    {actualOccurrence.intervenors.length > 0 ? (
                        <>
                            <ThemedText>Intervenors:</ThemedText>

                            {actualOccurrence.intervenors.map((id) => {
                                const found = intervenor.find((i) => i.id === id);

                                if (!found) {
                                    return <ThemedText key={id}>- (unknown intervenor #{id})</ThemedText>;
                                }

                                return (
                                    <ThemedText key={found.id}>
                                        Name: {found.name} {"\n"}
                                        Contact: {found.contactInfo} {"\n"}
                                        Address: {found.address}
                                    </ThemedText>
                                );
                            })}
                        </>
                    ) : (
                        <ThemedText>No intervenors yet</ThemedText>
                    )}


                    <ThemedText>Occurrence Type:</ThemedText>
                    <ThemedText>{JSON.stringify(actualOccurrence.occurrenceType, null, 2)}</ThemedText>

                    <ThemedText>Occurrence Info:</ThemedText>
                    <ThemedText>{JSON.stringify(actualOccurrence.occurrenceInfo, null, 2)}</ThemedText>
                    <ThemedButton onPress={handleEvidences} style={styles.create}>
                        <ThemedText style={{color: '#fff', textAlign: 'center'}}>Go to Evidences</ThemedText>
                    </ThemedButton>
                    <ThemedButton onPress={handleIntervenors} style={styles.create}>
                        <ThemedText style={{color: '#fff', textAlign: 'center'}}>Add Intervenors</ThemedText>
                    </ThemedButton>
                </ThemedCard>
            </ScrollView>
        </ThemedView>

    )
}

export default OccurrenceDetails

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
})