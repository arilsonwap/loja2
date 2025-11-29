import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from './src/screens/HomeScreenFirebase';
import DetalhesScreen from "./src/screens/DetalhesScreen";
import TodosProdutosScreen from "./src/screens/TodosProdutosScreen";
import OfertasScreen from "./src/screens/OfertasScreen";  // ✅ AQUI

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detalhes" component={DetalhesScreen} />

        {/* 🔥 NOVA TELA DE OFERTAS */}
        <Stack.Screen name="OfertasScreen" component={OfertasScreen} />

        <Stack.Screen name="TodosProdutos" component={TodosProdutosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
