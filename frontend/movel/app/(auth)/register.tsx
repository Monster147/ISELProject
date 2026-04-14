import {Keyboard, StyleSheet, Text, TouchableWithoutFeedback} from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import {Link, router} from "expo-router";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import {useState} from "react";
import {useAuth} from "../../hooks/useAuth";
import {Colors} from "@commons/constants/Colors";
import {useBackRedirect} from "../../hooks/useBackRedirect";
import {useTranslation} from "react-i18next";

const Register = () => {
    const {t} = useTranslation()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null);

    const {register} = useAuth()

    useBackRedirect(() => router.navigate(`/home`))


    const checkErrors = ():boolean =>{
        if (name.trim() === '') {
            setError(t("register.nameEmpty"))
            return true
        }
        if (email.trim() === '') {
            setError(t("register.emailEmpty"))
            return true
        }
        if (password.trim() === '') {
            setError(t("register.passwordEmpty"))
            return true
        }
        if (password !== confirmPassword) {
            setError(t("register.passwordDontMatch"))
            return true
        }
        return false
    }

    const handleSubmit = async () => {
        setError(null)
        if(checkErrors()) return
        try {
            await register(name, email, password)
            router.replace("/occurrence");
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        }
    }
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                <Spacer/>
                <ThemedText title={true} style={styles.title}>
                    {t("register.registerText")}
                </ThemedText>

                <ThemedTextInput
                    style={{width: '80%', margin: 20}}
                    placeholder={t("register.name")}
                    onChangeText={setName}
                    value={name}
                />

                <ThemedTextInput
                    style={{width: '80%', margin: 20}}
                    placeholder={t("register.email")}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                />
                <ThemedTextInput
                    style={{width: '80%', margin: 20}}
                    placeholder={t("register.password")}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                />
                <ThemedTextInput
                    style={{width: '80%', margin: 20}}
                    placeholder={t("register.confirmPassword")}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry
                />

                <ThemedButton onPress={handleSubmit}>
                    <Text style={{color: 'f2f2f2'}}>{t("register.register")}</Text>
                </ThemedButton>

                <Spacer/>

                {error && <Text style={styles.error}>{error}</Text> }

                <Spacer height={25}/>
                <Link href='/login'>
                    <ThemedText style={{textAlign: 'center'}}>
                        {t("register.login")}
                    </ThemedText>
                </Link>

            </ThemedView>
        </TouchableWithoutFeedback>
    )
}

export default Register
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