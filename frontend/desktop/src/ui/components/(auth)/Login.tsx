import {
    StyleSheet,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator
} from "react-native";
import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../components/ThemedText";
import Spacer from "../../../../components/Spacer";
import {Link, useNavigate} from "react-router";
import {Colors} from "@commons/constants/Colors";
import ThemedButton from "../../../../components/ThemedButton";
import ThemedTextInput from "../../../../components/ThemedTextInput";
import {useState} from "react";
import {useAuth} from "../../../hooks/useAuth";
//import {useBackRedirect} from "../../hooks/useBackRedirect";
import {useTranslation} from "react-i18next";

const Login = () => {
    const {t} = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    //useBackRedirect("/home")

    const {login} = useAuth()

    const checkErrors = (): boolean => {
        if (email.trim() === '') {
            setError(t("login.emailEmpty"))
            return true
        }
        if (password.trim() === '') {
            setError(t("login.passwordEmpty"))
            return true
        }
        return false
    }

    const handleSubmit = async () => {
        setError(null)
        if (checkErrors()) return
        try {
            await login(email, password)
            navigate("/occurrence");
        } catch (err: any) {
            console.log(err.message)
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        }
    }

    return (
        <ThemedView style={styles.container}>
            <Spacer/>
            <ThemedText title={true} style={styles.title}>
                {t("login.loginText")}
            </ThemedText>

            <ThemedTextInput
                style={{width: '80%', margin: 20}}
                placeholder={t("login.email")}
                keyboardType="email-address"
                onChangeText={setEmail}
                value={email}
            />
            <ThemedTextInput
                style={{width: '80%', margin: 20}}
                placeholder={t("login.password")}
                onChangeText={setPassword}
                value={password}
                secureTextEntry
            />

            <ThemedButton onPress={handleSubmit}>
                <Text style={{color: 'f2f2f2'}}>{t("login.login")}</Text>
            </ThemedButton>

            <Spacer/>

            {error && <Text style={styles.error}>{error}</Text>}

            <Spacer height={25}/>
            <Link to='/register'>
                <ThemedText style={{textAlign: 'center'}}>
                    {t("login.register")}
                </ThemedText>
            </Link>

            <Link to='/home'>
                <ThemedText style={{textAlign: 'center'}}>
                    {t("home.home")}
                </ThemedText>
            </Link>

        </ThemedView>
    )
}

export default Login
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'purple'
    },
    btn: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 5,
    },
    pressed: {
        opacity: 0.9
    },
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    }
})