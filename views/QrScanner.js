import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { BarCodeScanner } from "expo-barcode-scanner";
// import { Camera } from "expo-camera";
import { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import Provisioner from "../Provisioner";
import wifiStore from "../stores/wifiStore";

const QrScanner = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [pop_id, setPop_id] = useState("");

  //let pop_id;
  let provisioner;

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleSecureSession = async () => {
    console.log("Establishing secure session..");
    wifiStore.setPop_id("abcd1234");
    provisioner = new Provisioner(wifiStore.getPop_id());
    await provisioner.establishSecureSession();
    console.log("Secure session established!");
  };

  const scanForWiFi = async () => {
    if (provisioner instanceof Provisioner) {
      try {
        const res = await provisioner.scanForWiFi();
        return res;
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    wifiStore.setPop_id(JSON.parse(data).pop);
    //setPop_id(JSON.parse(data).pop);
    //setPop_id("abcd1234");
    //console.log(pop_id);
    //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const startCommissioning = async () => {
    //setPop_id("abcd1234");
    setScanned(false);
    console.log("Starting commissioning..");
    await handleSecureSession();
    const res = await scanForWiFi();
    console.log("Scan result : ", res);

    wifiStore.emptyAccessPoints();

    res.forEach((ap) => {
      console.log("AP : ", ap);
      wifiStore.addAccessPoint(ap);
    });

    console.log("Wifistore : ", wifiStore.getAccessPoints());
    navigation.navigate("Wifi Scan Result");
    console.log("Commissioning done!");
  };

  const renderCamera = () => {
    return (
      <View
        style={[
          styles.cameraContainer,
          scanned
            ? { borderColor: "white", borderWidth: 3 }
            : { borderColor: "#B4D719" },
        ]}
      >
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
      </View>
    );
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission not granted</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commission your NPC-CONNECT device now!</Text>
      <Text style={styles.paragraph}>
        Scan the QR code to start provisioning.
      </Text>
      {renderCamera()}
      {scanned && (
        <View>
          <Text style={styles.paragraph}>Controller with ID {pop_id}</Text>
          <CustomButton
            title={"Commission Device"}
            color={"#B4D719"}
            onPress={() => startCommissioning()}
          />
        </View>
      )}
      {/* <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Click me QR one more time!")}
        // onPress={() => setScanned(false)}
        //disabled={scanned}
      >
        <Text style={styles.buttonText}>Scan QR to Start your job</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000522",
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#737373",
    justifyContent: "center",
    alignItems: "center",
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 12,
    color: "#999999",
  },
  cameraContainer: {
    width: "80%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
    marginBottom: 40,
    //borderColor: "#B4D719",
    borderWidth: 1,
  },
  camera: {
    flex: 1,
  },
  button: {
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QrScanner;
