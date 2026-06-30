import { StyleSheet, Text, TouchableWithoutFeedback } from "react-native";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import Spacer from "@commons/components/Spacer";
import { Link, useNavigate } from "react-router";
import ThemedButton from "@commons/components/ThemedButton";
import ThemedTextInput from "@commons/components/ThemedTextInput";
import { useState } from "react";
import { useAuth } from "@hooks/data/useAuth";
import { Colors } from "@commons/constants/Colors";
import { useTranslation } from "react-i18next";

/**
 * Ecrã de registo de novo utilizador (versão desktop/web).
 * Recolhe nome, email e palavra-passe (com confirmação), valida os campos e cria a conta via `useAuth`.
 * Em caso de sucesso, navega para a lista de ocorrências; caso contrário mostra a mensagem de erro.
 */
const Register = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();

  const checkErrors = (): boolean => {
    if (name.trim() === "") {
      setError(t("register.nameEmpty"));
      return true;
    }
    if (email.trim() === "") {
      setError(t("register.emailEmpty"));
      return true;
    }
    if (password.trim() === "") {
      setError(t("register.passwordEmpty"));
      return true;
    }
    if (password !== confirmPassword) {
      setError(t("register.passwordDontMatch"));
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    setError(null);
    if (checkErrors()) return;
    try {
      await register(name, email, password);
      navigate("/occurrence");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    }
  };
  return (
    <TouchableWithoutFeedback>
      <ThemedView style={styles.container}>
        <Spacer />
        <ThemedText title={true} style={styles.title}>
          {t("register.registerText")}
        </ThemedText>

        <ThemedTextInput
          style={{ width: "80%", margin: 20 }}
          placeholder={t("register.name")}
          onChangeText={setName}
          value={name}
        />

        <ThemedTextInput
          style={{ width: "80%", margin: 20 }}
          placeholder={t("register.email")}
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />
        <ThemedTextInput
          style={{ width: "80%", margin: 20 }}
          placeholder={t("register.password")}
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        <ThemedTextInput
          style={{ width: "80%", margin: 20 }}
          placeholder={t("register.confirmPassword")}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          secureTextEntry
        />

        <ThemedButton onPress={handleSubmit}>
          <ThemedText style={{ color: "#fff", textAlign: "center" }}>
            {t("register.register")}
          </ThemedText>
        </ThemedButton>

        <Spacer />

        {error && <Text style={styles.error}>{error}</Text>}

        <Spacer height={25} />
        <Link to="/login">
          <ThemedText style={{ textAlign: "center" }}>
            {t("register.login")}
          </ThemedText>
        </Link>
        <Link to="/home">
          <ThemedText style={{ textAlign: "center" }}>
            {t("home.home")}
          </ThemedText>
        </Link>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default Register;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "purple",
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
});
