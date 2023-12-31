import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
import bigInt from 'big-integer';
import { TextEncoder } from 'text-encoding';
import { connectToSSIDPrefix, connectionStatus } from 'react-native-wifi-reborn';
import {toByteArray} from 'base64-js'
import { btoa, atob } from 'react-native-quick-base64';
import { decode } from 'base-64';

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
    console.log("N: " + this.N);
    console.log("g: " + this.g);

    const decimalN = this.hexToBigInt(this.N)//BigInt('0x' + this.N); // Convert hex string to decimal string

    this.A = bigInt(this.g).modPow(this.a, decimalN).toString();
    console.log("this.A: " + this.A);
    console.log("this.A.Length: " + this.A.length)
    this.S
    this.sharedKey;
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

    const B = this.b64ToBigInt(devicePublickey).toString(16)
    
//Create x
    console.log("B: " + B)
    const saltHex = this.b64ToBigInt(salt) // Uint8Array.from(atob(salt), c => c.charCodeAt(0)).toString(16);
    const Iu_p = this.Iu + ':' + this.p;
    const hash_Iu_p = await this.hashData(Iu_p);
  
    this.x = await this.hashData(saltHex + hash_Iu_p.toString(16));
    console.log("this.x: " + this.x)

  //Create v
    const bigInt_N = bigInt(this.N, 16);
    const bigInt_x = bigInt(this.x, 16);
    const bigInt_g = bigInt(this.g, 16);
    console.log("bigint_N: " + bigInt_N.toString());
    console.log("bigInt_x: " + bigInt_x.toString());
    console.log("bigInt_g: " + bigInt_g.toString());
    this.v = bigInt_g.modPow(bigInt_x, bigInt_N);
    console.log("this.v: " + this.v.toString(16));
  
  //Create k
    const NHash = (await this.hashData(this.N)).toString(16)
    console.log("NHashed: " + NHash)
    const gHash = (await this.hashData(this.g)).toString(16)
    console.log("gHash: " + gHash)
    const concat_G_A = NHash + gHash
    console.log("Concat N and G: " + concat_G_A)

    this.k = await this.hashData(concat_G_A)//this.hashBytes([...NBytes, ...gBytes])
    console.log("this.k: " + this.k)
  
  //Create u
    console.log("this.A type: " + typeof this.A)
    const AHashed = (await this.hashData(this.A)).toString(16)
    console.log("AHashed: " + AHashed)
    const BHashed = (await this.hashData(B)).toString(16)
    console.log("BHashed: " + BHashed)  
    const concat_A_B = AHashed + BHashed 
    this.u = await this.hashData(concat_A_B)
    console.log("this.u: " + this.u)
  
  //Create S
    const bigInt_devicePublicKey = this.b64ToBigInt(devicePublickey);
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
    console.log("******* SHARED KEY: " + this.sharedKey + " ************")
  }


  // Function to hash data using Expo Crypto
  async hashData(data) {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA512,
      data
    );
    return BigInt('0x' + digest);
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

/*   b64ToBigInt(data){
    // Step 1: Decode the base64 string to a byte array
    const byteCharacters = atob(data);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    return BigInt(Array.from(byteArray, byte => byte.toString()).join(""));
  } */

    async hash(input){
      const digest = (await Crypto.digestStringAsync(SHA256, input)).toString(16)
      return digest
    }

    async hashBytes(input){
      const buffer = Buffer.from(input)
      const digest = await Crypto.digestStringAsync(SHA256, buffer.toString('hex'));
      return digest
    }

    getRandomOfLength(length) {
        const min = bigInt(2).pow(length  - 1); // 2^255
        const max = bigInt(2).pow(length).minus(1); // 2^256 - 1

        return bigInt.randBetween(min, max);
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
  
}
 
export default SRP6aClient;
