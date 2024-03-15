import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Layout from "./Layout";
import IconButton from "../components/IconButton";
import userStore from "../stores/userStore";
import controllerStore from "../stores/controllerStore";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useState } from "react";
import SelectorButton from "../components/SelectorButton";
import { observer } from "mobx-react-lite";

const Diagnostics = observer(() => {
  const { width } = Dimensions.get("window");

  const [selectedButton, setSelectedButton] = useState(0);

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
      <View style={[styles.container, { width: width }]}>
        <ScrollView horizontal={true}>
          {userStore.controllers.map((controller, index) => (
            <View style={styles.controller_button_container} key={index}>
              <SelectorButton
                iconName={"hardware-chip-outline"}
                color={"#9214bc"}
                selectedColor={"#B4D719"}
                selected={index === controllerStore.selectedController}
                size={50}
                text={controller.name}
                onPress={() => controllerStore.setSelectedController(index)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
      <Text>Diagnostics</Text>
    </Layout>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 0.15,
    backgroundColor: "#000833",
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    //width: 300,
    //height: 20,
    marginTop: -250,
  },
  controller_button_container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 35,
  },
  controller_button_text: {
    fontSize: 15,
    fontWeight: "normal",
    color: "#9214bc",
    textAlign: "center",
  },
});

export default Diagnostics;
