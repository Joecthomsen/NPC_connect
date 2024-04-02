import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import Layout from "./Layout";
import IconButton from "../components/IconButton";
import controllerStore from "../stores/controllerStore";
import SelectorButton from "../components/SelectorButton";
import { observer } from "mobx-react-lite";
import {
  fetchDiagnosticsService,
  fetchControllers,
} from "../service/httpService";
import { sendMessageToSocketOnNetwork } from "../service/socketHandler";
import loadingStore from "../stores/loadingStore";
import { AnimatedCircularProgress } from "react-native-circular-progress";

import {
  getColorForProgress,
  getColorForProgressTemperature,
} from "../service/services";

const Diagnostics = observer(({ navigation }) => {
  const [blinking, setBlinking] = React.useState(false);

  const startBlinking = () => {
    setBlinking(true);
    sendMessageToSocketOnNetwork(
      controllerStore.getSelectedController().popID,
      "BLINK_LAMP " + controllerStore.getSelectedControleGearManuId()
    );
  };

  const stopBlinking = () => {
    setBlinking(false);
    sendMessageToSocketOnNetwork(
      controllerStore.getSelectedController().popID,
      "STOP_BLINK"
    );
  };

  const { width } = Dimensions.get("window");

  const handleSeeMore = () => {
    navigation.navigate("Diagnostics Detailes");
  };

  const refreshData = async () => {
    loadingStore.setLoading(true);
    // sendMessageToSocketOnNetwork(
    //   controllerStore.getSelectedController().popID,
    //   "GET_MANUFACTORING_ID_ON_BUS"
    // );

    const controllers = await fetchControllers();
    if (!controllers.statusCode === 200) {
      loadingStore.setLoading(false);
      return Alert.alert("Error", "Error fetching controllers");
    } else {
      console.log("Controller: ", controllers);
      console.log("Controllers: ", controllers.message.controllers);

      controllerStore.setControllers(controllers.message.controllers);

      console.log(controllerStore.getSelectedController().popID);
      const data = await fetchDiagnosticsService(
        controllerStore.getSelectedControleGearManuId()
      );
      controllerStore.setDiagnosticsData(data.message);
    }

    loadingStore.setLoading(false);
  };

  const buttons = [
    <IconButton
      iconName={"refresh-outline"}
      onPress={
        controllerStore.getControllers().length > 0
          ? () => refreshData()
          : () => Alert.alert("No Controllers Found, please add a controller")
      }
      size={36}
      color="white"
    />,
    <IconButton
      iconName={"sunny-outline"}
      onPress={blinking ? () => stopBlinking() : () => startBlinking()}
      size={36}
      color={blinking ? "yellow" : "white"}
    />,
  ];

  useEffect(() => {
    const fetchData = async () => {
      loadingStore.setLoading(true);
      //controllerStore.getControllers();
      console.log("manuID: ", controllerStore.getSelectedControleGearManuId());
      const data = await fetchDiagnosticsService(
        controllerStore.getSelectedControleGearManuId()
      );
      controllerStore.setDiagnosticsData(data.message);
      loadingStore.setLoading(false);
      console.log("Data: ", data);
    };
    if (controllerStore.getControllers().length > 0) {
      fetchData();
    }
  }, [controllerStore.selectedControlGear]);

  return (
    <Layout buttons={buttons}>
      <View style={[styles.container, { width: width }]}>
        <ScrollView horizontal={true}>
          {controllerStore.controllers.map((controller, index) => (
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

      <View style={[styles.controle_gear_container, { width: width }]}>
        {controllerStore.controllers.length > 0 &&
        controllerStore.getSelectedController().controleGears.length > 0 ? (
          <ScrollView horizontal={true}>
            {controllerStore
              .getSelectedController()
              .controleGears.map((controleGear, index) => (
                <View style={styles.controller_button_container} key={index}>
                  <SelectorButton
                    iconName={"bulb-outline"}
                    color={"#9214bc"}
                    selectedColor={"#B4D719"}
                    selected={index === controllerStore.selectedControlGear}
                    size={50}
                    //text={controller.name}
                    onPress={() =>
                      controllerStore.setSelectedControleGear(index)
                    }
                  />
                </View>
              ))}
          </ScrollView>
        ) : (
          <Text style={styles.no_control_gear_text}>No Controle Gears</Text>
        )}
      </View>
      <View style={[styles.information_container, { width: width }]}>
        <View style={styles.allProgressParameterContainer}>
          <View style={styles.progressParameterContainer}>
            <AnimatedCircularProgress
              size={75}
              width={12}
              fill={controllerStore.state}
              tintColor={
                controllerStore.diagnosticsData.expectedLifeTimePercent
                  ? getColorForProgress(
                      Math.floor(
                        parseInt(
                          controllerStore.diagnosticsData
                            .expectedLifeTimePercent
                        )
                      )
                    )
                  : "green"
              } //"#00e0ff"
              backgroundColor="#3d5875"
              arcSweepAngle={180}
              rotation={270}
            >
              {(fill) => (
                <Text
                  style={{ color: "#00e0ff", fontSize: 10, fontWeight: "bold" }}
                >
                  {parseFloat(
                    controllerStore.diagnosticsData.expectedLifeTimePercent
                  ).toFixed(1)}
                  %
                </Text>
              )}
            </AnimatedCircularProgress>
            <Text style={styles.progressParameterText}>Lifetime left</Text>
          </View>

          <View style={styles.progressParameterContainer}>
            <AnimatedCircularProgress
              size={75}
              width={12}
              fill={
                controllerStore.diagnosticsData.temperature
                  ? parseInt(controllerStore.diagnosticsData.temperature) - 50
                  : 0
              }
              tintColor={
                controllerStore.diagnosticsData.expectedLifeTimePercent
                  ? getColorForProgressTemperature(
                      Math.floor(
                        parseInt(controllerStore.diagnosticsData.temperature) -
                          50
                      )
                    )
                  : "green"
              } //"#00e0ff"
              backgroundColor="#3d5875"
              arcSweepAngle={180}
              rotation={270}
            >
              {(fill) => (
                <Text
                  style={{ color: "#00e0ff", fontSize: 10, fontWeight: "bold" }}
                >
                  {parseInt(controllerStore.diagnosticsData.temperature) - 60}°C
                </Text>
              )}
            </AnimatedCircularProgress>
            <Text style={styles.progressParameterText}>Temperature</Text>
          </View>
        </View>

        <TouchableOpacity
          style={{ alignSelf: "flex-end", marginRight: 20 }}
          onPress={() => handleSeeMore()}
        >
          <Text
            style={[
              styles.information_text,
              { alignSelf: "flex-end", color: "white" },
            ]}
          >
            See more . . .
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
    backgroundColor: "#000833",
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
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
  controle_gear_container: {
    flex: 0.2,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#000833",
  },
  no_control_gear_text: {
    fontSize: 20,
    fontWeight: "normal",
    color: "#9214bc",
    textAlign: "center",
  },
  information_container: {
    flex: 0.35,
    // flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 40,
    paddingStart: 20,
    backgroundColor: "#000833",
  },
  information_text: {
    fontSize: 16,
    fontWeight: "normal",
    //color: "#9214bc",
    color: "#545454",
    textAlign: "left",
    margin: 5,
  },
  allProgressParameterContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    //paddingHorizontal: 20,
  },
  progressParameterContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 30,
  },
  progressParameterText: {
    fontSize: 14,
    fontWeight: "light",
    color: "#545454",
    textAlign: "center",
    marginTop: -20,
  },
});

export default Diagnostics;
