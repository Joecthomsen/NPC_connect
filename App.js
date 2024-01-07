import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import WifiManager from 'react-native-wifi-reborn';

import bigInt from 'big-integer';
import { btoa, atob } from 'react-native-quick-base64';
import SRP6aClient from './SRP6a';  // Update the path based on your project structure

import { SessionData, SecSchemeVersion, Sec2Payload, S2SessionCmd0, S2SessionCmd1, Sec2MsgType, Sec1Payload, SessionCmd0, SessionResp0, Sec1MsgType, SessionCmd1  } from "./my_proto_pb";
import { sharedKey, generateKeyPair, verify } from 'curve25519-js';
//import { AES } from 'react-native-crypto-js';
import { bytesToBase64 } from './base64';

//import CryptoJS from 'react-native-crypto-js';
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';
import * as AesCrypto from 'react-native-aes-crypto'; //Virker ikke
import CryptoES from 'crypto-es';
import 'react-native-get-random-values';

//import { decrypt, encrypt, randomKey} from 'react-native-aes-crypto'

//import Aes from 'react-native-aes-crypto'
//import  Aes  from 'react-native-aes-crypto';

function flipEndian(uint8Array) {
  const newArray = new Uint8Array(uint8Array.length);

  for (let i = 0; i < uint8Array.length; i++) {
    newArray[i] = uint8Array[uint8Array.length - 1 - i];
  }

  return newArray;
}


function uint8ArrayToHexString(uint8Array) {
  return Array.from(uint8Array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function xorByteArrays(arr1, arr2) {
  const result = new Uint8Array(Math.min(arr1.length, arr2.length));

  for (let i = 0; i < result.length; i++) {
    result[i] = arr1[i] ^ arr2[i];
  }

  return result;
}

async function hashBytes(input) {
  const textEncoder = new TextEncoder();
  const inputBytes = textEncoder.encode(input);
  const digestHex = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, bytesToHex(inputBytes));
  const digestBytes = hexToBytes(digestHex);
  return digestBytes;
}

function bytesToHex(bytes) {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

// Function to generate a random 32-byte array
function getRandomOfByteLength(length) {
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(Math.floor(Math.random() * 8*256));
  }
  return new Uint8Array(result);
}
function bigIntToByteArray(bigIntValue, byteLength) {
  const byteArray = new Uint8Array(byteLength);
  let current = bigIntValue;

  for (let i = byteLength - 1; i >= 0; i--) {
    byteArray[i] = current.and(0xFF).toJSNumber();
    current = current.shiftRight(8);
  }

  return byteArray;
}

function uint8ArrayToBase64(uint8Array) {
  if (!(uint8Array instanceof Uint8Array)) {
    throw new Error('Input must be a Uint8Array');
  }

  const byteArray = Array.from(uint8Array);
  const b64 = btoa(String.fromCharCode.apply(null, byteArray));

  return b64;
}

function stringToBase64(inputString) {
  if (typeof inputString !== 'string') {
    throw new Error('Input must be a string');
  }

  const utf8Bytes = new TextEncoder().encode(inputString);
  const base64String = btoa(String.fromCharCode.apply(null, utf8Bytes));

  return base64String;
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
    console.log("Serializing... ")
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
  console.log("Response received, length : " + responseData.byteLength);
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

    console.log("client proof lenght: " + clientProof.length)
    const clientProofBase64 = hexToB64(clientProof)
    console.log("clientProofBase64: " + clientProofBase64)
    // Encode the binary data to Base64
    //const clientProofBase64 = btoa(String.fromCharCode.apply(null, clientProofBinary));

    //console.log("clientProofBase64: " + clientProofBase64);


    s2SessionCmd1.setClientProof(clientProofBase64);

    sec2Payload1.setMsg(Sec2MsgType.S2SESSION_COMMAND1);
    sec2Payload1.setSc1(s2SessionCmd1);

    sessionData.setSecVer(SecSchemeVersion.SECSCHEME2);
    sessionData.setSec2(sec2Payload1);

    console.log("Binary data: " + Array.from(new Uint8Array(body), byte => byte.toString(16).padStart(2, '0')).join(''));


    const body = sessionData.serializeBinary();
    console.log("Binary data: " + body)
    const contentLength = body.length//new Uint8Array(body).length.toString();

    console.log("content-length: " + contentLength);

    const deserializedTest = proto.SessionData.deserializeBinary(new Uint8Array(body));
    console.log(deserializedTest.toObject())
    console.log('Sending session command 1...');

    const response = await fetch('http://192.168.4.1/prov-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/protobuf',
        'Content-Length': contentLength.toString()
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

  const encoder = new TextEncoder();

  const clientUserName = encoder.encode("wifiprov")
  const clientPassword = encoder.encode("abcd1234")

  const [counter, setCounter] = useState(0);
  const [response, setResponse] = useState("")
  //const srp = new SRP6a(clientUserName, clientPassword); // Create SRP6a instance
  //console.log("Creating SRP6a instance...");

  const handleClick = async () => {
    setCounter(response => response + 1)

    const random32byte = getRandomOfByteLength(32)
    const keyPair = generateKeyPair(random32byte)
    const privateKey = keyPair.private
    const clientPubKey = keyPair.public

    const base64String1 = uint8ArrayToBase64(clientPubKey)
    const base64String2 = bytesToBase64(clientPubKey)


    //const byteString = String.fromCharCode.apply(null, pubKey);



    console.log("1: " + base64String1)
    console.log("2: " + base64String2)

    const sessionData = new SessionData();    
    const sec1Payload = new Sec1Payload(); 
    const s1SessionCmd0 = new SessionCmd0();  // Create a new instance of S2SessionCmd0   

    s1SessionCmd0.setClientPubkey(base64String2)

    sec1Payload.setMsg(Sec1MsgType.SESSION_COMMAND0)
    sec1Payload.setSc0(s1SessionCmd0)
    sessionData.setSecVer(SecSchemeVersion.SECSCHEME1)
    sessionData.setSec1(sec1Payload)
    const body = sessionData.serializeBinary();

    const contentLength = body.length//new Uint8Array(body).length.toString();

    console.log("content-length: " + contentLength);

    const response = await fetch('http://192.168.4.1/prov-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/protobuf',
        'Content-Length': contentLength.toString()
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

  const sessionData_1 = proto.SessionData.deserializeBinary(new Uint8Array(responseData));
  const sec1 = sessionData_1.getSec1();
  const devicePubkey = sec1.getSr0().getDevicePubkey_asU8()
  const deviceRandom = sec1.getSr0().getDeviceRandom_asU8()
  const hexDevicePubkey = uint8ArrayToHexString(devicePubkey)
  const hexDeviceRandom = uint8ArrayToHexString(deviceRandom)
  console.log("Pub: " + devicePubkey)
  console.log("Rand: " + deviceRandom)
  console.log(sec1.toObject())

  const sKey = sharedKey(privateKey, devicePubkey)
  const test = bytesToHex(sKey)
  console.log("Key Before XOR: " + test)

  console.log("Before flip: " + sKey)
  const flippedKey = flipEndian(sKey)
  console.log("After flip: " + flippedKey)

  
  const popString = 'abcd1234';
  const textEncoder = new TextEncoder();
  const popByteArray = textEncoder.encode(popString);

  
  const popByteHashed = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, popByteArray)
  const popByteHashedByteArray = new Uint8Array(popByteHashed);
  
  const popHashHex = bytesToHex(popByteHashedByteArray);
  console.log("Pop Hash:", popHashHex);  
  
  console.log("SharedKeyFlipped: " + flippedKey)
  console.log("popByteHashedByteArray: " + popByteHashedByteArray)

  console.log("SharedKeyFlipped Length: " + flippedKey.length)
  console.log("popByteHashedByteArray Length: " + popByteHashedByteArray.length)

  const popByteFlipped = flipEndian(popByteHashedByteArray)
  
  const xorKeyAndPop = xorByteArrays(sKey, popByteHashedByteArray)   
  console.log("xoorKeyAndPop: " + xorKeyAndPop)
  console.log("xoorKeyAndPop Length: " + xorKeyAndPop.length)


  const hexSharedKey = bytesToHex(xorKeyAndPop).toString()

  console.log("Shared key with PoP: " + hexSharedKey)

  const randomToHex = bytesToHex(deviceRandom)//bytesToBase64(deviceRandom)

    // Your plaintext message
    const plaintext = 'Hello, World Motha fucka!';  //Insert in encrypt dunction and it works

    const devicePubKeyString = bytesToHex(devicePubkey).toString(16)
    console.log("Pubkey to encrypt: " + devicePubKeyString)
    // Your encryption key and IV (Initialization Vector)
    const key = CryptoJS.enc.Hex.parse(hexSharedKey); // 128-bit key
    const iv = CryptoJS.enc.Hex.parse(randomToHex); // 128-bit IV
    const publicKeyForEncryption = CryptoJS.enc.Hex.parse(devicePubKeyString)

    // Encrypt the message using AES-CTR
    const ciphertext = CryptoJS.AES.encrypt(devicePubKeyString, key, {
      mode: CryptoJS.mode.CTR,
      iv: iv,
    });

    // Get the encrypted message in hexadecimal representation
    const encryptedHex = ciphertext.ciphertext.toString(CryptoJS.enc.Hex);
    console.log('Encrypted Hex:', encryptedHex);


    // Decrypt the message using AES-CTR
    const decryptedBytes = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Hex.parse(encryptedHex) },
      key,
      {
        mode: CryptoJS.mode.CTR,
        iv: iv,
      }
    );

    // Convert the decrypted bytes to a string
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted Text:', decryptedText.toString());

      // Send messages

  console.log("Generating verifyer...")


  const sessionData_2 = new SessionData();    
  const sec1Payload_2 = new Sec1Payload(); 
  const s1SessionCmd1 = new SessionCmd1();

  const encryptionInBytes = hexToBytes(encryptedHex)

  const cipherToBytes = new Uint8Array(cipherToBytes)

  s1SessionCmd1.setClientVerifyData(encryptedHex)

  sec1Payload_2.setMsg(Sec1MsgType.SESSION_COMMAND1)
  sec1Payload_2.setSc1(s1SessionCmd1)

  sessionData_2.setSecVer(SecSchemeVersion.SECSCHEME1)
  sessionData_2.setSec1(sec1Payload_2)

  const body_2 = sessionData_2.serializeBinary();

  const contentLength_2 = body_2.length//new Uint8Array(body).length.toString();

  console.log("content-length: " + contentLength_2);

  const response_2 = await fetch('http://192.168.4.1/prov-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/protobuf',
      'Content-Length': contentLength_2.toString()
    },
    body: body_2
  });

  if (!response_2.ok) {
    throw new Error(`HTTP error! Status: ${response_2.status}`);
  }

  const responseData_2 = await response_2.arrayBuffer();
  if (responseData_2.byteLength > 0) {
    console.log("Response received, length: " + responseData_2.byteLength);
    console.log("Response received: " + responseData_2.toObject());

  } else {
    console.log('No response received');
  }

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
