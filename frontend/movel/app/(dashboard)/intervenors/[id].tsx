import { StyleSheet, Text, ScrollView, useColorScheme } from "react-native";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import ThemedButton from "@commons/components/ThemedButton";
import ThemedCard from "@commons/components/ThemedCard";
import ThemedLoader from "@components/ThemedLoader";
import { Colors } from "@commons/constants/Colors";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useIntervenor } from "@hooks/data/useIntervenor";
import { MultiSelectDropdown } from "react-native-paper-dropdown";
import { PaperProvider } from "react-native-paper";
import ThemedTextInput from "@commons/components/ThemedTextInput";
import { useBackRedirect } from "@hooks/system/useBackRedirect";
import { useTranslation } from "react-i18next";
import OfflineBanner from "@components/ThemedOfflineBanner";

/**
 * Ecrã de atualização de interveniente na aplicação móvel (rota dinâmica por `id`).
 * Carrega o interveniente pelo identificador da rota e permite escolher quais campos editar
 * (identificação, tipo, nome, contacto, morada), gravando as alterações via `useIntervenor`.
 * Em caso de sucesso, regressa ao ecrã anterior.
 */
const IntervenorUpdate = () => {
  const { t } = useTranslation();

  const MULTI_SELECT_OPTIONS = [
    {
      label: t("intervenorUpdate.intervenorId"),
      value: "intervenorIdentifier",
    },
    {
      label: t("intervenorUpdate.intervenorIdType"),
      value: "intervenorIdentifierType",
    },
    { label: t("intervenorUpdate.intervenorName"), value: "intervenorName" },
    {
      label: t("intervenorUpdate.intervenorPhoneNumber"),
      value: "intervenorPhoneNumber",
    },
    {
      label: t("intervenorUpdate.intervenorAddress"),
      value: "intervenorAddress",
    },
  ];

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [change, setChange] = useState<string[]>([]);
  const selected = (key: string) => change.includes(key);

  useBackRedirect(() => router.push("/intervenor"));

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const { findIntervenorById, updateIntervenor, intervenor } = useIntervenor();
  const intervenorId = Number(id);

  const actualIntervenor = intervenor.find((i) => i.id === intervenorId);

  const [name, setName] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [identifierType, setIdentifierType] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          if (actualIntervenor) {
            setName(actualIntervenor.name);
            setIdentifier(actualIntervenor.idNumber);
            setIdentifierType(actualIntervenor.idType);
            setPhoneNumber(actualIntervenor.contactInfo);
            setAddress(actualIntervenor.address);
          } else {
            const intervenorData = await findIntervenorById(intervenorId);
            setName(intervenorData.name);
            setIdentifier(intervenorData.idNumber);
            setIdentifierType(intervenorData.idType);
            setPhoneNumber(intervenorData.contactInfo);
            setAddress(intervenorData.address);
          }
        } catch (err: any) {
          if (err instanceof Error) setError(err.message);
          else setError(String(err));
        } finally {
          setLoading(false);
        }
      };
      load();

      return () => {
        setIdentifier(null);
        setIdentifierType(null);
        setAddress(null);
        setPhoneNumber(null);
        setName(null);
        setError(null);
        setChange([]);
      };
    }, [intervenorId, actualIntervenor]),
  );

  const handleUpdate = async () => {
    try {
      setError(null);
      setLoading(true);
      await updateIntervenor(
        intervenorId,
        identifier,
        identifierType,
        name,
        phoneNumber,
        address,
      );
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
        <ThemedLoader />
      </ThemedView>
    );
  }

  return (
    <PaperProvider>
      <ThemedView safe style={styles.container}>
        <ScrollView>
          <ThemedCard style={styles.card}>
            <ThemedText title style={[styles.title, { alignSelf: "center" }]}>
              {t("intervenorUpdate.update")}
            </ThemedText>

            <OfflineBanner />

            <MultiSelectDropdown
              label={t("intervenorUpdate.selectFields")}
              placeholder={t("intervenorUpdate.selectFields")}
              options={MULTI_SELECT_OPTIONS}
              value={change}
              onSelect={setChange}
            />

            {change.includes("intervenorIdentifier") && (
              <ThemedTextInput
                style={{
                  width: "80%",
                  margin: 20,
                  backgroundColor: theme.uiBackground2,
                  alignSelf: "center",
                }}
                placeholder={t("intervenorUpdate.enterIdNumber")}
                onChangeText={setIdentifier}
                value={identifier}
              />
            )}

            {change.includes("intervenorIdentifierType") && (
              <ThemedTextInput
                style={{
                  width: "80%",
                  margin: 20,
                  backgroundColor: theme.uiBackground2,
                  alignSelf: "center",
                }}
                placeholder={t("intervenorUpdate.enterIdType")}
                onChangeText={setIdentifierType}
                value={identifierType}
              />
            )}

            {change.includes("intervenorName") && (
              <ThemedTextInput
                style={{
                  width: "80%",
                  margin: 20,
                  backgroundColor: theme.uiBackground2,
                  alignSelf: "center",
                }}
                placeholder={t("intervenorUpdate.enterName")}
                onChangeText={setName}
                value={name}
              />
            )}

            {change.includes("intervenorPhoneNumber") && (
              <ThemedTextInput
                style={{
                  width: "80%",
                  margin: 20,
                  backgroundColor: theme.uiBackground2,
                  alignSelf: "center",
                }}
                placeholder={t("intervenorUpdate.enterPhoneNumber")}
                keyboardType="phone-pad"
                onChangeText={setPhoneNumber}
                value={phoneNumber}
              />
            )}

            {change.includes("intervenorAddress") && (
              <ThemedTextInput
                style={{
                  width: "80%",
                  margin: 20,
                  backgroundColor: theme.uiBackground2,
                  alignSelf: "center",
                }}
                placeholder={t("intervenorUpdate.enterAddress")}
                onChangeText={setAddress}
                value={address}
              />
            )}

            {change && (
              <ThemedButton onPress={handleUpdate} style={styles.update}>
                <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                  {t("intervenorUpdate.save")}
                </ThemedText>
              </ThemedButton>
            )}

            <ThemedButton onPress={() => router.back()} style={styles.cancel}>
              <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                {t("intervenorUpdate.cancel")}
              </ThemedText>
            </ThemedButton>

            {error && <Text style={styles.error}>{error}</Text>}
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
    margin: 20,
  },
  create: {
    marginTop: 40,
    backgroundColor: Colors.success,
    width: "75%",
    alignSelf: "center",
  },
  cancel: {
    marginTop: 40,
    backgroundColor: Colors.warning,
    width: "75%",
    alignSelf: "center",
  },
  error: {
    color: Colors.warning,
    padding: 10,
    backgroundColor: "#f5c1c8",
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  update: {
    marginTop: 40,
    backgroundColor: Colors.update,
    width: "75%",
    alignSelf: "center",
  },
});
