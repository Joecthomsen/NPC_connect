import { NavigationProp } from "@react-navigation/native"
import userStore from "../stores/userStore";
import { JwtPayload, jwtDecode } from "jwt-decode";
import "core-js/stable/atob";   //Import in oder to make jwt decoding work
import { pop } from "core-js/core/array";
import controllerStore from "../stores/controllerStore";


interface DecodedJwtPayload {
    email: string;
    name: string;
  }

interface addControllerServiceProps {
    name: string;
    popID: string;
}

const URL = "http://95.217.159.233";
  

export const signInService = async (email: string, password: string, navigation: NavigationProp<any>) => {

    console.log("email: ", email);
    console.log("password: ", password);
    

  try {
    //const url = "http://95.217.159.233";
    const response = await fetch(URL + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (response.status !== 200) {
        const data = await response.json();
        console.log(data);
        navigation.navigate("Sign In");
    } 
    else {

      const data = await response.json();
      const {accessToken, refreshToken, controllers} = data;

      const decodedAccessToken = jwtDecode<DecodedJwtPayload>(accessToken);

      console.log(decodedAccessToken);

      userStore.setEmail(decodedAccessToken.email);
      userStore.setName(decodedAccessToken.name);
      userStore.setAccessToken(accessToken);
      userStore.setRefreshToken(refreshToken);
      userStore.setControllers(controllers);

     // userStore.setEmail(decodedAccessToken.email);
      navigation.navigate("Dashboard");
    }
  } catch (error) {
    console.error(error);
    navigation.navigate("Sign In");
  }
};

export const addControllerService = async (popID: string, name: string ) => {
  try {
    //const { name, popID } = props;
    const response = await fetch(URL + "/auth/add_controller", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": userStore.getAccessToken(),
      },
      body: JSON.stringify({
        name: name,
        popID: popID,
      }),
    });

    if (response.status !== 201) {
        console.log("Something went wrong");
        const data = await response.json();
        console.log(data);
    } 
    else {

      const data = await response.json();
      const {refreshToken, controleGears} = data.controller;
      userStore.addController({popID: popID, name: name});

      //Handle TCP transfer of refresh token here. 

    }
    
  } catch (error) {
    console.error(error);
  }
}
