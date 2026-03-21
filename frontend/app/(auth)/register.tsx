import {Keyboard, StyleSheet, Text, TouchableWithoutFeedback} from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import {Link} from "expo-router";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import {useState} from "react";

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSubmit = () => {
        console.log('Register')
        console.log(email)
        console.log(password)
    }
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                <Spacer/>
                <ThemedText title={true} style={styles.title}>
                    Register For an Account
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
                <ThemedTextInput
                    style={{width: '80%', margin: 20}}
                    placeholder={"Password"}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry
                />

                <ThemedButton onPress={handleSubmit}>
                    <Text style={{color: 'f2f2f2'}}>Register</Text>
                </ThemedButton>
                <Spacer height={100}/>
                <Link href='/login'>
                    <ThemedText style={{textAlign: 'center'}}>
                        Login instead
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
})