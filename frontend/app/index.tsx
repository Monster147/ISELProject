import {StyleSheet, Text, View, Image} from "react-native"
import {Link} from 'expo-router'
import Logo from '../assets/img/isel.png'


const Home = () =>{
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Image source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}} style={styles.img}/>
            <Text style={styles.title}>The Number 1</Text>
            <Text style={{marginTop: 10, marginBottom: 30}}>The Number 2</Text>
            <View style={styles.cart}>
                <Text>This is a cart</Text>
            </View>
            <Link href="/about" style={styles.link}>About Page</Link>
            <Link href="/contact" style={styles.link}>Contact Page</Link>
        </View>
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
    img: {
        width: 150,
        height: 150,
        marginVertical: 20
    },
    link: {
        marginVertical: 10,
        borderBottomWidth: 1,
    }
})