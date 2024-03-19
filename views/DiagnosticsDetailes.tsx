import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Layout from "./Layout";
import IconButton from "../components/IconButton";
import controllerStore from "../stores/controllerStore";

const DiagnosticsDetailes: React.FC = () => {

    const buttons = [
        <IconButton
          iconName={"person-outline"}
          onPress={() => console.log("Click me baby one more time!")}
          size={36}
          color="white"
        />,
        <IconButton
          iconName={"sunny-outline"}
          onPress={() => console.log("Click me baby one more time!")}
          size={36}
          color="white"
        />,
      ];

    return(
        <Layout buttons={buttons}>
            <ScrollView >
                <View style={styles.paddingTop}/>
                <Text style={styles.text}>Manufactoring ID: {controllerStore.getSelectedControleGearManuId()}</Text>
                <Text style={styles.text}>
                Operating time:{" "}
                {Math.floor(
                    parseInt(controllerStore.diagnosticsData.operating_time) /
                    (60 * 60 * 24)
                )}{" "}
                days and{" "}
                {Math.floor(
                    (parseInt(controllerStore.diagnosticsData.operating_time) %
                    (60 * 60 * 24)) /
                    (60 * 60)
                )}{" "}
                hours
                </Text>
                <Text style={styles.text}>
                Light source on time:{" "}
                {Math.floor(
                    parseInt(controllerStore.diagnosticsData.light_source_on_time) /
                    (60 * 60 * 24)
                )}{" "}
                days and{" "}
                {Math.floor(
                    (parseInt(controllerStore.diagnosticsData.light_source_on_time) %
                    (60 * 60 * 24)) /
                    (60 * 60)
                )}{" "}
                hours
                </Text>
                <Text style={styles.text}>Light source faliure: {controllerStore.diagnosticsData.light_source_overall_faliure_condition ? <Text style={{color: "red"}}>True</Text> : <Text style={{color: "green"}}>False</Text>}</Text>
                <Text style={styles.text}>Light source faliures counter: {controllerStore.diagnosticsData.light_source_overall_faliure_condition_counter}</Text>
                <Text style={styles.text}>NPC Driver faliure: {controllerStore.diagnosticsData.overall_faliure_condition ? <Text style={{color: "red"}}>True</Text> : <Text style={{color: "green"}}>False</Text>}</Text>
                <Text style={styles.text}>External supply Voltage: {Math.floor(parseInt( controllerStore.diagnosticsData.external_supply_voltage)/10)}V</Text>
                <Text style={styles.text}>Driver temperature: <Text style={{color: "green"}}> {parseInt(controllerStore.diagnosticsData.temperature) - 60}°C </Text> </Text>
                <Text style={styles.text}>Light source start counter: {controllerStore.diagnosticsData.light_source_start_counter}</Text>
                <Text style={styles.text}>Light source voltage: {parseInt( controllerStore.diagnosticsData.light_source_voltage)/10}V</Text>
                <Text style={styles.text}>Light source current: {parseInt( controllerStore.diagnosticsData.light_source_current)/1000}A</Text>
                <Text style={styles.text}>Light source faliure with open circuit: {controllerStore.diagnosticsData.light_source_open_circuit ? <Text style={{color: "red"}}>True</Text> : <Text style={{color: "green"}}>False</Text>}</Text>
                <Text style={styles.text}>Light source faliure with short circuit: {controllerStore.diagnosticsData.light_source_short_circuit ? <Text style={{color: "red"}}>True</Text> : <Text style={{color: "green"}}>False</Text>}</Text>
                <Text style={styles.text}>Updated At:{" "}{new Date(controllerStore.diagnosticsData.updatedAt.$date).toLocaleString()}
                </Text>
            </ScrollView>
        </Layout>
    )
}

const styles = StyleSheet.create({
    paddingTop: {
        marginTop: "10%",
    },
    container: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "15%",
    },
    text:{
        display: "flex",
        fontSize: 16,
        margin: 10,
        color: "#545454",
        alignItems: "flex-start",
    }
})

export default DiagnosticsDetailes;
