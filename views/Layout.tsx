import React, { ReactNode } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

interface LayoutProps {
    children: ReactNode;
    buttons: ReactNode[];
}

const Layout: React.FC<LayoutProps> = ({ children, buttons }) => {
    return (
        <View style={styles.container}>
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
const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      backgroundColor: "#000522"
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
    }
});

export default Layout;