import { View, useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Contentor temático para a plataforma móvel.
 * Adapta a cor ao esquema de cores do sistema.
 * Quando safe é true, usa SafeAreaView para respeitar as áreas seguras do dispositivo.
 *
 * @param style Estilos adicionais a aplicar ao contentor.
 * @param safe Se true, usa `SafeAreaView`; caso contrário, usa `View`. Por omissão: false.
 * @param props Restantes props passadas ao contentor.
 */
const ThemedView = ({ style, safe = false, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  if (!safe)
    return (
      <View style={[{ backgroundColor: theme.background }, style]} {...props} />
    );

  //const insets= useSafeAreaInsets()

  return (
    <SafeAreaView
      style={[
        {
          backgroundColor:
            theme.background /* paddingTop: insets.top, paddingBottom: insets.bottom*/,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedView;
