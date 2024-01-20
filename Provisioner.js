import { sharedKey, generateKeyPair, verify } from 'curve25519-js';
import { bytesToBase64 } from './base64';
import { SessionData, SecSchemeVersion,Sec1Payload, SessionCmd0, SessionResp0, Sec1MsgType, SessionCmd1  } from "./my_proto_pb";
import { WiFiScanMsgType, WiFiScanPayload, CmdScanStart } from './wifi_pb'
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';
import { TextEncoder } from 'text-encoding';
import bigInt from 'big-integer';



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
        this.verifyDevice()
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
            const encryptedBody = this.encryptData(body)
            const contentLength = body.length

            console.log("Sending scan request...")
            const response = await fetch('http://192.168.4.1/prov-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/protobuf',
                    'Content-Length': contentLength.toString()
                },
                body: encryptedBody
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
/*         const encryptedHex = ciphertext.ciphertext.toString(CryptoJS.enc.Hex);
        console.log('Encrypted Hex:', encryptedHex);

        const encryptionInBytes = this.hexToBytes(encryptedHex)
      
        const cipherToBytes = new Uint8Array(encryptionInBytes) */
      
        s1SessionCmd1.setClientVerifyData(ciphertext)
      
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

        console.log("Device response: ", sessionData_3.toObject())

        console.log("Device verifyer: " + this.deviceVerify)

/*         if (responseData_2.byteLength > 0) {
          console.log("Response received, length: " + responseData_2.byteLength);
          console.log("Response received: ", sec1.toObject());
      
        } else {
          console.log('No response received');
        } */

    }

   

    encryptData(data){

        const hexSharedKey = this.bytesToHex(this.sharedKey).toString()
        const randomToHex = this.bytesToHex(this.deviceRandom)//bytesToBase64(deviceRandom)
        const dataHex = this.bytesToHex(data).toString(16)

        const key = CryptoJS.enc.Hex.parse(hexSharedKey); // 128-bit key
        const iv = CryptoJS.enc.Hex.parse(randomToHex); // 128-bit IV
        const dataToEncrypt = CryptoJS.enc.Hex.parse(dataHex)
    
        // Encrypt the message using AES-CTR
        const ciphertext = CryptoJS.AES.encrypt(dataToEncrypt, key, {
            mode: CryptoJS.mode.CTR,
            iv: iv,
            padding: CryptoJS.pad.NoPadding
        });

        const encryptedHex = ciphertext.ciphertext.toString(CryptoJS.enc.Hex);
        const encryptionInBytes = this.hexToBytes(encryptedHex)
        const cipherToBytes = new Uint8Array(encryptionInBytes)
        return cipherToBytes
    }

    verifyDevice(){
        
        // Your encryption key and IV (Initialization Vector)
        const hexKey = this.bytesToHex(this.sharedKey)
        const hexRandom = this.bytesToHex(this.deviceRandom)
        // Add 6 by first converting to BigInt to avoid precision issues
        const hexRandomBigInt = BigInt(`0x${hexRandom}`); 
        const hexRandomPlusSix = (hexRandomBigInt + BigInt(2)).toString(16);
        
        const key = CryptoJS.enc.Hex.parse(hexKey); // 128-bit key
        const iv = CryptoJS.enc.Hex.parse(hexRandomPlusSix); // 128-bit IV
        const hexVerify = this.bytesToHex(this.deviceVerify)
        

        console.log("Hex random: " + hexRandom)
        console.log('Hex random plus 6: ' + hexRandomPlusSix);
        console.log('Shared Key: ' + hexKey);
        console.log('Device verify: ' + hexVerify + '   Type: ' + typeof hexVerify);
    
        // Decrypt the message using AES-CTR
        const decryptedBytes = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.enc.Hex.parse(hexVerify) },
            key,
            {
                mode: CryptoJS.mode.CTR,
                iv: iv,
                padding: CryptoJS.pad.NoPadding
            }
        );

        console.log("Decrypted Bytes:", decryptedBytes);

        const decryptedHex = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.create(decryptedBytes.words));

        console.log("Decrypted Hex:", decryptedHex);
        console.log("My public key: " + this.bytesToHex(this.clientPublicKey))

    }


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





    verifyDevice_not_working(){

        /*         // Your plaintext message
            const plaintext = 'Hello, World!';
        
            // Your encryption key and IV (Initialization Vector)
            const key = CryptoJS.enc.Hex.parse('2b7e151628aed2a6abf7158809cf4f3c'); // 128-bit key
            const iv = CryptoJS.enc.Hex.parse('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff'); // 128-bit IV
        
            // Encrypt the message using AES-CTR
            const ciphertext = CryptoJS.AES.encrypt(plaintext, key, {
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
         */
        
                const randomToHex = this.bytesToHex(this.deviceRandom).toString(16)//bytesToBase64(deviceRandom)
        
                // Parse the hex string to a decimal, add 4, and then convert back to hex
                const modifiedHexValue = (BigInt("0x" + randomToHex) + 6n).toString(16);
                console.log("TEST::: " + modifiedHexValue )
        
                
                const hexSharedKey = this.bytesToHex(this.sharedKey).toString(16)
                const verifyToHex = this.bytesToHex(this.deviceVerify).toString(16)
        
                console.log("Raw device verify: " +this.deviceVerify)
                console.log("hexSharedKey:", hexSharedKey);
                console.log("randomToHex: ", randomToHex);
                console.log("verifyToHex: ", verifyToHex);
        
                // Your encryption key and IV (Initialization Vector)
                const key = CryptoJS.enc.Hex.parse(hexSharedKey); // 128-bit key
                const iv = CryptoJS.enc.Hex.parse(modifiedHexValue); // 128-bit IV
                const data = CryptoJS.enc.Hex.parse(verifyToHex);
        
        
                console.log("Data: " + data)
        
                console.log("Key:", key);
                console.log("IV:", iv);
                console.log("Data Object: ", data)
                
                console.log("Decrypting....");
        
                
                for(let i = 0 ; i < 20 ; i++){
        
                    const randomToHex2 = this.bytesToHex(this.deviceRandom).toString(16)//bytesToBase64(deviceRandom)
                    const modifiedHexValue2 = (BigInt("0x" + randomToHex2) + BigInt(i)).toString(16);
                    const iv2 = CryptoJS.enc.Hex.parse(modifiedHexValue2); // 128-bit IV
        
        
                    const decryptedBytes2 = CryptoJS.AES.decrypt(   //VIRKER!!!! tror jeg....
                        verifyToHex,
                        key,
                        {
                            mode: CryptoJS.mode.CTR,
                            iv: iv2,
                            padding: CryptoJS.pad.NoPadding
                        }
                    );
                    
        /*             if(i == 0){
                        const decryptedValue2 = CryptoJS.enc.Utf8.stringify(decryptedBytes2);
                        console.log("DECRYPTED::::: " + decryptedValue2)
                    } */
                    
        
                    console.log("Iterration: " + i + " decrypt value: "  + decryptedBytes2 + " iv: " + modifiedHexValue2 + "  result object: ", decryptedBytes2)
        
                }
        
        
                
                const decryptedBytes = CryptoJS.AES.decrypt(
                    verifyToHex,
                        key,
                        {
                            mode: CryptoJS.mode.CTR,
                            iv: iv,
                            padding: CryptoJS.pad.NoPadding
                        }
                );
        
        
                console.log("Decrypted Bytes object: ", decryptedBytes);
        
                if (decryptedBytes.hasOwnProperty("sigBytes")) {
                    console.log("Number of significant bytes:", decryptedBytes.sigBytes);
                    console.log("Decrypted Bytes array:", decryptedBytes.words);
                }
        
                const hexString = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.create(decryptedBytes.words));        
                //console.log("Decrypted bytes as array:", teest);
        
                //const decryptedValue2 = decryptedBytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Value:", hexString);
        
        
        
                console.log("Decrypteed Bytes object: ", decryptedBytes)
                console.log("Decrypted Bytes string: " + decryptedBytes)
        
                const decryptedValue = decryptedBytes.toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Value:", decryptedValue);
                
                // Convert the decrypted bytes to a string
        /*         const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
                const decryptedHex = CryptoJS.enc.Hex.stringify(decryptedBytes); */
        
                
        /* 
                console.log("Decrypted key: " + decryptedKey);
                console.log("Decrypted key hex: ", decryptedHex);
                //console.log("verifyString Hex:", CryptoJS.enc.Hex.stringify(verifyString));
                console.log("Decrypted Bytes Hex:", decryptedHex); */
        
                console.log("My public key: " + this.bytesToHex( this.clientPublicKey));
               
            } 




      
}
export default Provisioner