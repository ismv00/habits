import "./src/lib/dayjs";
import { StatusBar } from "react-native";

import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

import { Loading } from "./src/components/Loading";
import { Routes } from "./src/routes";

export default function App() {
  //MARK: Garantir que o app carregue as fonts antes de abrir
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      //Chamar o component que carrega uma progress bar
      <Loading />
    );
  }

  return (
    <>
      <Routes />
      <StatusBar
        barStyle={"light-content"}
        backgroundColor="transparent"
        translucent
      />
    </>
  );
}
