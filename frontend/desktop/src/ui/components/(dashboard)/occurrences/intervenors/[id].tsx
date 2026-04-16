import {StyleSheet, FlatList, Text} from "react-native";
import ThemedView from "../../../../../../components/ThemedView";
import {Colors} from "@commons/constants/Colors";
import ThemedText from "../../../../../../components/ThemedText";
import {useParams, useNavigate} from "react-router";
import {useOccurrence} from "../../../../../hooks/useOccurrence";
import ThemedCard from "../../../../../../components/ThemedCard";
import ThemedLoader from "../../../../../../components/ThemedLoader";
import ThemedButton from "../../../../../../components/ThemedButton";
import {useIntervenor} from "../../../../../hooks/useIntervenor";
import Spacer from "../../../../../../components/Spacer";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useConfirmAction} from "../../../../utils/confirmAction";

const OccurrenceIntervenors = () => {
    const {t} = useTranslation()
    const {occurrenceId} = useParams()
    const navigate = useNavigate();
    const { intervenor } = useIntervenor();
    const occurrenceIdNumber = Number(occurrenceId)
    const [error, setError] = useState<string | null>(null);
    const confirmAction = useConfirmAction();

    const {occurrence, removeIntervenorFromOccurrence} = useOccurrence()
    const actualOccurrence = occurrence.find(o => o.id === occurrenceIdNumber);
    const [loading, setLoading] = useState(false)

    //fazer mostrar o refresh devido ao sse

    if (!actualOccurrence || loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        )
    }

    const handleIntervenors = async () => {
        navigate(`/intervenor?selectMode=true&occurrenceId=${occurrenceId}`)
    }

    const occurrenceIntervenors = Array.isArray(intervenor)
        ? intervenor.filter(i =>
            actualOccurrence.intervenors.includes(i.id)
        )
        : [];

    const handleRemove = (intervenorId: number) => {
        confirmAction(
            () => handleRemover(intervenorId),
            {
                title: t("removeIntervenor.title"),
                message: t("removeIntervenor.message"),
                cancelText: t("removeIntervenor.cancel"),
                confirmText: t("removeIntervenor.confirm"),
            }
        );
    };

    const handleRemover = async (intervenorId: number) =>{
        try {
            setLoading(true)
            await removeIntervenorFromOccurrence(intervenorId, occurrenceIdNumber)
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
            <ThemedText  style={{alignSelf: "center"}}>{t("occurrenceIntervenors.intervenorId")}: {item.idNumber}</ThemedText>
            <ThemedText  style={{alignSelf: "center"}}>{t("occurrenceIntervenors.intervenorIdType")}: {item.idType}</ThemedText>
            <ThemedText  style={{alignSelf: "center"}}>{t("occurrenceIntervenors.intervenorName")}: {item.name}</ThemedText>
            <ThemedText  style={{alignSelf: "center"}}>{t("occurrenceIntervenors.intervenorPhoneNumber")}: {item.contactInfo}</ThemedText>
            <ThemedText  style={{alignSelf: "center"}}>{t("occurrenceIntervenors.intervenorAddress")}: {item.address}</ThemedText>

            <ThemedButton
                onPress={() => handleRemove(item.id)}
                style={styles.remove}
            >
                <ThemedText style={{color: '#fff', textAlign: 'center'}}>
                    {t("occurrenceIntervenors.remove")}
                </ThemedText>
            </ThemedButton>
        </ThemedCard>
    )

    const isEmpty = occurrenceIntervenors.length === 0;

    return (
        <ThemedView safe={true} style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                {t("occurrenceIntervenors.occurrenceIntervenors")}
            </ThemedText>

            <Spacer />

            {isEmpty ? (
                <ThemedView style={styles.emptyContainer}>
                    <ThemedButton onPress={handleIntervenors} style={styles.create}>
                        <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                            {t("occurrenceIntervenors.addIntervenors")}
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
                                    {t("occurrenceIntervenors.addIntervenors")}
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
        marginTop: 40,
        backgroundColor: Colors.success,
        width: '15%',
        alignSelf: "center",
    },
    remove: {
        marginTop: 40,
        backgroundColor: Colors.warning,
        width: '15%',
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