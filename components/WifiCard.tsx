import React from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';

interface WifiCardProps {
    ssid: string;
    signal: string;
    security: string;
    //onPress: () => void;
}

const WifiCard: React.FC<WifiCardProps> = ({ ssid, signal, security }) => {
    return(
        <ScrollView>
            <View style={styles.container}>
                <Text style={styles.text}>{ssid}</Text>
                <Text>{signal}</Text>
                <Text>{security}</Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000522",
    },
    text:{
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    }
})

export default WifiCard;