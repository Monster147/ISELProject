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
import {Colors} from "../../constants/Colors";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import {useState} from "react";
import {useAuth} from "../../hooks/useAuth";
import ThemedLoader from "../../components/ThemedLoader";
import {useBackRedirect} from "../../hooks/useBackRedirect";

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null);

    useBackRedirect("/home")

    const {login} = useAuth()

    const checkErrors = (): boolean =>{
        if (email.trim() === '') {
            setError("Email cannot be empty")
            return true
        }
        if (password.trim() === '') {
            setError("Password cannot be empty")
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
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                <Spacer/>
                <ThemedText title={true} style={styles.title}>
                    Login to your Account
                </ThemedText>

                <ThemedTextInput
                    style={{width: '80%', margin: 20}}
                    placeholder={"Email"}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                />
                <ThemedTextInput
                    style={{width: '80%', margin: 20}}
                    placeholder={"Password"}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                />

                <ThemedButton onPress={handleSubmit}>
                    <Text style={{color: 'f2f2f2'}}>Login</Text>
                </ThemedButton>

                <Spacer/>

                {error && <Text style={styles.error}>{error}</Text> }

                <Spacer height={25}/>
                <Link href='/register'>
                    <ThemedText style={{textAlign: 'center'}}>
                        Register instead
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