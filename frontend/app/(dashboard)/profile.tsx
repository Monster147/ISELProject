import {StyleSheet} from "react-native";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";

const Occurence = () =>{
    return(
        <ThemedView style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                Your Profile
            </ThemedText>
        </ThemedView>
    )
}

export default Occurence

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    heading:{
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center'
    }
})