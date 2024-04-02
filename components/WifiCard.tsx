import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Text, Modal, Button, TextInput, Alert } from 'react-native';
import { Dimensions } from 'react-native';
import IconButton from './IconButton';
import { observer } from "mobx-react-lite";
import { Ionicons } from '@expo/vector-icons'; // Import icon library
import Provisioner from '../Provisioner';
import CustomButton from './CustomButton';
import TextButton from './TextButton';
import wifiStore from '../stores/wifiStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addControllerService } from '../service/httpService';
import controllerStore from '../stores/controllerStore';
import loadingStore from '../stores/loadingStore';
import { connectToSocketOnNetwork, searchForSocketsOnNetwork, sendMessageToSocketOnNetwork } from '../service/socketHandler';
import  WifiManager  from 'react-native-wifi-reborn';

interface WifiCardProps {
    ssid: string;
    bbsid: string;
    channel: string;
    signal: string;
    security: string;
    //onPress: () => void;
    navigation?: NativeStackNavigationProp<any>;
}


const WifiCard: React.FC<WifiCardProps> = observer( ({ ssid, signal, security, bbsid, channel, navigation }) => {

    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [password, setPassword] = useState('');


    useEffect(() => {
        const updateWindowWidth = () => {
          setWindowWidth(Dimensions.get('window').width);
        };
    
        Dimensions.addEventListener('change', updateWindowWidth);
    
        return () => {
          // No need to remove event listener here
        };
      }, []);

      const handlePress = async () => {
        setIsModalVisible(true);
      }

      let attempts = 0;
    const maxAttempts = 5;

    const connectToWifiWithRetry = async () => {
        while (attempts < maxAttempts) {
            try {
                await WifiManager.connectToProtectedSSID(wifiStore.getSource_ap_name(), wifiStore.getSource_ap_password(), false, false);
                console.log("Connected to Wi-Fi successfully!");
                return; // If connection is successful, exit the loop
            } catch (e) {
                attempts++;
                console.log(`Error connecting to Wi-Fi. Attempt ${attempts}/${maxAttempts}. Error: ${e}`);
                // Wait for a brief period before retrying
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
            }
        }
        console.log(`Failed to connect to Wi-Fi after ${maxAttempts} attempts.`);
        Alert.alert("Error", "Could not connect to Wi-Fi after multiple attempts.");
    };

    const handleProvision = async (pop_id: string) => {

        loadingStore.setLoading(true);

        console.log("Provisioning WiFi with SSID: " + ssid);
        const provisioner = new Provisioner(wifiStore.getPop_id());
        await provisioner.configureWiFi(ssid, bbsid, wifiStore.getSource_ap_password(), channel );
        await provisioner.applyWiFi();
        

        try{
            await connectToWifiWithRetry();//WifiManager.connectToProtectedSSID(wifiStore.getSource_ap_name(), wifiStore.getSource_ap_password(), false, false);
        }catch(e){
            console.log("Error connecting to wifi. Error: " + e);
            Alert.alert("Error", "Could not connect to WiFi.\n" + e);
        }

        try {
            const reponse = await addControllerService(wifiStore.getPop_id(), controllerStore.getNewControllerName());  //Add the controller to the database   
            if(reponse.statusCode === 201) {
                console.log("Controller added to database");
                searchForSocketsOnNetwork();
                //connectToSocketOnNetwork(wifiStore.getPop_id());
                //sendMessageToSocketOnNetwork(wifiStore.getPop_id(), "GET_MANUFACTORING_ID_ON_BUS");
                navigation?.navigate("Diagnostics")
            }
            else {
                Alert.alert("Error", "Could not add controller. Please try again later.");
                navigation?.navigate("Dashboard");
            }
        } catch (error) {
            console.log("Error adding controller to database. Error: " + error);
                Alert.alert("Error", "Could not add controller. Please try again later.");
                navigation?.navigate("Dashboard");
        }

    

        // TODO: What to do after provissioning. 

        
        // while(!connectToSocketOnNetwork(wifiStore.getPop_id())) {
        //     console.log("Waiting for socket connection to be established");
        //     await new Promise(r => setTimeout(r, 1000));
        // }
        // console.log("Socket connection established");

        // if(navigation) {
        //     navigation.navigate("Dashboard");
        // }
        
        setIsModalVisible(false);

        loadingStore.setLoading(false);

      }

    return(
        <TouchableOpacity style={[styles.container, {width: windowWidth - 100}]} onPress={() => handlePress()}>
            <View style={[styles.container, {width: windowWidth - 100}]}>
                <View style={[styles.card_container, {width: windowWidth}]}>
                    <Text style={styles.text}>{ssid}</Text>
                    <Text style={styles.security}>{security || "Security info not available"}</Text>
                    {/* <Text>{signal}</Text> */}
                    <View style={styles.seperator}></View>
                </View>
                <Ionicons name="wifi-outline" size={36} color="white" style={{marginBottom: 30}} />
            </View>
            {isModalVisible &&
                <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={[styles.modalContainer, {width: windowWidth}]}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modal_header}>Please enter the password for</Text>
                        <Text style={styles.modal_ssid}>{ssid}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#484848"
                            onChangeText={text => wifiStore.setSource_ap_password(text)}
                            secureTextEntry={true}
                            value={wifiStore.source_ap_password}
                        />
                        <View style={styles.modalButtonContainer}>
                            <TextButton color="#147CDB" onPress={() => {setIsModalVisible(false), wifiStore.setSource_ap_password("")}} size={22} >Cancel</TextButton>
                            <TextButton color="#147CDB" onPress={() => handleProvision(wifiStore.getPop_id())} size={22} >Provision</TextButton>
                            {/* <CustomButton onPress={() => setIsModalVisible(false)} title={"Cancel"} color={"#147CDB"} disabled={false}/>
                            <CustomButton onPress={handleProvision} title={"Provision"} color={"#147CDB"} disabled={false}/> */}

                            {/* <Button title="Provision" onPress={handleProvision} />
                            <Button title="Cancel" onPress={() => setIsModalVisible(false)} /> */}
                        </View>
                    </View>
                </View>
                </Modal>
            }
        </TouchableOpacity>
    )
})

const styles = StyleSheet.create({
    container: {
      flex: 1,
      display: "flex",
      flexDirection:"row",  
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000522",
      width: "100%",
    },
    card_container: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        marginBottom: 15,
        borderRadius: 10,
    },
    text:{
        color: "white",
        fontSize: 16,
        fontWeight: "normal",
        textAlign: "left",
    },
    security:{
        color: "#797979",
        fontSize: 12,
        fontWeight: "normal",
        marginTop: 5,
    },
    seperator:{
        height: 1,
        width: "100%",
        backgroundColor: "#222121",
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal_header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#484848",
    },
    modal_ssid: {
        fontSize: 16,
        fontWeight: "normal",
        marginBottom: 10,
        color: "#B4D719",
    },
    modalContent: {
        backgroundColor: '#000522',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    input: {
        height: 40,
        width: 200,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        color:"red",
    },
    modalButtonContainer:{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: 250,
        marginTop: 20,
    }
})

export default WifiCard;