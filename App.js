import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import WifiManager from "react-native-wifi-reborn";
import "react-native-get-random-values";
import Provisioner from "./Provisioner";
import React from "react";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import Dashboard from "./views/Dashboard";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  let provisioner; // = new Provisioner()
  const [counter, setCounter] = useState("0");

  const handleSecureSession = async () => {
    setCounter((counter) => {
      counter++;
    });
    provisioner = new Provisioner();
    await provisioner.establishSecureSession();
  };

  const scanForWiFi = async () => {
    if (provisioner instanceof Provisioner) {
      try {
        const res = await provisioner.scanForWiFi();
        console.log(res);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // const handleBarCodeScanned = async ({ type, data }) => {
  //   setScanData(data);
  //   console.log("data: " + data);
  //   console.log("type: " + type);
  // };

  // const qrCodeScanner = async () => {
  //   console.log("Scanning QR code...");
  //   return (
  //     <View style={styles.container}>
  //       <BarCodeScanner
  //         style={StyleSheet.absoluteFillObject}
  //         onBarCodeScanned={scanData ? undefined : handleBarCodeScanned}
  //       />
  //       {scanData && (
  //         <Button title="Scan again?" onPress={setScanData(undefined)} />
  //       )}
  //       <StatusBar style="auto" />
  //     </View>
  //   );
  // };

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
        {/* <Stack.Screen name="QrScanner" component={QrScanner} /> */}
      </Stack.Navigator>
    </NavigationContainer>
    // <View style={styles.container}>
    //   <SignIn />
    // </View>
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

{
  /* <Button color={"green"} title='Connect To ESP AP' onPress={handleEspConnect}/>
      <Button title='Scan QR code' onPress={qrCodeScanner} />
      <Button title='Establish Secure Session' onPress={handleSecureSession}></Button>
      <Button color={"red"} title='Scan for WiFi' onPress={scanForWiFi}></Button> */
}
