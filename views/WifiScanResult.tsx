import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import Layout from './Layout';
import wifiStore from '../stores/wifiStore';
import WifiCard from '../components/WifiCard';
import { observer } from "mobx-react-lite";

const WifiScanResult = observer(() => {

    wifiStore.getAccessPoints().forEach(ap => {
        console.log(ap.ssid)
    })

    return (
        <Layout buttons={[]}>
            <Text>WifiScanResult</Text>
            <ScrollView>
                <View style={styles.container}>
                    {wifiStore.getAccessPoints().length > 0 ? 
                        wifiStore.getAccessPoints().map((ap, index) => (
                            <WifiCard key={ap.ssid} ssid={ap.ssid} signal={ap.rssi} security={ap.authMode} bbsid={ap.bssid} channel={ap.channel} />
                        )) : 
                        <Text>No Wifi Access Points found</Text>
                    }
                </View>
            </ScrollView>
        </Layout>
    );
});

const styles = StyleSheet.create({
    container: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000522",
      width: "100%",
    },
})

export default WifiScanResult;