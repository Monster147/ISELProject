import { View } from "react-native";

/**
 * Componente de espaçamento genérico.
 * Renderiza uma View invisível com dimensões configuráveis,
 * útil para separar elementos em layouts.
 *
 * @param width Largura do espaço (padrão: `"100%"`).
 * @param height Altura do espaço em píxeis (padrão: `40`).
 */
const Spacer = ({ width = "100%", height = 40 }) => {
  return <View style={{ width, height }} />;
};

export default Spacer;
