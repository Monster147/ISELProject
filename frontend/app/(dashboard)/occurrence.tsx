import {StyleSheet} from "react-native";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";

const Occurrence = () =>{
    return(
        <ThemedView style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                Occurence List
            </ThemedText>
        </ThemedView>
    )
}

export default Occurrence

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