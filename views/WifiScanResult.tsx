import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Layout from './Layout';
import wifiStore from '../stores/wifiStore';
import WifiCard from '../components/WifiCard';
import { observer } from "mobx-react-lite";

const WifiScanResult = observer(() => {
    return (
        <Layout buttons={[]}>
            <Text>WifiScanResult</Text>
            {wifiStore.getAccessPoints().length > 0 ? 
                wifiStore.getAccessPoints().map((ap, index) => (
                    <WifiCard key={index} ssid={ap.ssid} signal={ap.rssi} security={ap.authMode} />
                )) : 
                <Text>No Wifi Access Points found</Text>
            }
        </Layout>
    );
});

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000522",
    },
})

export default WifiScanResult;