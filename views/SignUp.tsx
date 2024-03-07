import React from "react";
import { View, ScrollView, Text, StyleSheet, TextInput, Button, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import Layout from "./Layout";
import { useState } from "react";
import { useHeaderHeight } from '@react-navigation/elements'
import { useNavigation } from "@react-navigation/native";
import userStore from "../stores/userStore";
import { observer } from 'mobx-react-lite';

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Props {
  navigation: NativeStackNavigationProp<any>;
}


const SignUp: React.FC<Props> = observer(({navigation}) => {

    const height = useHeaderHeight()

    //const navigation = useNavigation();
    const [errorMessage, setErrorMessage] = useState({ email: "", firstName: "", lastName: "", password: "", confirmPassword: "" });
    const [isLoading, setIsLoading] = useState(false);


    const validateForm = () => {
        
        let error = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        }

        if(!userStore.firstName) error.firstName = "Please enter your first name"
        if(!userStore.lastName) error.lastName = "Please enter your last name"
        if(!userStore.email) error.email = "Please enter your email"
        if(!userStore.password) error.password = "Please enter your password"
        if(!userStore.confirmPassword) error.confirmPassword = "Please confirm your password"
        if(userStore.password !== userStore.confirmPassword) error.confirmPassword = "Passwords do not match";

        setErrorMessage(error)

        return Object.values(error).every(message => message === "");
    }

    const handle_submit = async () => {
        if(validateForm()) {
            try {
                setIsLoading(true)
                const response = await fetch("http://95.217.159.233/auth/signUp", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        firstName: userStore.firstName,
                        lastName: userStore.lastName,
                        email: userStore.email,
                        password: userStore.password,
                    })
                })

                userStore.setPassword("")
                userStore.setConfirmPassword("")
                
                if(response.status !== 201) 
                {
                    throw new Error("Something went wrong")
                }
                setIsLoading(false)
                const data = await response.json()
                console.log(data) 
                navigation.navigate("Dashboard")
            } catch (error) {
                console.error(error)
            }
        }
        else {
            console.log("Form is not valid")
        }
    }


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
                        {isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
                        {errorMessage.email ? <Text style={styles.error_message}>{errorMessage.email}</Text> : null}
                        <TextInput style={styles.form_element} placeholder="Email" value={userStore.email} onChangeText={(text) => userStore.setEmail(text)}/>
                        {errorMessage.firstName ? <Text style={styles.error_message}>{errorMessage.firstName}</Text> : null}
                        <TextInput style={styles.form_element} placeholder="First Name" value={userStore.firstName} onChangeText={(text) => userStore.setFirstName(text)}/>
                        {errorMessage.lastName ? <Text style={styles.error_message}>{errorMessage.lastName}</Text> : null}
                        <TextInput style={styles.form_element} placeholder="Last Name" value={userStore.lastName} onChangeText={(text) => userStore.setLastName(text)}/>
                        {errorMessage.password ? <Text style={styles.error_message}>{errorMessage.password}</Text> : null}
                        <TextInput style={styles.form_element} placeholder="Password" secureTextEntry={true} value={userStore.password} onChangeText={(text) => userStore.setPassword(text)}/>
                        {errorMessage.confirmPassword ? <Text style={styles.error_message}>{errorMessage.confirmPassword}</Text> : null}
                        <TextInput style={styles.form_element} placeholder="Repeat Password" secureTextEntry={true} value={userStore.confirmPassword} onChangeText={(text) => userStore.setConfirmPassword(text)}/>
                        <Button title="Sign Up!" onPress={() => handle_submit()} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Layout>
    );
})

const styles = StyleSheet.create({
    container:{
        //flex: 1,
        width: "100%",
        height: "100%",
        alignItems: "center",
        paddingTop: "15%",
        paddingBottom: "10%",
    },
    form_element: {
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
    error_message: {
        color: "red",
        fontSize: 16,
        fontWeight: "normal",
        marginBottom: 0,
        marginTop: 0,
        textAlign: "center",
        width: 300,
        height: 30,
        padding: 0,
        borderRadius: 10,
    }
})

export default SignUp;

