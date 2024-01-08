import { sharedKey, generateKeyPair, verify } from 'curve25519-js';
import { bytesToBase64 } from './base64';
import { SessionData, SecSchemeVersion,Sec1Payload, SessionCmd0, SessionResp0, Sec1MsgType, SessionCmd1  } from "./my_proto_pb";
import { WiFiScanMsgType, WiFiScanPayload, CmdScanStart } from './wifi_pb'
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';
import { TextEncoder } from 'text-encoding';



class Provisioner{

    constructor(){

        const random32byte = this.getRandomOfByteLength(32)
        const keyPair = generateKeyPair(random32byte)

        this.clientPrivateKey = keyPair.private;
        this.clientPublicKey = keyPair.public;
        this.pop = 'abcd1234'
        this.devicePublicKey;
        this.deviceRandom;
        this.sharedKey;
        this.deviceVerify
    }

    async establishSecureSession(){

        if(!await this._sendSessionCmd0()){
            throw new Error('ERROR: Could not complete session command 0');
        }
        this.sharedKey = sharedKey(this.clientPrivateKey, this.devicePublicKey)
        await this._sendSessionCmd1()
        //this.verifyDevice()
    }

    async scanForWiFi(){
        try {

            console.log("Entering scan function.")

            const blocking = true
            const passive = false
            const group_channels = 5
            const period_ms = 120

            const wifiScanPayload = new WiFiScanPayload()
            const wiFiCmdScanStart = new CmdScanStart()
            console.log("Objects created...")

            wiFiCmdScanStart.setBlocking(blocking)
            wiFiCmdScanStart.setPassive(passive)
            wiFiCmdScanStart.setGroupChannels(group_channels)
            wiFiCmdScanStart.setPeriodMs(period_ms)
            console.log("Setters executed...")

            wifiScanPayload.setMsg(WiFiScanMsgType.TYPECMDSCANSTART)
            console.log("Messages type setted...")
            wifiScanPayload.setCmdScanStart(wiFiCmdScanStart)

            console.log("Serializing...")
            const body = wifiScanPayload.serializeBinary();
            const contentLength = body.length

            console.log("Sending scan request...")
            const response = await fetch('http://192.168.4.1/prov-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/protobuf',
                    'Content-Length': contentLength.toString()
                },
                body: body
              });
            
            console.log("Request sendt...")
                      
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const responseData = await response.arrayBuffer();

            const wifiScanResult = proto.SessionData.deserializeBinary(new Uint8Array(responseData));
            console.log("Printing Result on next line: ")
            console.log(wifiScanResult.toObject())

        } catch (error) {
            console.error("Error during wifi scan: " + error)
        }

    }

    async _sendSessionCmd0(){

        try{
            const sessionData = new SessionData();    
            const sec1Payload = new Sec1Payload(); 
            const s1SessionCmd0 = new SessionCmd0();  // Create a new instance of S2SessionCmd0   

            const base64ClientPublicKey = bytesToBase64(this.clientPublicKey)
        
            s1SessionCmd0.setClientPubkey(base64ClientPublicKey)
        
            sec1Payload.setMsg(Sec1MsgType.SESSION_COMMAND0)
            sec1Payload.setSc0(s1SessionCmd0)
            sessionData.setSecVer(SecSchemeVersion.SECSCHEME1)
            sessionData.setSec1(sec1Payload)
            const body = sessionData.serializeBinary();

            const contentLength = body.length
        
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
            } 
            else {
                throw new Error('ERROR: No response received');
            }
        
            const sessionData_1 = proto.SessionData.deserializeBinary(new Uint8Array(responseData));
            const sec1 = sessionData_1.getSec1();

            this.devicePublicKey = sec1.getSr0().getDevicePubkey_asU8()
            this.deviceRandom = sec1.getSr0().getDeviceRandom_asU8()
            console.log(sec1.toObject())
            return true

        }catch(e){
            console.error("Error: " + e)
            return false
        }
    }

    async _sendSessionCmd1(){

        const sessionData_2 = new SessionData();    
        const sec1Payload_2 = new Sec1Payload(); 
        const s1SessionCmd1 = new SessionCmd1();

        const textEncoder = new TextEncoder();
        const popByteArray = textEncoder.encode(this.pop);
        const popByteHashed = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, popByteArray)
        const popByteHashedByteArray = new Uint8Array(popByteHashed);

        //const xorKeyAndPop = this.xorByteArrays(this.sharedKey, popByteHashedByteArray)   
        this.sharedKey = this.xorByteArrays(this.sharedKey, popByteHashedByteArray)   

        console.log("xoorKeyAndPop: " + this.sharedKey)
        const hexSharedKey = this.bytesToHex(this.sharedKey).toString()
        console.log("Shared key with PoP: " + this.sharedKey)
      
        const ciphertext = this.encryptData(this.devicePublicKey)
    
        // Get the encrypted message in hexadecimal representation
        const encryptedHex = ciphertext.ciphertext.toString(CryptoJS.enc.Hex);
        console.log('Encrypted Hex:', encryptedHex);

        const encryptionInBytes = this.hexToBytes(encryptedHex)
      
        const cipherToBytes = new Uint8Array(encryptionInBytes)
      
        s1SessionCmd1.setClientVerifyData(cipherToBytes)
      
        sec1Payload_2.setMsg(Sec1MsgType.SESSION_COMMAND1)
        sec1Payload_2.setSc1(s1SessionCmd1)
      
        sessionData_2.setSecVer(SecSchemeVersion.SECSCHEME1)
        sessionData_2.setSec1(sec1Payload_2)
      
        const body_2 = sessionData_2.serializeBinary();
      
        const contentLength_2 = body_2.length//new Uint8Array(body).length.toString();
      
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

        const sessionData_3 = proto.SessionData.deserializeBinary(new Uint8Array(responseData_2));
        const sec1 = sessionData_3.getSec1();
        this.deviceVerify = sec1.getSr1().getDeviceVerifyData_asU8()

        console.log("Device verifyer: " + this.deviceVerify)

/*         if (responseData_2.byteLength > 0) {
          console.log("Response received, length: " + responseData_2.byteLength);
          console.log("Response received: ", sec1.toObject());
      
        } else {
          console.log('No response received');
        } */

    }

    verifyDevice(){

        const randomToHex = this.bytesToHex(this.deviceRandom)//bytesToBase64(deviceRandom)
        const hexSharedKey = this.bytesToHex(this.sharedKey).toString()
        const verifyToHex = this.bytesToHex(this.deviceVerify).toString(16)

        // Your encryption key and IV (Initialization Vector)
        const key = CryptoJS.enc.Hex.parse(hexSharedKey); // 128-bit key
        const iv = CryptoJS.enc.Hex.parse(randomToHex); // 128-bit IV
        const verifyString = CryptoJS.enc.Hex.parse(verifyToHex)

        console.log("Decrypting....")


        const decryptedBytes = CryptoJS.AES.decrypt(
            { ciphertext: verifyString },
            key,
            {
              mode: CryptoJS.mode.CTR,
              iv: iv,
            }
          );
          
          // Convert the decrypted bytes to a string
        const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
        console.log("Decrypted key: " + decryptedKey)
        console.log("My public key: " + this.clientPublicKey)
    }

    encryptData(data){

        const hexSharedKey = this.bytesToHex(this.sharedKey).toString()
        console.log("shared key")
        const randomToHex = this.bytesToHex(this.deviceRandom)//bytesToBase64(deviceRandom)
        console.log("Random")
        const dataHex = this.bytesToHex(data).toString(16)
        console.log("dataHex")

        const key = CryptoJS.enc.Hex.parse(hexSharedKey); // 128-bit key
        const iv = CryptoJS.enc.Hex.parse(randomToHex); // 128-bit IV
        const dataToEncrypt = CryptoJS.enc.Hex.parse(dataHex)
    
        // Encrypt the message using AES-CTR
        const ciphertext = CryptoJS.AES.encrypt(dataToEncrypt, key, {
            mode: CryptoJS.mode.CTR,
            iv: iv,
        });
        return ciphertext
    }

    /*         const randomToHex = this.bytesToHex(this.deviceRandom)//bytesToBase64(deviceRandom)
       
        const devicePubKeyString = this.bytesToHex(this.devicePublicKey).toString(16)
        console.log("Pubkey to encrypt: " + devicePubKeyString)
        // Your encryption key and IV (Initialization Vector)
        const key = CryptoJS.enc.Hex.parse(hexSharedKey); // 128-bit key
        const iv = CryptoJS.enc.Hex.parse(randomToHex); // 128-bit IV
        const publicKeyForEncryption = CryptoJS.enc.Hex.parse(devicePubKeyString)
    
        // Encrypt the message using AES-CTR
        const ciphertext = CryptoJS.AES.encrypt(publicKeyForEncryption, key, {
        mode: CryptoJS.mode.CTR,
        iv: iv,
        }); */


    getRandomOfByteLength(length) {
        const result = [];
        for (let i = 0; i < length; i++) {
          result.push(Math.floor(Math.random() * 8*256));
        }
        return new Uint8Array(result); 
    }

    xorByteArrays(arr1, arr2) {
        
        const result = new Uint8Array(Math.min(arr1.length, arr2.length));
        
        for (let i = 0; i < result.length; i++) {
            result[i] = arr1[i] ^ arr2[i];
        }
        
        return result;
    }

    bytesToHex(bytes) {
        return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    }

    hexToBytes(hex) {
        return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    }
      
}
export default Provisioner;