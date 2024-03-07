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
    const url = "http://95.217.159.233";
    const response = await fetch(url + "/auth/login", {
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
