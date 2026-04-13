import {View, useColorScheme, } from "react-native";
import {Colors} from "@commons/constants/Colors";

const ThemedView = ({style, safe=false, ...props}) =>{
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return(
        <View
            style={[{backgroundColor: theme.background,}, style]}
            {...props}
        />
    )


}

export default ThemedView