import {StyleSheet, Pressable, Text} from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import {Link} from "expo-router";
import {Colors} from "../../constants/Colors";
import ThemedButton from "../../components/ThemedButton";

const Login = () =>{
    const handleSubmit = () =>{
        console.log('Login')
    }
    return(
        <ThemedView style={styles.container}>
            <Spacer/>
            <ThemedText title={true} style={styles.title}>
                Login to your Account
            </ThemedText>

            <ThemedButton onPress={handleSubmit}>
                <Text style={{color: 'f2f2f2'}}>Login</Text>
            </ThemedButton>
            <Spacer height={100}/>
            <Link href='/register'>
                <ThemedText style={{textAlign:'center'}}>
                    Register instead
                </ThemedText>
            </Link>
        </ThemedView>
    )
}

export default Login
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
    btn:{
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 5,
    },
    pressed:{
        opacity: 0.9
    },
})