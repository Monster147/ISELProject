import {FlatList, Pressable, StyleSheet} from "react-native";
import ThemedText from "../../../../components/ThemedText";
import ThemedView from "../../../../components/ThemedView";
import Spacer from "../../../../components/Spacer";
import {useOccurrence} from "../../../hooks/useOccurrence";
import {useEffect} from "react";
import {Colors} from "@commons/constants/Colors";
import ThemedCard from "../../../../components/ThemedCard";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";

const Occurrence = () =>{
    const {t} = useTranslation()
    const {occurrence} = useOccurrence()
    const navigate = useNavigate()

    return(
        <ThemedView style={styles.container} safe={true}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                {t("occurrence.occurrenceList")}
            </ThemedText>

            <Spacer />

            <FlatList
                data={occurrence}
                keyExtractor={(item)=> item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({item}) =>(
                    <Pressable onPress={()=> navigate(`/occurrence/${item.id}`)}>
                        <ThemedCard style={styles.card}>
                            <ThemedText style={styles.title}>{t("occurrence.initDate")}:{item.initDate}</ThemedText>
                            <ThemedText style={styles.title}>{t("occurrence.endDate")}:{item.endDate}</ThemedText>
                            <ThemedText style={styles.title}>
                                {t("occurrence.importance")}:
                                <ThemedText style={{color: importanceColors[item.importance] || "black"}}>
                                    {t(`importance.${item.importance}`)}
                                </ThemedText>
                            </ThemedText>
                        </ThemedCard>
                    </Pressable>
                )}

            />

        </ThemedView>
    )
}

export default Occurrence

const importanceColors: Record<string, string> = {
    NORMAL: "green",
    URGENT: "yellow",
    CRITICAL: "red"
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'stretch',
    },
    heading:{
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center'
    },
    list: {
        marginTop: 40,
        paddingBottom: 20,
    },
    card: {
        width: "90%",
        marginHorizontal: "5%",
        marginVertical: 10,
        padding: 10,
        paddingLeft: 14,
        borderLeftColor: Colors.primary,
        borderLeftWidth: 4
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
})