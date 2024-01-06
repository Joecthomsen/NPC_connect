import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
import bigInt from 'big-integer';
import { TextEncoder } from 'text-encoding';
import { connectToSSIDPrefix, connectionStatus } from 'react-native-wifi-reborn';
import {toByteArray} from 'base64-js'
import { btoa, atob } from 'react-native-quick-base64';
import { decode } from 'base-64';
//import * as Crypto from 'expo-crypto';
//import { rsa } from 'react-native-crypto';


const SHA256 = Crypto.CryptoDigestAlgorithm.SHA512;

const NG_1024 = 0
const NG_2048 = 1
const NG_3072 = 2
const NG_4096 = 3
const NG_8192 = 4

class SRP6aClient {
  constructor(username, password) {

    this.g = "5";

/*     const N_hex = 'EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3' */
    //this.N = 'EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3'//bigInt(N_hex, 16)
    this.N = 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF'
    /*     const N = bigInt(N_hex, 16)//ngConst[2][2];
    this.N = N.toString(); */
    this.Iu = username.toString();
    this.p = password.toString();

    const N_concat_g = new TextEncoder().encode(this.N + this.g.toString());
    const N_concat_g_str = N_concat_g.toString(); 

    //create k with SHA512
    Crypto.digestStringAsync(SHA256, N_concat_g_str).then(hash => {
      this.k = hash, 16; // Assign the calculated hash to the variable 'k'
      console.log("This.k: " + this.k); // The calculated hash
    }).catch(error => {
      console.error(error);
    });


    this.x
    this.s
    this.u
    this.v
    this.salt
    this.devicePublickey

    this.a = this.getRandomOfLength(256);

    const decimalN = this.hexToBigInt(this.N)//BigInt('0x' + this.N); // Convert hex string to decimal string

    const gXoRa = this.xorByteArrays(this.g, this.a)
    const resBigInt = this.byteArrayToBigInt(gXoRa)
    const NtoBigInt = BigInt('0x' + this.N);
    this.A = resBigInt.mod(NtoBigInt) //.mod(this.N)
    this.S
    this.sharedKey;
  }

/*   xorByteArrays(arr1, arr2) {
    const result = new Uint8Array(Math.max(arr1.length, arr2.length));
  
    for (let i = 0; i < result.length; i++) {
      result[i] = arr1[i] ^ arr2[i];
    }
  
    return result;
  } */

  xorByteArrays(leftBytes, rightBytes) {
    const maxLength = Math.max(leftBytes.length, rightBytes.length);
    const resultBytes = new Uint8Array(maxLength);
  
    for (let i = 0; i < maxLength; i++) {
      const leftByte = i < leftBytes.length ? leftBytes[i] : 0;
      const rightByte = i < rightBytes.length ? rightBytes[i] : 0;
  
      resultBytes[i] = leftByte ^ rightByte;
    }
  
    return resultBytes;
  }

  xorByteWithArray(byte, arr2) {
    const result = new Uint8Array(Math.max(1, arr2.length));
  
    for (let i = 0; i < result.length; i++) {
      result[i] = byte ^ arr2[i];
    }
  
    return result;
  }

  async calculateProof(salt, devicePublickey){


    const hash_N = await this.hash(this.N)//BigInt(parseInt( await Crypto.digestStringAsync(SHA256, N_string), 16)).toString();
    console.log("hash_N: " + hash_N);

    const hash_g = await this.hash(this.g)//BigInt(parseInt( await Crypto.digestStringAsync(SHA256, g_string), 16)).toString();
    console.log("hash_g: " + hash_g);

    const hash_I = await this.hash(this.Iu)//BigInt(parseInt( await Crypto.digestStringAsync(SHA256, this.Iu), 16)).toString();
    console.log("hash_I: " + hash_I);


    const hash_N_XOR_hash_g = hash_N ^ hash_g;

    const N_string = this.N.toString(16)
    const g_string = this.g.toString(16)
    const A_string = this.A.toString(16)
    console.log("hash_N_XOR_hash_g: " + hash_N_XOR_hash_g);

    console.log("salt: " + this.salt);
    console.log("devicePublickey: " + this.devicePublickey);
    console.log("A_string: " + A_string)
    console.log("this.devicePubKey: " + this.devicePublickey)
    console.log("this.sharedKek: " + this.sharedKey)
   
    const concatString = hash_I + this.salt + A_string + this.devicePublickey + this.sharedKey
    console.log("concatString: " + concatString);
    const clientProofForHashing = (hash_N_XOR_hash_g + concatString)
    console.log("clientProofForHash: " + clientProofForHashing)

    const hashedValue = this.hash(clientProofForHashing)

    return hashedValue
  }

  async setSharedKey(salt, devicePublickey) {

    //const B = this.b64ToBigInt(devicePublickey).toString(16)
      //console.log("B: " + this.B)    
    
//Create x
    
    // Make byte representation and concationate s, i and p
    const Iu_p = this.Iu + ':' + this.p;
    const encoder = new TextEncoder();
    const userPasswordBytes = encoder.encode(Iu_p);
    const saltBytes = new Uint8Array(salt)
    const concatenatedData = this.concatenateUint8Arrays(saltBytes, userPasswordBytes) //new Uint8Array(saltBytes + userPasswordBytes)

    this.x = await this.hashData(concatenatedData)
    console.log("this.x: " + this.x)

//Create v
    
    const gXoRx = this.xorByteWithArray(this.g, this.x)
    console.log("xor: " + gXoRx)
    const xorToBigInt = this.byteArrayToBigInt(gXoRx)
    console.log("xorToBigInt: " + xorToBigInt)
    const NtoBigInt = BigInt('0x' + this.N);
    this.v = xorToBigInt.mod(NtoBigInt)
    console.log("This.v: " + this.v)

//Create k
    //Create N hash
    const NBytes = this.hexStringToByteArray(this.N)
    console.log("NBytes: " + NBytes)
    const NHash = await this.hashData(NBytes)//(await this.hashData(this.N)).toString(16)
    console.log("NHashed: " + NHash)
    
    //Create g hash
    const gBytes = this.hexStringToByteArray(this.g)
    const gHash = await this.hashData(gBytes) //(await this.hashData(this.g)).toString(16)
    console.log("gHash: " + gHash)

    //Concationate N and g and hash it
    const concat_G_A = this.concatenateUint8Arrays(NHash, gHash) //new Uint8Array(NHash + gHash)
    console.log("Concat N and G: " + concat_G_A)
    this.k = await this.hashData(concat_G_A)//this.hashBytes([...NBytes, ...gBytes])
    console.log("this.k: " + this.k)
  
//Create u
    const ABytes = this.hexStringToByteArray(this.A)
    console.log("ABytes: " + this.ABytes)
    const AHash = await this.hashData(ABytes)
    console.log("A Hashed: " + AHash)

    const B = new Uint8Array(devicePublickey)

    console.log("Device pubkey: " + B)

    const BHash = await this.hashData(B)
    console.log("BHashed: " + BHash)

    const concat_A_B = this.concatenateUint8Arrays(AHash, BHash)
    console.log("oncat A and B" + concat_A_B)
    this.u = await this.hashData(concat_A_B)
    console.log("This.u: " + this.u)

    
//Create S

    const BHex = BigInt(this.bytesToHex(B).toString());
    console.log('BHex:', BHex, 'Type:', typeof BHex);

    const kHex = BigInt(this.bytesToHex(this.k).toString());
    console.log('kHex:', kHex, 'Type:', typeof kHex);

    // v is already a BigInt
    const vHex = BigInt(this.v.toString());
    console.log("this.v:", vHex, 'Type:', typeof vHex);

    const aHex = BigInt(this.bytesToHex(this.a).toString());
    console.log('aHex:', aHex, 'Type:', typeof aHex);

    const uHex = BigInt(this.bytesToHex(this.u).toString());
    console.log('uHex:', uHex, 'Type:', typeof uHex);

    const xHex = BigInt(this.bytesToHex(this.x).toString());
    console.log('xHex:', xHex, 'Type:', typeof xHex);

    const leftXorTerm = (BHex-(kHex * vHex)).toString(16)
    console.log("LeftTerm: " + leftXorTerm)
    const leftXorTermBytes = this.hexStringToByteArray(leftXorTerm)
    console.log("leftXorBytes: " + leftXorTermBytes)

    const rightXorTerm = aHex + (uHex * xHex).toString(16)
    console.log("RightTerm: " + rightXorTerm)
    const rightXorTermBytes = this.hexStringToByteArray(rightXorTerm)
    console.log("Right xorBytes: " + rightXorTermBytes)

    const xorResult = this.xorByteArrays(leftXorTermBytes, rightXorTermBytes)
    console.log("xor result: " + xorResult)

    const xorResultToBigInt = this.byteArrayToBigInt(xorResult)
    const xorMod = xorResultToBigInt.mod(NtoBigInt)
    const xorModToBytes = this.bigIntToByteArray(xorMod)

    const sharedKeyBytes = await this.hashData(xorModToBytes)
    console.log("Shared key bytes: " + sharedKeyBytes)
    this.sharedKey = this.bytesToHex(sharedKeyBytes)
    console.log("******* SHARED KEY: " + this.sharedKey + " ************")



/*     const bigInt_devicePublicKey = this.b64ToBigInt(devicePublickey);
    console.log("BigInt_devicePublicKey: " + bigInt_devicePublicKey);
    
    const bigInt_k = BigInt("0x" + this.k);  // Assuming this.k is a hexadecimal string
    console.log("bigInt_k: " + bigInt_k);
    
    const bigInt_u = BigInt("0x" + this.u);  // Assuming this.u is a hexadecimal string
    console.log("bigInt_u: " + bigInt_u);
    
    const bigInt_a = BigInt("0x" + this.a);
    console.log("bigInt_a: " + bigInt_a);
    
    const bigInt_v = BigInt("0x" + this.v.toString()); // Convert to string first
    console.log("bigInt_v: " + bigInt_v);

    const bigInt_x_2 = BigInt("0x" + this.x)
    console.log("bigInt_x_2: " + bigInt_x_2)
  
    console.log(typeof bigInt_devicePublicKey, typeof bigInt_k, typeof bigInt_u, typeof bigInt_a, typeof bigInt_v);

    const base = BigInt("0x" +  bigInt_devicePublicKey - (bigInt_k * bigInt_v))
    console.log("Base: " + base)
    const exponent = (bigInt_a + (bigInt_u * bigInt_x_2))
    console.log("Exponent: " + exponent)

    const S = bigInt(base).modPow(exponent, bigInt_N)
    console.log("S: " + S)

    this.S = S.toString(16);
    console.log("this.S: " + this.S);
  
  //Create shared key
    this.sharedKey = await this.hash(this.S)
    console.log("******* SHARED KEY: " + this.sharedKey + " ************") */
  }


  // Function to hash data using Expo Crypto
  async hashData(data) {
      // Data is a BufferSource (e.g., Uint8Array)
      const dataHashed = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA512, data);
      // Handle the hashed data as needed
      const uint8ArrayFromHash = new Uint8Array(dataHashed);
      return uint8ArrayFromHash

  }

  longToBytes(value) {
    // Convert a BigInt value to an array of bytes
    const byteCount = Math.ceil(BigInt(value).toString(2).length / 8);
    const byteArray = new Uint8Array(byteCount);
  
    let index = 0;
    let tempValue = BigInt(value);
    while (tempValue > 0n) {
      byteArray[index++] = Number(tempValue & 0xffn);
      tempValue >>= 8n;
    }
  
    return byteArray.reverse();
  }
  
  padData(data, width) {
    // Pad data with zero bytes to the specified width
    const paddingLength = Math.max(0, width - data.length);
    const padding = new Uint8Array(paddingLength).fill(0);
    return new Uint8Array([...padding, ...data]);
  }


  b64ToBigInt(data) {
    // Step 1: Decode the base64 string to a byte array
    const byteCharacters = atob(data);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
    }

    // Step 2: Convert the byte array to BigInt
    let result = BigInt(0);
    for (let i = 0; i < byteArray.length; i++) {
        result = (result << 8n) | BigInt(byteArray[i]);
    }

    return result;
}

/* 
    async hash(input){
      const digest = (await Crypto.digestStringAsync(SHA256, input)).toString(16)
      return digest
    } */

/*     async hashBytes(input){
      const buffer = Buffer.from(input)
      const digest = await Crypto.digestStringAsync(SHA256, buffer.toString('hex'));
      return digest
    } */

    getRandomOfLength(length) {
        const min = bigInt(2).pow(length  - 1); // 2^255
        const max = bigInt(2).pow(length).minus(1); // 2^256 - 1

        const randomBigInt = bigInt.randBetween(min, max);

        // Convert the big integer to a hexadecimal string
        const hexString = randomBigInt.toString(16);
      
        // Pad the hexadecimal string with zeros to ensure an even length
        const paddedHexString = hexString.length % 2 === 0 ? hexString : '0' + hexString;
      
        // Convert the hexadecimal string to a Uint8Array
        const byteArray = new Uint8Array(paddedHexString.length / 2);
      
        for (let i = 0; i < byteArray.length; i++) {
          const hexPair = paddedHexString.substr(i * 2, 2);
          byteArray[i] = parseInt(hexPair, 16);
        }
      
        return byteArray;
    }

    getNg(ngConst) {
        return [ngConst[2], ngConst[2]];
    }

    getPublicKey(){
        return this.A;
    }

    hexToBigInt(hex){
      return BigInt('0x' + hex);
    }

    hexStringToByteArray(hexString) {
      const byteArray = new Uint8Array(hexString.length / 2);
  
      for (let i = 0; i < hexString.length; i += 2) {
          byteArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
      }
  
      return byteArray;
  }

  byteArrayToBigInt(arr) {
    // Convert Uint8Array to hex string
    const hexString = Array.from(arr)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  
    // Parse hex string to big integer
    const resultBigInt = bigInt(hexString, 16);
  
    return resultBigInt;
  }
  
  bigIntToByteArray(bi, length) {
    const byteArray = new Uint8Array(length);
    const biBytes = bi.toArray(256, true);
  
    for (let i = 0; i < biBytes.length; i++) {
      byteArray[i] = biBytes[i];
    }
  
    return byteArray;
  }

  // Convert base64 to bytes
  base64ToBytes = base64String => {
    const binaryString = decode(base64String);
    const bytes = [];
    for (let i = 0; i < binaryString.length; i++) {
      bytes.push(binaryString[i]);
    }
    return bytes;
  };

  // Convert bytes to hex
  bytesToHex = bytes => {
    return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
  };

  base64ToHex = base64String => {
    // Step 1: Decode base64
    const decodedData = atob(base64String);
    // Step 2: Convert to hex
    const hexValue = Array.from(decodedData).map(byte => byte.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    return hexValue
  }

  concatenateUint8Arrays(arr1, arr2) {
    const result = new Uint8Array(arr1.length + arr2.length);
    result.set(arr1, 0);
    result.set(arr2, arr1.length);
    return result;
  }

  
}
 
export default SRP6aClient;
