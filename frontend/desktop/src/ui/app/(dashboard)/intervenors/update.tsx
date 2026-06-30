import { StyleSheet, Text, ScrollView, useColorScheme } from "react-native";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import ThemedButton from "@commons/components/ThemedButton";
import ThemedCard from "@commons/components/ThemedCard";
import ThemedLoader from "@components/ThemedLoader";
import { Colors } from "@commons/constants/Colors";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useIntervenor } from "@hooks/data/useIntervenor";
import { Intervenor } from "@commons/models/intervenor/Intervenor";
import Select from "react-select";
import ThemedTextInput from "@commons/components/ThemedTextInput";
import { useTranslation } from "react-i18next";

/**
 * Ecrã de atualização de interveniente (versão desktop/web).
 * Carrega o interveniente pelo `intervenorId` da rota e permite escolher quais campos editar
 * (identificação, tipo, nome, contacto, morada) através de um seletor múltiplo, gravando as
 * alterações via `useIntervenor`. Em caso de sucesso, regressa ao ecrã anterior.
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

  const { intervenorId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [change, setChange] = useState<string[]>([]);
  const selected = (key: string) => change.includes(key);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const { findIntervenorById, updateIntervenor } = useIntervenor();
  const intervenorIdNumber = Number(intervenorId);

  const [intervenor, setIntervenor] = useState<Intervenor | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [identifierType, setIdentifierType] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const intervenorData = await findIntervenorById(intervenorIdNumber);
        setIntervenor(intervenorData);
        setName(intervenorData.name);
        setIdentifier(intervenorData.idNumber);
        setIdentifierType(intervenorData.idType);
        setPhoneNumber(intervenorData.contactInfo);
        setAddress(intervenorData.address);
      } catch (err: any) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [intervenorIdNumber]);

  const handleUpdate = async () => {
    try {
      setError(null);
      setLoading(true);
      await updateIntervenor(
        intervenorIdNumber,
        identifier,
        identifierType,
        name,
        phoneNumber,
        address,
      );
      navigate(-1);
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
    <>
      <ThemedView safe style={styles.container}>
        <ScrollView>
          <ThemedCard style={styles.card}>
            <ThemedText title style={[styles.title, { alignSelf: "center" }]}>
              {t("intervenorUpdate.update")}
            </ThemedText>
            <Select
              isMulti
              options={MULTI_SELECT_OPTIONS}
              placeholder={t("intervenorUpdate.selectFields")}
              value={MULTI_SELECT_OPTIONS.filter((opt) =>
                change.includes(opt.value),
              )}
              onChange={(selectedOptions) =>
                setChange(
                  selectedOptions
                    ? selectedOptions.map((opt) => opt.value)
                    : [],
                )
              }
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

            <ThemedButton onPress={() => navigate(-1)} style={styles.cancel}>
              <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                {t("intervenorUpdate.cancel")}
              </ThemedText>
            </ThemedButton>

            {error && <Text style={styles.error}>{error}</Text>}
          </ThemedCard>
        </ScrollView>
      </ThemedView>
    </>
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
    width: "15%",
    alignSelf: "center",
  },
  cancel: {
    marginTop: 40,
    backgroundColor: Colors.warning,
    width: "15%",
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
    width: "15%",
    alignSelf: "center",
  },
});
