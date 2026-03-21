import {StyleSheet, Pressable, Text, TextInput, TouchableWithoutFeedback, Keyboard} from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import {Link} from "expo-router";
import {Colors} from "../../constants/Colors";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import {useState} from "react";
import {useAuth} from "../../hooks/useAuth";

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {token} = useAuth()

    const handleSubmit = () => {
        console.log('Login')
        console.log(email)
        console.log(password)
        console.log(token)
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
                <Spacer height={100}/>
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
})