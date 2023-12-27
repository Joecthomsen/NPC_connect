import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import WifiManager from 'react-native-wifi-reborn';
import * as Crypto from 'expo-crypto';
import bigInt from 'big-integer';
/* import { SRP } from 'srp6a';
import { SRPClient } from 'srp6a'; */

import { SessionData, SecSchemeVersion, Sec2Payload, S2SessionCmd0, S2SessionCmd1, Sec2MsgType } from "./my_proto_pb";

class SRP6a {
  constructor(username, password, hashAlg = 'sha256', ngType = 0) {
    //const srp = new SRP('default', this.getRandom256BitNumber());

    this.username = username;
    this.NgConst = [
      [
          'EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3',
          '2',
      ],
      // Add other NG constants as needed
    ];

    const [N, g] = this.NgConst[ngType];

    // Store N and g as properties of the class
    this.N = N;
    this.g = g;

    // Choose a random private key (256-bit)
    this.a = this.getRandom256BitNumber();

    // Calculate public key A
    this.A = bigInt(g).modPow(this.a, bigInt(N, 16));

    // Convert public key A to a 384-byte array
    this.publicKeyBytes = this.convertTo384Bytes(this.A);
}


  getSharedSecret(serverPublicKey) {
    const hexString = Array.from(serverPublicKey, byte => byte.toString(16).padStart(2, '0')).join('');      // Convert the byte array to a hexadecimal string

    const serverPublicKeyBigInt = bigInt(hexString, 16);// Convert the hexadecimal string to a BigInt
    return serverPublicKeyBigInt.modPow(this.a, bigInt(this.N, 16));
  }

  async clientProof(serverPublicKey, sharedSecret, salt) {
    const verifier = this.srp.computeVerifier(this.username, this.password, salt);
/*     const usernameHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      this.username
    );

    const concatenatedData = [
      bigInt(this.N, 16).toString(16),         // The modulus
      bigInt(this.g, 16).toString(16),         // The generator
      bigInt(usernameHash, 16).toString(16),   // Username hash
      serverPublicKey.toString(16),            // Server's public key
      this.A.toString(16),                     // Client's public key
      sharedSecret.toString(16)                // Shared secret
    ].join('');
  
    const clientProof = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      concatenatedData,
    );
    return clientProof; */
    return verifier
  }
  

  getRandom256BitNumber() {
    const min = bigInt(2).pow(255); // 2^255
    const max = bigInt(2).pow(256).minus(1); // 2^256 - 1

    return bigInt.randBetween(min, max);
  }

  convertTo384Bytes(bigIntValue) {
    const hexString = bigIntValue.toString(16);
    const paddedHexString = hexString.padStart(192, '0'); // 192 hex characters = 384 bytes
    const byteArray = Array.from({ length: 384 }, (_, index) =>
      parseInt(paddedHexString.substr(index * 2, 2), 16)
    );

    return Uint8Array.from(byteArray);
  }
}

const connectToEsp32AP = async () => {
  try {
      const wifiManager = new WifiManager();
      console.log('Connecting to ESP32 AP...');
      await wifiManager.connectToProtectedSSID('PROV_B54A4C', null, false).then(
        () => {
          console.log("Connected successfully!");
        },
        () => {
          console.log("Connection failed!");
        }
      );
  } catch (error) {
      console.error('Error connecting to ESP32 AP:', error);
  }
};

const sessionCmd0 = async (srpInstance, clientUserName, clientPassword) => {
  try {
    const sessionData = new SessionData();    
    const s2SessionCmd0 = new S2SessionCmd0();  // Create a new instance of S2SessionCmd0   
    const sec2Payload = new Sec2Payload();  // Create a new instance of Sec2Payload

/*     const srp = new SRP6a(clientUserName, clientPassword); // Create SRP6a instance */

    const publicKey = srpInstance.publicKeyBytes;
    //const publicKey = Crypto.getRandomBytes(384); // Generate a random 384-byte public key

    s2SessionCmd0.setClientUsername(clientUserName);
    s2SessionCmd0.setClientPubkey(publicKey);

    sec2Payload.setMsg(Sec2MsgType.S2SESSION_COMMAND0);
    sec2Payload.setSc0(s2SessionCmd0);
    
    sessionData.setSecVer(SecSchemeVersion.SECSCHEME2); // Set the sec_ver field using the setter
    sessionData.setSec2(sec2Payload); // Set the proto field in SessionData with Sec2Payload

    const body = sessionData.serializeBinary();
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
  const srp = new SRP6a(clientUserName, clientPassword); // Create SRP6a instance
  //const srpClient = new SRPClient('default', crypto.randomBytes);
  const handleClick = async () => {
    //const setupReq = new protoSession.SessionData();
    setCounter(prevCounter => prevCounter + 1);
    //await connectToEsp32AP()
    const sessionResponse0 = await sessionCmd0(srp, clientUserName, clientPassword);
    console.log(sessionResponse0.toObject());

    const devicePublicKey = sessionResponse0.getSr0().getDevicePubkey_asU8();
    const sharedSecret = srp.getSharedSecret(devicePublicKey);
    const clientProof = await srp.clientProof(devicePublicKey, sharedSecret);
    console.log("Client Proof: " + clientProof);

    // Check if the client proof length is 64
    const clientProofLength = clientProof.length;
    console.log("Client Proof Length: " + clientProofLength);
    
    const sessionResponse1 = await sessionCmd1(clientProof);
    console.log(sessionResponse1.toObject());

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
