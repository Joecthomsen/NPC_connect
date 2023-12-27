import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import WifiManager from 'react-native-wifi-reborn';
import * as Crypto from 'expo-crypto';
import bigInt from 'big-integer';
/* import { SRP } from 'srp6a';
import { SRPClient } from 'srp6a'; */
import SRP6aClient from './SRP6a';  // Update the path based on your project structure


import { SessionData, SecSchemeVersion, Sec2Payload, S2SessionCmd0, S2SessionCmd1, Sec2MsgType } from "./my_proto_pb";
//import { SRPClient } from 'srp6a';

function numberToByteArray(number) {
  const buffer = new ArrayBuffer(8); // Assuming 8 bytes for a double-precision floating-point number
  const view = new DataView(buffer);
  view.setFloat64(0, number); // Assuming a double-precision floating-point number

  // Convert the buffer to a Uint8Array
  const byteArray = new Uint8Array(buffer);

  return byteArray;
}

const sessionCmd0 = async (publicKey, clientUserName) => {
  try {
    const sessionData = new SessionData();    
    const s2SessionCmd0 = new S2SessionCmd0();  // Create a new instance of S2SessionCmd0   
    const sec2Payload = new Sec2Payload();  // Create a new instance of Sec2Payload

/*     const srp = new SRP6a(clientUserName, clientPassword); // Create SRP6a instance */

    //const publicKey = srpInstance.publicKeyBytes;
    //const publicKey = Crypto.getRandomBytes(384); // Generate a random 384-byte public key

    s2SessionCmd0.setClientUsername(clientUserName);
    s2SessionCmd0.setClientPubkey(publicKey);

    sec2Payload.setMsg(Sec2MsgType.S2SESSION_COMMAND0);
    sec2Payload.setSc0(s2SessionCmd0);
    
    sessionData.setSecVer(SecSchemeVersion.SECSCHEME2); // Set the sec_ver field using the setter
    sessionData.setSec2(sec2Payload); // Set the proto field in SessionData with Sec2Payload
    console.log("Serializing...")
    const body = sessionData.serializeBinary();
    console.log("Done serializing");

    const contentLength = body.length.toString();

    console.log('Sending session command 0...');
    
    const response = await fetch('http://192.168.4.1/prov-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/protobuf',
        'Content-Length': contentLength
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

// Assuming the response is in binary protobuf format
const responseData = await response.arrayBuffer();
if (responseData.byteLength > 0) {
  console.log("Response received, length: " + responseData.byteLength);
} else {
  console.log('No response received');
}

//console.log("Raw binary data: " + new Uint8Array(responseData).toString());

const sessionData_2 = proto.SessionData.deserializeBinary(new Uint8Array(responseData));

// Now you can work with the deserialized object
  const sec2 = sessionData_2.getSec2();
  //console.log(sec2.toObject());
  return sec2;

  } catch (error) {
    console.error('Error:', error);
    // Handle errors here
  }
}

const sessionCmd1 = async (clientProof) => {
  try {

    const sessionData = new SessionData();
    const s2SessionCmd1 = new S2SessionCmd1();

    const sec2Payload1 = new Sec2Payload();

    s2SessionCmd1.setClientProof(clientProof);

    sec2Payload1.setMsg(Sec2MsgType.S2SESSION_COMMAND1);
    sec2Payload1.setSc1(s2SessionCmd1);

    sessionData.setSecVer(SecSchemeVersion.SECSCHEME2);
    sessionData.setSec2(sec2Payload1);

    const body = sessionData.serializeBinary();
    
    const contentLength = new Uint8Array(body).length.toString();
    
    console.log("content-length: " + contentLength);
    console.log('Sending session command 1...');

    const response = await fetch('http://192.168.4.1/prov-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/protobuf',
        'Content-Length': contentLength
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.arrayBuffer();
    if (responseData.byteLength > 0) {
      console.log("Response received, length: " + responseData.byteLength);
    } else {
      console.log('No response received');
    }

  const sessionData_2 = proto.SessionData.deserializeBinary(new Uint8Array(responseData));
  // Now you can work with the deserialized object
  const sec2 = sessionData_2.getSec2();
  //console.log(sec2.toObject());
  return sec2;

  }catch (error) {
    console.error('Error:', error);
  }
}

export default function App() {

  const clientUserName = "joecthomsen"
  const clientPassword = "password123"

  const [counter, setCounter] = useState(0);
  const [response, setResponse] = useState("")
  //const srp = new SRP6a(clientUserName, clientPassword); // Create SRP6a instance
  console.log("Creating SRP6a instance...");
  const srp = new SRP6aClient(clientUserName, clientPassword);
  console.log("SRP6a client instance created");
  //const srpClient = new SRPClient('default', crypto.randomBytes);
  const handleClick = async () => {

    console.log("Getting public key")
    const publicKey = srp.getPublicKey();
    console.log("Public key: " + publicKey);
    setCounter(prevCounter => prevCounter + 1);
    //await connectToEsp32AP()
    const bytePubkey = numberToByteArray(publicKey);
    const sessionResponse0 = await sessionCmd0(bytePubkey, clientUserName);
    console.log(sessionResponse0.toObject());
/* 
    const devicePublicKey = sessionResponse0.getSr0().getDevicePubkey_asU8();
    const sharedSecret = srp.getSharedSecret(devicePublicKey);
    const clientProof = await srp.clientProof(devicePublicKey, sharedSecret);
    console.log("Client Proof: " + clientProof); */

    // Check if the client proof length is 64
/*     const clientProofLength = clientProof.length;
    console.log("Client Proof Length: " + clientProofLength);
    
    const sessionResponse1 = await sessionCmd1(clientProof);
    console.log(sessionResponse1.toObject()); */

  }

  return (
    <View style={styles.container}>
      <Text>Hello, wordl MOFO!</Text>
      <Button title='Test Button' onPress={handleClick}></Button>
      <Text>{counter}</Text>
      <Text>Response: {response}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
