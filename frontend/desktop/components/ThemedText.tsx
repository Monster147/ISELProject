import {View, useColorScheme, Text} from "react-native";
import {Colors} from "@commons/constants/Colors";

const ThemedText = ({style, title=false, label = false, ...props}) =>{
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const textColor = title ? theme.title : label ? theme.label : theme.text;
    return(
        <Text
            style={[{color: textColor}, style]}
            {...props}
        />
    )
}

export default ThemedText