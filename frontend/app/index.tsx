import {StyleSheet, Text, View, Image} from "react-native"
import {Link} from 'expo-router'
import Logo from '../assets/img/isel.png'
import ThemedView from "../components/ThemedView";
import Spacer from "../components/Spacer";
import ThemedText from "../components/ThemedText";


const Home = () =>{
    return (
        <ThemedView style={styles.container}>
            <Image source={Logo}/>
            <Spacer height={20}/>

            <ThemedText style={styles.title} title={true}>The Number 1</ThemedText>

            <Spacer height={10}/>
            <ThemedText> Insurance Reporter App </ThemedText>
            <Spacer/>

            <Link href="/login" style={styles.link}>
                <ThemedText>Login Page</ThemedText>
            </Link>

            <Link href="/about" style={styles.link}>
                <ThemedText>About Page</ThemedText>
            </Link>
            <Link href="/contact" style={styles.link}>
                <ThemedText>Contact Page</ThemedText>
            </Link>
            <Link href="/profile" style={styles.link}>
                <ThemedText>Profile Page</ThemedText>
            </Link>
            <Link href="/occurrence" style={styles.link}>
                <ThemedText>Occurrence Page</ThemedText>
            </Link>
        </ThemedView>
    )
}

export default Home

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
    cart:{
        backgroundColor: '#eee',
        padding: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0,0,0,0.1)'
    },
    link: {
        marginVertical: 10,
        borderBottomWidth: 1,
    }
})