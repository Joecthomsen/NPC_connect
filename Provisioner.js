import { sharedKey, generateKeyPair, verify } from 'curve25519-js';
import { bytesToBase64 } from './base64';
import { SessionData, SecSchemeVersion,Sec1Payload, SessionCmd0, SessionResp0, Sec1MsgType, SessionCmd1  } from "./my_proto_pb";
import { WiFiScanMsgType, WiFiScanPayload, CmdScanStart, CmdScanStatus, RespScanStart } from './wifi_pb'
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

            console.log("Entering scan function.")

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
            console.log("encrypting...")

            const encryptedBody = this.encryptData(body)
            console.log("Data encrypted.")
            
            const contentLength = encryptedBody.length

            console.log("Sending scan request...")  // Send start scan command
            const response = await fetch('http://192.168.4.1/prov-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': contentLength.toString()
                },
                body: encryptedBody
              });
            
            console.log("Request sendt...")
            console.log("Response: ", response);
            
                      
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const responseBuffer = await response.arrayBuffer();

            const responseBytes = new Uint8Array(responseBuffer)
            console.log("Response bytes: " + responseBytes)

            const decryptedResponse = this.decryptData(responseBytes)

            const respPayload = WiFiScanPayload.deserializeBinary(decryptedResponse);

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

            //this.aes_ctr += 1;   //TODO quick fix - this needs to be dealt with properly. The error origin from the server and the aes_ctr not incrementing proberrly when executing this function

            const encryptedBody2 = this.encryptData(wifiScanPayload.serializeBinary())

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
            const decryptedResponse2 = this.decryptData(responseBytes2)
            console.log("Response bytes 2: " + responseBytes2)
            const respPayload2 = WiFiScanPayload.deserializeBinary(decryptedResponse2);
            console.log("Response payload 2: ", respPayload2.toObject());






/* 
            console.log("encryptedHex: " + encryptedHex);

            const hex = this.bytesToHex(responseBytes);
            console.log("Response Hex: " + hex);
             */

/*             try{
                const respPayload = WiFiScanPayload.deserializeBinary(this.decryptData(responseBytes));
                console.log("Response payload: ", respPayload.toObject());
            }catch(err){
                console.log("Error decrypting response: ", err);
                throw err;
            } */

/*             const decodedResponse = this.decryptData(responseBytes);
            console.log("Decoded TEST: " + this.bytesToHex(decodedResponse));
            this.aes_ctr -= 1
            const decodedResponse2 = this.decryptData(responseBytes);
            console.log("Decoded TEST2: " +  this.bytesToHex(decodedResponse2));
            this.aes_ctr += 1
            const decodedResponse3 = this.decryptData(responseBytes);
            console.log("Decoded TEST3: " +  this.bytesToHex(decodedResponse3));
            this.aes_ctr += 1
            const decodedResponse4 = this.decryptData(responseBytes);
            console.log("Decoded TEST4: " +  this.bytesToHex(decodedResponse4));
            this.aes_ctr += 1
            const decodedResponse5 = this.decryptData(responseBytes);
            console.log("Decoded TEST5: " +  this.bytesToHex(decodedResponse5));
            this.aes_ctr += 1
            const decodedResponse6 = this.decryptData(responseBytes);
            console.log("Decoded TEST6 : " +  this.bytesToHex(decodedResponse6)); 
 */




/*             for(let i = -10; i <= 20; i++) {

                this.aes_ctr = i; 
            
                const decodedResponse = this.decryptData(responseBytes);
            
                console.log("AES counter: " + this.aes_ctr);
                console.log("Decrypted Data: " + decodedResponse);
                const hexme = this.bytesToHex(decodedResponse)
                console.log("hex: " + hexme)
                //console.log("hex: ", hexme)
                console.log("**********************************************")
            
              } */




  



/*             this.aes_ctr += 2 //Increment counter for encryption

            const decodedResponse = this.decryptData(responseBytes);
            console.log("AES counter: " + this.aes_ctr);
            console.log("DecryptedData: ", decodedResponse);
            const decryptedHex = this.bytesToHex(decodedResponse)
            console.log("Decrypted Hex: ", decryptedHex)

            const resp = proto.WiFiScanPayload.deserializeBinary(decryptedHex);
            console.log("Scan response deserialized: ", resp.toObject()); */


    // await new Promise(resolve => setTimeout(resolve, 2000))




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
        //let iv = CryptoJS.enc.Hex.parse(this.bytesToHex(this.deviceRandom));
        const iv = CryptoJS.enc.Hex.parse(hexRandomPlusCounter);

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
        let encryptedChunk1 = this.encrypter.process(chunk1); 
        let encryptedChunk2 = this.encrypter.process(chunk2);
        let encryptedPublicKey = encryptedChunk1 + encryptedChunk2; 

        console.log("encrypted 1: " + encryptedChunk1);
        console.log("encrypted 2: " + encryptedChunk2);

        console.log("Encrypted device public key in chunks : ", encryptedPublicKey);

        //const ciphertext = this.encrypter.process(this.bytesToHex(this.devicePublicKey).toString(16))// this.encryptData(this.devicePublicKey)
        //const finalizeing = this.encrypter.finalize()

        console.log("Encrypted device public key: ", encryptedPublicKey.toString(CryptoJS.enc.Utf8));

        s1SessionCmd1.setClientVerifyData(encryptedPublicKey.toString(CryptoJS.enc.Utf8))

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

    encryptData(data){

        const hexSharedKey = this.bytesToHex(this.sharedKey).toString()
        const randomToHex = this.bytesToHex(this.deviceRandom) //bytesToBase64(deviceRandom)
        const dataHex = this.bytesToHex(data).toString(16)

        const hexRandomBigInt = BigInt(`0x${randomToHex}`);
        const hexRandomPlusCounter= (hexRandomBigInt + BigInt(this.aes_ctr)).toString(16);
        //const paddedData = this.padTo32Bytes(dataHex);

        const key = CryptoJS.enc.Hex.parse(hexSharedKey);
        const iv = CryptoJS.enc.Hex.parse(hexRandomPlusCounter); 
        const dataToEncrypt = CryptoJS.enc.Hex.parse(dataHex)

        console.log("iv: " + hexRandomPlusCounter)
    
        // Encrypt the message using AES-CTR
        const ciphertext = CryptoJS.AES.encrypt(dataToEncrypt, key, {
            mode: CryptoJS.mode.CTR,
            iv: this.iv,
            //padding: CryptoJS.pad.Pkcs7
            padding: CryptoJS.pad.NoPadding
        });

        //this.aes_ctr_incrementer(dataToEncrypt.sigBytes)    //Ensure to increment the aes counter
        this.iv = ciphertext.CipherParams.iv;
        const encryptedHex = ciphertext.ciphertext.toString(CryptoJS.enc.Hex);
        const encryptionInBytes = this.hexToBytes(encryptedHex)
        const cipherToBytes = new Uint8Array(encryptionInBytes)
        return cipherToBytes
    }

    decryptData_Test(){

        // Your encryption key and IV (Initialization Vector)

        //Shared: 0x7ee4523c70686dd8306da23b3d682b3ea89056405ae4299fc0058a2a1e4020d8
        // IV = '0x1f08051e7ea0eca8126e5444b6a498d2'

        const hexKey = 'f741291d5d2bfbfdd1840087fdbc628b8bb768e344dbaf1306b26a09c19d48a4' 
        const hexRandom = 'd5f8bf8173cfab6860d92cdfa9ec752e'

        const byteRandom = this.hexToBytes(hexRandom)

        // Add 6 by first converting to BigInt to avoid precision issues
        //const hexRandomBigInt = BigInt(`0x${hexRandom}`);
        //const hexRandomPlusSix = (hexRandomBigInt + BigInt(this.aes_ctr)).toString(16);

        const data = '468710b0'

        //const hexRandomPlus = (BigInt(hexRandom) + BigInt(0)).toString(16);
        //console.log("Plus: " + hexRandomPlus)

        const key = CryptoJS.enc.Hex.parse(hexKey); // 128-bit key
        const iv = CryptoJS.enc.Hex.parse(hexRandom); // 128-bit IV
        const dataWordArray = CryptoJS.enc.Hex.parse(data); 

        console.log("dataWArray: " + dataWordArray);


        // Decrypt the ciphertext
        const decrypted = CryptoJS.AES.decrypt(
            {ciphertext: dataWordArray},
            key,
            {
                mode: CryptoJS.mode.CTR,
                iv: iv,
                //padding: CryptoJS.pad.AnsiX923
                padding: CryptoJS.pad.NoPadding
            }
        );

        console.log("Decrypted: " + decrypted);

        //this.aes_ctr_incrementer(decrypted.sigBytes);   //Increment the aes counter

        const decryptedHex = decrypted.toString(CryptoJS.enc.Hex);
        const decryptedBytes = this.hexToBytes(decryptedHex);

        console.log("decrypted data: " + decryptedHex);

        return decryptedBytes;

    }

    decryptData(data){

        // Your encryption key and IV (Initialization Vector)
        const hexKey = this.bytesToHex(this.sharedKey)
        const hexRandom = this.bytesToHex(this.deviceRandom)
        // Add 6 by first converting to BigInt to avoid precision issues
        const hexRandomBigInt = BigInt(`0x${hexRandom}`);
        const hexRandomPlusSix = (hexRandomBigInt + BigInt(this.aes_ctr)).toString(16);

        const key = CryptoJS.enc.Hex.parse(hexKey); // 128-bit key
        const iv = CryptoJS.enc.Hex.parse(hexRandomPlusSix); // 128-bit IV

        console.log("IV " + hexRandomBigInt.toString(16))
        console.log("IV plus: " + hexRandomPlusSix);
        console.log("HexKey: " + hexKey)

        console.log("this.iv before : " + this.iv)
        


        // Decrypt the ciphertext
        const decrypted = CryptoJS.AES.decrypt(
            {ciphertext: CryptoJS.enc.Hex.parse(this.bytesToHex(data))},
            key,
            {
                mode: CryptoJS.mode.CTR,
                iv: this.iv,
                //padding: CryptoJS.pad.AnsiX923
                padding: CryptoJS.pad.NoPadding
            }
        );

        console.log("this.iv after decrypt: " + this.iv);

        console.log("with clamp: " + decrypted.clamp());
        console.log("without clamp: " + decrypted);

        //this.aes_ctr_incrementer(decrypted.sigBytes);  //Increment the aes counter
        this.iv = decrypted.CipherParams.iv;
        const decryptedHex = decrypted.toString(CryptoJS.enc.Hex);
        const decryptedBytes = this.hexToBytes(decryptedHex);

        return decryptedBytes;

    }

    verifyDevice(){
        
        const decryptedBytes = this.decryptData(this.deviceVerify);
        console.log("Decrypted bytes: ", decryptedBytes);
        const decryptedHex = this.bytesToHex(decryptedBytes);
        console.log("Decrypted hex: ", decryptedHex);
        
        return decryptedHex === this.bytesToHex(this.clientPublicKey)
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