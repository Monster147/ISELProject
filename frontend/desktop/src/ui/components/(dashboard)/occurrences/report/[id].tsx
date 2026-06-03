import Spacer from "../../../../../../components/Spacer";
import ThemedText from "../../../../../../components/ThemedText";
import ThemedView from "../../../../../../components/ThemedView";
import ThemedButton from "../../../../../../components/ThemedButton";
import {FlatList, StyleSheet, Text} from "react-native";
import {Colors} from "@commons/constants/Colors";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router";

const OccurrenceReport = () =>{
    const {t} = useTranslation()
    const {occurrenceId} = useParams()
    const occurrenceIdNumber = Number(occurrenceId)
    const navigate = useNavigate();

    return(
        <ThemedView safe={true} style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                {t("occurrenceIntervenors.occurrenceIntervenors")}
            </ThemedText>

            <Spacer />
        </ThemedView>
    )
}

export default OccurrenceReport

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