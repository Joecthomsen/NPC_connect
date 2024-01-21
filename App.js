import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import WifiManager from 'react-native-wifi-reborn';
import 'react-native-get-random-values';
import Provisioner from './Provisioner';


export default function App() {

  const provisioner = new Provisioner()
  const [counter, setCounter] = useState("0")

  const handleSecureSession = async () => {
    setCounter(counter => {counter++})

    await provisioner.establishSecureSession()
  }

  const scanForWiFi = async () => {
    const res = await provisioner.scanForWiFi()
  }

  const handleEspConnect = async () => {

  }

  return (
    <View style={styles.container}>
      <Text>Hello, wordl MOFO!</Text>
      <Button color={"green"} title='Connect To ESP AP' onPress={handleEspConnect}/>
      <Button title='Establish Secure Session' onPress={handleSecureSession}></Button>
      <Button color={"red"} title='Scan for WiFi' onPress={scanForWiFi}></Button>
      <Text>{counter}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
