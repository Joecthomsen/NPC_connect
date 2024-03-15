import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import WifiManager from "react-native-wifi-reborn";
import "react-native-get-random-values";
import Provisioner from "./Provisioner";
import React from "react";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import Dashboard from "./views/Dashboard";
import QrScanner from "./views/QrScanner";
import WifiScanResult from "./views/WifiScanResult";
import Diagnostics from "./views/Diagnostics";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  let provisioner; // = new Provisioner()
  const [counter, setCounter] = useState("0");

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#000522" },
          headerTintColor: "#545454",
        }}
      >
        <Stack.Screen
          name="Sign In"
          component={SignIn}
          // options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Sign Up"
          component={SignUp}
          // options={{ headerShown: false }}
        />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="QrScanner" component={QrScanner} />
        <Stack.Screen name="Wifi Scan Result" component={WifiScanResult} />
        <Stack.Screen name="Diagnostics" component={Diagnostics} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

// const handleEspConnect = async () => {
//   try {
//     console.log("Connecting to ESP AP..");
//     await WifiManager.connectToProtectedSSID("PROV_B54A4C", null);
//     //await WifiManager.connectToSSIDPrefix("PROV_")
//     console.log("Connected to ESP AP");
//   } catch (error) {
//     console.log(error);
//   }
// };

// const handleSecureSession = async () => {
//   setCounter((counter) => {
//     counter++;
//   });
//   provisioner = new Provisioner();
//   await provisioner.establishSecureSession();
// };

// const scanForWiFi = async () => {
//   if (provisioner instanceof Provisioner) {
//     try {
//       const res = await provisioner.scanForWiFi();
//       console.log(res);
//     } catch (err) {
//       console.error(err);
//     }
//   }
// };
