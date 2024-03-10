import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Layout from './Layout';
import wifiStore from '../stores/wifiStore';
import WifiCard from '../components/WifiCard';
import { observer } from "mobx-react-lite";

const WifiScanResult = observer(() => {

    useEffect(() => {
        wifiStore.getAccessPoints();
    }, []);
    // wifiStore.getAccessPoints().forEach(ap => {
    //     console.log(ap.ssid)
    // })

    return (
        <Layout buttons={[]}>
            <Text>WifiScanResult</Text>
            <ScrollView>
                <View style={styles.container}>
                    {wifiStore.loading &&             
                        <ActivityIndicator
                            size={"large"}
                            color="#B4D719"
                            style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }], marginTop: 100 }}
                        />
                    }
                    {wifiStore.getAccessPoints().length > 0 ? 
                        wifiStore.getAccessPoints().map((ap, index) => (
                            <WifiCard key={ap.ssid} ssid={ap.ssid} signal={ap.rssi} security={ap.authMode} bbsid={ap.bssid} channel={ap.channel} />
                        )) : 
                        <Text style={styles.text}>No Wifi Access Points found</Text>
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
    text: {
        color: "white",
        fontSize: 20,
        marginBottom: 10,
        marginTop: 10,
        textAlign: "center",
        width: "100%"
    }
})

export default WifiScanResult;