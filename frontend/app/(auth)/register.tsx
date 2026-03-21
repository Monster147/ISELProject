import {StyleSheet, Text} from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import {Link} from "expo-router";
import ThemedButton from "../../components/ThemedButton";

const Register = () =>{
    const handleSubmit = () =>{
        console.log('Register')
    }
    return(
        <ThemedView style={styles.container}>
            <Spacer/>
            <ThemedText title={true} style={styles.title}>
                Register For an Account
            </ThemedText>
            <ThemedButton onPress={handleSubmit}>
                <Text style={{color: 'f2f2f2'}}>Register</Text>
            </ThemedButton>
            <Spacer height={100}/>
            <Link href='/login'>
                <ThemedText style={{textAlign:'center'}}>
                    Login instead
                </ThemedText>
            </Link>
        </ThemedView>
    )
}

export default Register
const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title:{
        fontWeight: 'bold',
        fontSize: 18,
        color: 'purple'
    },
})