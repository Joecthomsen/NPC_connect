import { sharedKey, generateKeyPair, verify } from 'curve25519-js';
import { bytesToBase64 } from './base64';
import { SessionData, SecSchemeVersion,Sec1Payload, SessionCmd0, SessionResp0, Sec1MsgType, SessionCmd1  } from "./my_proto_pb";
import { WiFiScanMsgType, WiFiScanPayload, CmdScanStart, CmdScanStatus, RespScanStart, CmdScanResult, RespScanResult } from './wifi_pb'
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';
import { TextEncoder } from 'text-encoding';
import bigInt from 'big-integer';

import { 
    pad as CryptoJSPad 
  } from 'crypto-js';



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
        this.aes_ctr = 0
        this.iv;
        this.stb = CryptoJS.lib.WordArray.create([
            0x00000000, 0x00000000, 
            0x00000000, 0x00000000, 
          ])
        this.encrypter;
        this.decrypter;
    }

    async establishSecureSession(){

        //this.decryptData_Test()

        if(!await this._sendSessionCmd0()){
            throw new Error('ERROR: Could not complete session command 0');
        }
        this.sharedKey = sharedKey(this.clientPrivateKey, this.devicePublicKey)
        await this._sendSessionCmd1()
        if(this.verifyDevice()){
            console.log('Secure session established!');
            return;
        } else {
            throw new Error('Device verification failed');
        }
    }

    async scanForWiFi(){
        try {

            console.log("Entering scan function. ")

            const blocking = true
            const passive = false
            const group_channels = 5
            const period_ms = 120

            const wifiScanPayload = new WiFiScanPayload()
            wifiScanPayload.setMsg(WiFiScanMsgType.TYPECMDSCANSTART) 
            wifiScanPayload.setCmdScanStart(new CmdScanStart())
            wifiScanPayload.getCmdScanStart().setBlocking(blocking)
            wifiScanPayload.getCmdScanStart().setPassive(passive)
            wifiScanPayload.getCmdScanStart().setGroupChannels(group_channels)
            wifiScanPayload.getCmdScanStart().setPeriodMs(period_ms)

            console.log("Proto object created: ", wifiScanPayload.toObject())
            console.log("Serializing...")

            const body = wifiScanPayload.serializeBinary();
            console.log("Serializing completed: " , body)
            console.log("Hex : ", this.bytesToHex(body))

            console.log("encrypting...")

            let chunk1 = CryptoJS.enc.Hex.parse( this.bytesToHex(body));
            //let chunk2 = CryptoJS.enc.Hex.parse(this.bytesToHex(body))

            const encyptedBody1 = this.encrypter.process(chunk1)//.toString()//this.encryptData(body)
            const encyptedBody2 = this.encrypter.finalize()//.toString()

            const encryptedBody = encyptedBody1 + encyptedBody2

            console.log("Type:  " + typeof encryptedBody)

            console.log("Encrypted body2: " + encryptedBody)
            console.log("Encrypted body length: ", encryptedBody.length)
            console.log("Data encrypted.")

            const bytestoSend = this.hexToBytes(encryptedBody)
            
            const contentLength = body.length

            console.log("Object: ", wifiScanPayload.toObject())
            console.log("Sending scan request...")  // Send start scan command
            const response = await fetch('http://192.168.4.1/prov-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': "8"
                },
                body: body
              });
            
            console.log("Request sendt...")
            console.log("Response: ", response);
            
                      
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const responseBuffer = await response.arrayBuffer();

            const responseBytes = new Uint8Array(responseBuffer)
            const responseHex = this.bytesToHex(responseBytes)
            console.log("response hex: " + responseHex)
            console.log("Response bytes: " + responseBytes)

/*             const decryptedResponse_1 = this.encrypter.process(responseHex)
            const decryptedResponse_2 = this.enc.finalize()
            const decryptedResponse = decryptedResponse_1 + decryptedResponse_2 */
/* 
            console.log("decrypted 1: ", decryptedResponse_1)
            console.log("decrypted 2: ", decryptedResponse_2)

            console.log("Decrypted response: ", decryptedResponse) */

            const respPayload = WiFiScanPayload.deserializeBinary(responseBytes);

            console.log("Response payload: ", respPayload.toObject());

            var msg = respPayload.getMsg();
            var status = respPayload.getStatus();

            if(msg == 1 && status == 0){
                console.log("Scan started successfully!");
            } else {
                throw new Error(`Could not start scanner! ESP Status: ${status}`);
            }
            
            console.log("Building get status command...")
            wifiScanPayload.setMsg(WiFiScanMsgType.TYPECMDSCANSTATUS) 

            const encryptedBody2 = wifiScanPayload.serializeBinary() //this.encryptData(wifiScanPayload.serializeBinary())

            const response2 = await fetch('http://192.168.4.1/prov-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': encryptedBody2.length.toString()
                },
                body: encryptedBody2
              });

            console.log("Request sendt...");
            if (!response2.ok) {
                throw new Error(`HTTP error! Status: ${response2.status}`);
            }
            const responseBuffer2 = await response2.arrayBuffer();
            const responseBytes2 = new Uint8Array(responseBuffer2)
            
            console.log("Response bytes 2: " + responseBytes2)
            const respPayload2 = WiFiScanPayload.deserializeBinary(responseBytes2);
            console.log("Response payload 2: ", respPayload2.toObject());

            const count = respPayload2.getRespScanStatus().getResultCount();
            const scanFinished = respPayload2.getRespScanStatus().getScanFinished();
            const status2 = respPayload2.getStatus();
            if(status2 == 0){
                if(scanFinished == 1){
                    console.log(`Scan status request successful! Found ${count} networks.`);
                    let networks = [];
                    wifiScanPayload.setMsg(WiFiScanMsgType.TYPECMDSCANRESULT)
                    const cmdScanResult = new CmdScanResult()
                    cmdScanResult.setStartIndex(0)
                    cmdScanResult.setCount(5)
                    wifiScanPayload.setCmdScanResult(cmdScanResult)
                    const encryptedBody3 = wifiScanPayload.serializeBinary()

                    console.log("Sending request...")

                    const response3 = await fetch('http://192.168.4.1/prov-scan', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'Content-Length': encryptedBody3.length.toString()
                        },
                        body: encryptedBody3
                      });

                    console.log("Response received...")
                    
                    const responseScanResult = new RespScanResult()
                    console.log("Deserializing response...")
                    const data = await response3.arrayBuffer()
                    const dataBytes = new Uint8Array(data);
                    console.log("Response bytes: ", dataBytes);
                    const result = WiFiScanPayload.deserializeBinary(dataBytes)
                    console.log("Response scan result: ", result.toObject());
                    const entries = result.getRespScanResult().getEntriesList()
                    for(const entry of entries) {

                        const ssidBytes = entry.getSsid_asU8();
                        const ssid = new TextDecoder().decode(ssidBytes);
                        
                        const bssidBytes = entry.getBssid_asU8();
                        const bssid = new TextDecoder().decode(bssidBytes);
                      
                        console.log(ssid);
                        console.log(bssid);
                      
                    }

                }
                else{
                    console.log("Scan not finished yet... ")
                }
            } else {
                throw new Error(`Could not get scan status! ESP Status: ${status2}`);
            }


        } catch (error) {
            console.error("Error during wifi scan: " + error)
        }

    }

    async _sendSessionCmd0(){

        try{
            this.aes_ctr = 0;
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

            console.log("Device random: " + this.bytesToHex(this.deviceRandom))

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

        this.sharedKey = this.xorByteArrays(this.sharedKey, popByteHashedByteArray)   

        console.log("xoorKeyAndPop: " + this.sharedKey)
        const hexSharedKey = this.bytesToHex(this.sharedKey).toString()
        console.log("Shared key with PoP: " + this.bytesToHex(this.sharedKey))




        //Create encrypter

        const key = CryptoJS.enc.Hex.parse(this.bytesToHex(this.sharedKey));
        const hexRandomBigInt = BigInt(`0x${this.bytesToHex(this.deviceRandom)}`);
        const hexRandomPlusCounter = (hexRandomBigInt + BigInt(2)).toString(16);
        const iv = CryptoJS.enc.Hex.parse(this.bytesToHex(this.deviceRandom));
        //const iv = CryptoJS.enc.Hex.parse(hexRandomPlusCounter);

        console.log("IV from device random: " + iv);
        console.log("Shared key with PoP: " + this.bytesToHex( this.sharedKey));

        this.encrypter = CryptoJS.algo.AES.createEncryptor(key, {
            mode: CryptoJS.mode.CTR,
            iv: iv,
            padding: CryptoJS.pad.NoPadding
        })

        console.log("Encrypter created with shared key and device random")

        this.decrypter = CryptoJS.algo.AES.createDecryptor(key, {
            mode: CryptoJS.mode.CTR,
            iv: iv,
            padding: CryptoJS.pad.NoPadding
        })

/*         let test = this.encrypter.process("This is nothing but a silly test, i have no idea of what to write, so now im just writing some rubbish!")
        let test2 = this.encrypter.finalize()
        console.log("Encrypted: ", test);

        let decryptedTest = this.decrypter.process(test).toString(CryptoJS.enc.Utf8);
        let decrypterFinalize = this.decrypter.process(test2).toString(CryptoJS.enc.Utf8);
        console.log(decryptedTest);
        console.log("Finalize: ", decrypterFinalize) */

        let chunk1 = CryptoJS.enc.Hex.parse( this.bytesToHex( this.devicePublicKey.slice(0,16)));
        let chunk2 = CryptoJS.enc.Hex.parse( this.bytesToHex( this.devicePublicKey.slice(16)));
        console.log("device publicKey: ", this.bytesToHex( this.devicePublicKey));
        console.log("Device public key split into chunks: ", chunk1, chunk2);
        console.log("device key length: ", this.devicePublicKey.length);
        //const test = this.encryptData(this.devicePublicKey)
        //console.log("TEST: ", test)
        let encryptedChunk1 = this.encrypter.process(chunk1); 
        let encryptedChunk2 = this.encrypter.process(chunk2);
        let encryptedPublicKey = encryptedChunk1 + encryptedChunk2; 

        console.log("encrypted 1: " + encryptedChunk1);
        console.log("encrypted 2: " + encryptedChunk2);

        console.log("Encrypted device public key in chunks : ", encryptedPublicKey);

        //const ciphertext = this.encrypter.process(this.bytesToHex(this.devicePublicKey).toString(16))// this.encryptData(this.devicePublicKey)
        //const finalizeing = this.encrypter.finalize()

        console.log("Encrypted device public key: ", encryptedPublicKey.toString(CryptoJS.enc.Utf8));

        s1SessionCmd1.setClientVerifyData(this.hexToBytes(encryptedPublicKey))

        console.log("SessionCmd1 payload set with encrypted device public key: ", s1SessionCmd1.getClientVerifyData())
      
        sec1Payload_2.setMsg(Sec1MsgType.SESSION_COMMAND1)
        sec1Payload_2.setSc1(s1SessionCmd1)
      
        sessionData_2.setSecVer(SecSchemeVersion.SECSCHEME1)
        sessionData_2.setSec1(sec1Payload_2)

        console.log("session data: ", sessionData_2.toObject())
      
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
    }

    padTo32Bytes(hexStr) {
        return hexStr.padStart(32 * 2, '0'); 
    }

    // new method 
    encryptData(data) {

        let counter = 0;
    
        const plaintext = CryptoJS.enc.Hex.parse(this.bytesToHex(data));
        const ciphertext = CryptoJS.lib.WordArray.create();
    
        for(let i=0; i < plaintext.sigBytes; i+=16) {
    
        counter++;
        const ctr = CryptoJS.lib.WordArray.create([counter]);
        const keyStream = this.encrypter.process(ctr);
    
        ciphertext.concat(plaintext.clone().xor(keyStream)); 
        }
    
        return ciphertext.toString(CryptoJS.enc.Hex);
    
    }

    verifyDevice(){

        console.log("this.deviceVerify: ", this.deviceVerify);
        console.log("this.deviceVerify length: ", this.deviceVerify.length);

        const dataChunck_1 = CryptoJS.enc.Hex.parse(this.bytesToHex( this.deviceVerify.slice(0, 16)));
        const dataChunck_2 = CryptoJS.enc.Hex.parse(this.bytesToHex(this.deviceVerify.slice(16, 32)));

        const decryptedBytesChunck_1 = this.encrypter.process(dataChunck_1).toString()
        const decryptedBytesChunck_2 = this.encrypter.process(dataChunck_2).toString()

        console.log("Decrypted Bytes Chunk 1: ", decryptedBytesChunck_1)
        console.log("Decrypted Bytes Chunk 2: ", decryptedBytesChunck_2)

        const decryptedDeviceVerify = decryptedBytesChunck_1 + decryptedBytesChunck_2;

        console.log("Client Public Key: ", this.bytesToHex(this.clientPublicKey))
        console.log("Device verify: ", decryptedDeviceVerify)

        return decryptedDeviceVerify === this.bytesToHex(this.clientPublicKey)
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
    
    aes_ctr_incrementer(sigBytes){
        
        let roundedBytes;
        const bytestoVerify = sigBytes/16;

        if(!Number.isInteger(bytestoVerify)) {
          roundedBytes = Math.ceil(bytestoVerify);
        } else {
          roundedBytes = bytestoVerify;
        }
        this.aes_ctr = parseInt(this.aes_ctr) + roundedBytes;
        console.log('Incremented AES counter: ' + this.aes_ctr);
    }
}
export default Provisioner