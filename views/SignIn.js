import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import Layout from "./Layout";
import userStore from "../stores/userStore";
import { observer } from "mobx-react-lite";
import { signInService } from "../service/httpService";
import loadingStore from "../stores/loadingStore";
import { searchForSocketsOnNetwork } from "../service/socketHandler";

export default SignIn = observer(({ navigation }) => {
  const height = useHeaderHeight();

  const buttons = [
    // <Button
    //   key="button1"
    //   title="Button 1"
    //   onPress={() => console.log("Button 1 pressed")}
    // />,
    // <Button
    //   key="button2"
    //   title="Button 2"
    //   onPress={() => console.log("Button 2 pressed")}
    // />,
    // Add more buttons as needed
  ];

  const signIn = async () => {
    loadingStore.setLoading(true);
    const response = await signInService(
      userStore.email,
      userStore.password,
      navigation
    );

    if (response.statusCode === 401) {
      Alert.alert("Invalid credentials", "Please try again");
    } else if (response.statusCode === 500) {
      Alert.alert("Server error", "Wait a minut and try again");
    } else if (response.statusCode === 200) {
      navigation.navigate("Dashboard");
      searchForSocketsOnNetwork();
    }
    loadingStore.setLoading(false);
  };

  return (
    <Layout buttons={buttons}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={height + 100}
      >
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.header_container}>
              <Text style={styles.text_npc}>NPC </Text>
              <Text style={styles.text_connect}>CONNECT</Text>
            </View>
            <View style={styles.form_container}>
              <TextInput
                placeholder="Email"
                style={styles.text_input}
                value={userStore.email}
                onChangeText={(text) => userStore.setEmail(text)}
              />
              <TextInput
                placeholder="Password"
                style={styles.text_input}
                secureTextEntry={true}
                value={userStore.password}
                onChangeText={(password) => userStore.setPassword(password)}
              />
              <View style={styles.signin_button_container}>
                <Button
                  title="Sign In"
                  onPress={() => signIn()}
                  color={"#147CDB"}
                />
              </View>

              <TouchableOpacity onPress={() => navigation.navigate("Sign Up")}>
                <Text style={styles.singup_button}>
                  Not An Account? Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#000522",
    //width: "100%",
    alignItems: "center",
    justifyContent: "start",
  },
  header_container: {
    display: "flex",
    flexDirection: "row",
  },
  text_npc: {
    color: "#B0CD4F",
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 60,
  },
  text_connect: {
    color: "#545454",
    fontSize: 35,
    fontWeight: "normal",
    marginBottom: 20,
    marginTop: 60,
  },
  form_container: {
    display: "flex",
    flexDirection: "column",
    marginTop: 30,
  },
  text_input: {
    color: "#545454",
    fontSize: 20,
    fontWeight: "normal",
    marginBottom: 40,
    backgroundColor: "white",
    width: 300,
    height: 50,
    padding: 10,
    borderRadius: 10,
  },
  signin_button_container: {
    color: "#545454",
    fontSize: 30,
    fontWeight: "normal",
    borderRadius: 10,
  },
  singup_button: {
    marginTop: 10,
    color: "#595959",
    textDecorationLine: "underline",
    fontSize: 15,
    alignSelf: "center",
    marginTop: 40,
  },
});
