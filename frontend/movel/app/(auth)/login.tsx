import {
    StyleSheet,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator
} from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import {Link, router} from "expo-router";
import {Colors} from "@commons/constants/Colors";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import {useState} from "react";
import {useAuth} from "../../hooks/useAuth";
import ThemedLoader from "../../components/ThemedLoader";
import {useBackRedirect} from "../../hooks/useBackRedirect";
import {useTranslation} from "react-i18next";

const Login = () => {
    const {t} = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null);

    useBackRedirect(() => router.navigate(`/home`))

    const {login} = useAuth()

    const checkErrors = (): boolean =>{
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
        if(checkErrors()) return
        try {
            await login(email, password)
            router.replace("/occurrence");
        } catch (err: any) {
            console.log(err.message)
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                    <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("login.login")}</ThemedText>
                </ThemedButton>

                <Spacer/>

                {error && <Text style={styles.error}>{error}</Text> }

                <Spacer height={25}/>
                <Link href='/register'>
                    <ThemedText style={{textAlign: 'center'}}>
                        {t("login.register")}
                    </ThemedText>
                </Link>

            </ThemedView>
        </TouchableWithoutFeedback>
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
    error:{
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    }
})