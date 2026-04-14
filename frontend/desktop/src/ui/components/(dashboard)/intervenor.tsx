import {Animated, StyleSheet, Text, TextInput, ScrollView, useColorScheme} from "react-native";
import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../components/ThemedText";
import ThemedButton from "../../../../components/ThemedButton";
import ThemedCard from "../../../../components/ThemedCard";
import ThemedLoader from "../../../../components/ThemedLoader";
import {Colors} from "@commons/constants/Colors";
import {useCallback, useEffect, useState} from "react";
import {useIntervenor} from "../../../hooks/useIntervenor";
import {Intervenor} from "@commons/models/intervenor/Intervenor";
import Spacer from "../../../../components/Spacer";
import ThemedTextInput from "../../../../components/ThemedTextInput";
import {useOccurrence} from "../../../hooks/useOccurrence";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams, useLocation} from "react-router";
import Select from "react-select";

const IntervenorSearch = () => {
    const {t} = useTranslation()

    const OPTIONS = [
        {label: t("intervenor.phoneNumber"), value: "phoneNumber"},
        {label: t("intervenor.intervenorId"), value: "intervenorIdentifier"}
    ]

    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const selectMode = params.get("selectMode");
    const occurrenceId = params.get("occurrenceId");

    const isSelectMode = selectMode === "true"
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [searchType, setSearchType] = useState<string | undefined>(undefined)

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

    const handleCreate = () => {
        navigate("/intervenor/create");
    };

    const handleUpdate = () => {
        const intervenorId = intervenor?.id;
        if (!intervenorId) {
            setError(t("intervenor.intervenorNotFound"));
            return;
        }
        navigate(`/intervenor/update/${intervenorId}`)
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
                setError(t("intervenor.intervenorNotFound"));
                return;
            }
            await addIntervenorToOccurrence(intervenorId, Number(occurrenceId))
            navigate(`/occurrence/intervenors/${occurrenceId}`)
        } catch (err: any) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        }
    }

    if (loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        );
    }

    return (
        <>
            <ThemedView style={styles.container} safe={true}>
                <ScrollView>
                    <Spacer />
                    <ThemedText title={true} style={styles.heading}>{t("intervenor.intervenors")}</ThemedText>
                    <ThemedCard style={styles.card}>
                        <Spacer />
                        <ThemedText>{t("intervenor.searchIntervenor")}</ThemedText>
                        <Select
                            options={OPTIONS}
                            placeholder={t("intervenor.searchBy")}
                            value={OPTIONS.find(opt => opt.value === searchType) || null}
                            onChange={(selectedOption) => setSearchType(selectedOption?.value)}
                        />
                        {searchType && <ThemedTextInput
                            style={{width: '80%', margin: 20, backgroundColor: theme.uiBackground2}}
                            placeholder={searchType === "intervenorIdentifier" ? t("intervenor.enterIntervenorId") : t("intervenor.enterPhoneNumber")}
                            keyboardType={searchType === "phoneNumber" ? "phone-pad" : "default"}
                            onChangeText={setIdNumber}
                            value={idNumber}

                        />}
                        {searchType && <ThemedButton onPress={handleSearch} style={styles.create}>
                            <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("intervenor.search")}</ThemedText>
                        </ThemedButton>}

                        <ThemedButton onPress={handleCreate} style={styles.create}>
                            <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("intervenor.createIntervenor")}</ThemedText>
                        </ThemedButton>

                        {error && <Text style={styles.error}>{error}</Text>}

                        {intervenor && (
                            <ThemedCard style={{margin: 20, backgroundColor: theme.uiBackground2}}>
                                <ThemedText title={true}>Intervenor Found</ThemedText>
                                <ThemedText>{t("intervenor.name")}: {intervenor.name}</ThemedText>
                                <ThemedText>{t("intervenor.contact")}: {intervenor.contactInfo}</ThemedText>
                                <ThemedText>{t("intervenor.address")}: {intervenor.address}</ThemedText>
                                <ThemedText>{t("intervenor.idType")}: {intervenor.idType}</ThemedText>
                                <ThemedText>{t("intervenor.idNumber")}: {intervenor.idNumber}</ThemedText>

                                <ThemedButton onPress={handleUpdate} style={styles.update}>
                                    <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("intervenor.updateInformation")}</ThemedText>
                                </ThemedButton>
                                {isSelectMode &&(
                                    <ThemedButton onPress={handleAddIntervenor}>
                                        <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("intervenor.add")}</ThemedText>
                                    </ThemedButton>
                                )}
                            </ThemedCard>
                        )}
                    </ThemedCard>
                </ScrollView>
            </ThemedView>
        </>

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
