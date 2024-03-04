import { View, ScrollView, Text, StyleSheet, TextInput, Button, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import { useHeaderHeight } from '@react-navigation/elements'
import Layout from "./Layout";
import React from "react";
import CustomButton from "../components/CustomButton";

const Dashboard: React.FC = () => {

  const height = useHeaderHeight()

    const buttons = [
        <Button
          key="button1"
          title="Button 1"
          onPress={() => console.log("Button 1 pressed")}
        />,
        <Button
          key="button2"
          title="Button 2"
          onPress={() => console.log("Button 2 pressed")}
        />,
        // Add more buttons as needed
      ];

    return (
        <Layout buttons={buttons}>
          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={height + 100}>
            <ScrollView>
              <View style={styles.container}>
                <CustomButton onPress={() => console.log("Click me baby one more time!")} title={"MY DEVICES"} color={"#147CDB"} />
                <View style={{flexShrink:1}}>
                  <Text style={styles.text_field}>Prepare your devices and optimize controller settings for seamless operation.</Text>
                </View>
                <View style={{marginBottom: 20}}/>
                <CustomButton onPress={() => console.log("Click me baby one more time!")} title={"DIAGNOSTICS"} color={"#B4D719"} />
                <View style={{flexShrink:1}}>
                  <Text style={styles.text_field}>Effortlessly retrieve comprehensive diagnostic data from all your connected devices.</Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Layout>
    );
};

const styles = StyleSheet.create({
  container:{
      flex: 1,
      width: "100%",
      height: "100%",
      alignItems: "center",
      paddingTop: "15%",
      paddingBottom: "10%",
      paddingHorizontal: 20,
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
  }
})

export default Dashboard;