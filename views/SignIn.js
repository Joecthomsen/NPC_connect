import { View, Text, StyleSheet, Button } from "react-native";
import Layout from "./Layout";

export default SignIn = () => {
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
      <View style={styles.container}>
        <Text style={styles.text}>Sign In MOFO</Text>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#000522",
    //width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },
});
