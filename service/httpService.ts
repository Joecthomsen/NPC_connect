import { NavigationProp } from "@react-navigation/native"
import userStore from "../stores/userStore";
import { JwtPayload, jwtDecode } from "jwt-decode";
import "core-js/stable/atob";   //Import in oder to make jwt decoding work


interface DecodedJwtPayload {
    email: string;
    name: string;
  }


export const signInService = async (email: string, password: string, navigation: NavigationProp<any>) => {

    console.log("email: ", email);
    console.log("password: ", password);
    

  try {
    const response = await fetch("http://65.108.92.248/auth/login", {
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
        console.log(response);
      const data = await response.json();
      console.log(data);
      const {accessToken, refreshToken} = data;
      console.log(accessToken);
      console.log(refreshToken);
      const decodedAccessToken = jwtDecode<JwtPayload>(accessToken);
      console.log(decodedAccessToken);
      userStore.setAccessToken(accessToken);
      userStore.setRefreshToken(refreshToken);
     // userStore.setEmail(decodedAccessToken.email);
      navigation.navigate("Dashboard");
    }
  } catch (error) {
    console.error(error);
    navigation.navigate("Sign In");
  }
};
