import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  Button,
  KeyboardAvoidingView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import Layout from "./Layout";
import React, { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import controllerStore from "../stores/deviceStore";
import { observer } from "mobx-react-lite";
import IconButton from "../components/IconButton";
import userStore from "../stores/userStore";

const Dashboard = observer(({ navigation }) => {
  const height = useHeaderHeight();

  const buttons = [
    <IconButton
      iconName={"person-outline"}
      onPress={() => console.log("Click me baby one more time!")}
    />,
    <IconButton
      iconName={"qr-code-outline"}
      onPress={() => navigation.navigate("QrScanner")}
    />,
  ];

  // Function to map value to a color within the gradient
  const getColorForProgress = (value) => {
    // Calculate the color gradient between red, yellow, and green
    const red = Math.max(
      0,
      Math.min(255, Math.floor((255 * (100 - value)) / 50))
    );
    const green = Math.max(0, Math.min(255, Math.floor((255 * value) / 50)));
    const blue = 0;
    return `rgb(${red},${green},${blue})`;
  };

  console.log("Controllers: ", userStore.controllers);

  return (
    <Layout buttons={buttons}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={height + 100}
      >
        <ScrollView>
          <View style={styles.container}>
            <Text style={styles.greeting}>Welcome, {userStore.name}</Text>
            <CustomButton
              onPress={() => console.log("Click me baby one more time!")}
              title={"ADD DEVICE"}
              color={"#147CDB"}
            />
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.text_field}>
                Quickly connect a new DALI controller by scanning its QR code
                with ease.
              </Text>
            </View>
            <View style={{ marginBottom: 20 }} />
            <CustomButton
              onPress={() => navigation.navigate("Diagnostics")}
              title={"DIAGNOSTICS"}
              color={"#B4D719"}
            />
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.text_field}>
                Effortlessly retrieve comprehensive diagnostic data from all
                your connected devices.
              </Text>
            </View>
            <View style={{ marginBottom: 30 }} />
            <AnimatedCircularProgress
              size={150}
              width={25}
              fill={controllerStore.state}
              tintColor={getColorForProgress(controllerStore.state)} //"#00e0ff"
              backgroundColor="#3d5875"
              arcSweepAngle={180}
              rotation={270}
            >
              {(fill) => (
                <Text
                  style={{ color: "#00e0ff", fontSize: 12, fontWeight: "bold" }}
                >
                  {controllerStore.state}%
                </Text>
              )}
            </AnimatedCircularProgress>
            <Text style={styles.status_text}>{controllerStore.statusText}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingTop: "15%",
    paddingBottom: "10%",
    paddingHorizontal: 20,
  },
  greeting: {
    flex: 1,
    fontSize: 20,
    color: "#00e0ff",
    paddingBottom: 10,
    marginTop: -20,
    marginBottom: 20,
  },
  text_field: {
    flex: 1,
    //flexShrink: 1,
    //flexGrow: 1,
    width: 350,
    maxWidth: 350,
    color: "#484848",
    fontSize: 14,
    height: 80,
    //borderColor: "#7a42f4",
    backgroundColor: "#000833",
    borderWidth: 1,
    marginVertical: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    padding: 10,
    //flexWrap: "wrap",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  status_text: {
    color: "#00e0ff",
    flex: 1,
    fontSize: 16,
    paddingTop: 0,
    marginTop: -50,
  },
});

export default Dashboard;
