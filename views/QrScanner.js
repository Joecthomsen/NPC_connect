import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { BarCodeScanner } from "react-native-camera";

const QrScanner = () => {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Scanned QR code of type ${type} with data: ${data}`);
  };

  useEffect(() => {
    return () => {
      // Cleanup function
      setScanned(false);
    };
  }, []);

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
});

export default QrScanner;
