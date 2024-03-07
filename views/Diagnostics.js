import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import React from "react";
import Layout from "./Layout";
import IconButton from "../components/IconButton";
import userStore from "../stores/userStore";

const Diagnostics = () => {
  const { width } = Dimensions.get("window");

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

  return (
    <Layout buttons={buttons}>
      <Text>Diagnostics</Text>
      <View style={[styles.container, { width: width }]}>
        <ScrollView horizontal={true}>
          {userStore.controllers.map((controller) => (
            <View style={styles.controller_button_container}>
              <IconButton
                key={controller.popID}
                iconName={"hardware-chip-outline"}
                color={"#9214bc"}
                size={50}
              />
              <Text style={styles.controller_button_text}>
                {controller.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <Text>Diagnostics</Text>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.15,
    backgroundColor: "#000833",
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    //width: 300,
    //height: 20,
    marginTop: -200,
  },
  controller_button_container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  controller_button_text: {
    fontSize: 15,
    fontWeight: "normal",
    color: "#9214bc",
    textAlign: "center",
  },
});

export default Diagnostics;
