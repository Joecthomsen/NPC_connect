import React, { ReactNode } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import IconButton from "../components/IconButton";


interface LayoutProps {
    children: ReactNode;
    buttons: ReactNode[] | typeof IconButton[];
}

const Layout: React.FC<LayoutProps> = ({ children, buttons }) => {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require("../assets/logo_white.png")} style={styles.logo} />
            </View>
            <View style={styles.content}>{children}</View>
            <View style={styles.separator} />
            <View style={styles.buttonContainer}>
                {
                    buttons.map((button, index) => (
                        <TouchableOpacity key={index}>{button}</TouchableOpacity>
                    ))
                }
            </View>
        </View>
    );
};

const { height } = Dimensions.get("window");
const LOGO_CONTAINER_SIZE = height * 0.12; // Calculate logo size based on screen height
const LOGO_SIZE = LOGO_CONTAINER_SIZE * 0.60;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      backgroundColor: "#000522",
      alignItems: "center",
      paddingTop: "15%",
      paddingBottom: "3%",
      paddingHorizontal: "5%",
    },
    logoContainer: {
        height: LOGO_CONTAINER_SIZE,
        width: LOGO_CONTAINER_SIZE,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
        padding: "5%",
        borderRadius: 100,
        shadowColor: "#FFF",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 5,
    },
    logo:{
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        opacity: 0.3,
    },
    content:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    separator: {
        height: 2,
        width: "100%",
        backgroundColor: "#B4D719",
    },
    buttonContainer: {
        height: "13%",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 10,
    }
});

export default Layout;