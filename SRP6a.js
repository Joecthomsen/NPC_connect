import * as Crypto from 'expo-crypto';
//import { Buffer } from 'buffer';
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

    this.g = "2";

    const N_hex = 'EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3'
    this.N = 'EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3'//bigInt(N_hex, 16)
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
    console.log("this.A: " + this.A)
    console.log("this.devicePubKey: " + this.devicePublickey)
    console.log("this.sharedKek: " + this.sharedKey)
   
    const concatString = hash_I + this.salt + A_string + this.devicePublickey + this.sharedKey
    console.log("concatString: " + concatString);
    const clientProofForHashing = (hash_N_XOR_hash_g + concatString)
    console.log("clientProofForHash: " + clientProofForHashing)

    const hashedValue = this.hash(clientProofForHashing)//parseInt(await Crypto.digestStringAsync(SHA256, clientProofForHashing), 16);
/*     console.log("Hashed value: " + hashedValue)
    const clientProof = BigInt('0x' + hashedValue);
    console.log("Client proof: " + clientProof); */
    
    return hashedValue//BigInt(hashedValue).toString();
  }

  async setSharedKey(salt, devicePublickey) {

/*     const k_string = this.k.toString()
    this.salt = salt.toString()
    this.p = this.p.toString()
    this.A = this.A.toString()
    this.x = parseInt(await Crypto.digestStringAsync(SHA1, k_string + this.salt + this.p), 16).toString() 
    this.v = bigInt(this.g).modPow(this.x, this.N); */
    const k_string = this.k.toString();
    console.log("k_string: " + k_string);

    this.salt = this.b64ToBigInt(salt).toString(16) //salt.toString();
    console.log("salt: " + this.salt);

    this.p = this.p.toString(16);
    console.log("this.p: " + this.p);

    this.A = this.A.toString(16);
    console.log("this.A: " + this.A);

    const concatStringToHash = k_string + this.salt + this.p

    this.x = await this.hash(concatStringToHash)//Crypto.digestStringAsync(SHA256, k_string + this.salt + this.p);
    console.log("this.x: " + this.x);
    console.log("this.x length: " + this.x.length)
    decimal_x = this.hexToBigInt(this.x)
    decimal_N = this.hexToBigInt(this.N)
    this.v = bigInt(this.g).modPow(decimal_x, decimal_N).toString(16);
    console.log("this.v: " + this.v);

    const deviceKeyString = this.b64ToBigInt(devicePublickey).toString(16);
    console.log("deviceKeyString: " + deviceKeyString)
    this.u = await this.hash(this.A + deviceKeyString) // Crypto.digestStringAsync(SHA256, this.A + deviceKeyString)
    console.log("this.u: " + this.u)
    console.log("u.lenght: " + this.u.length)

    this.devicePublickey = this.b64ToBigInt(devicePublickey).toString(16)
    console.log("devidePublickey_string: " + this.devicePublickey)

    const kInt = this.hexToBigInt(this.k);
    console.log("kInt: " + kInt);
    const vInt = this.hexToBigInt(this.v);
    console.log("vInt: " + vInt);
    const deviceKeyToBigInt = this.hexToBigInt(this.devicePublickey)

    const sharedKeyBase = BigInt( deviceKeyToBigInt - (kInt * vInt));
    console.log("sharedKeyBase: " + sharedKeyBase);
    
    console.log("this.u: " + this.u);
    console.log("this.x: " + this.x);
    const uInt = parseInt(this.u, 16);
    const xInt = parseInt(this.x, 16);
    console.log("xInt: " + xInt);
    console.log("uInt: " + uInt);
    const uBigInt = BigInt(uInt);
    const xBigInt = BigInt(xInt);
    console.log("uBigInt: " + uBigInt);
    const exponent = BigInt( this.a.add(uBigInt * xBigInt));
    console.log("exponent: " + exponent);

    const sharedKeyString = (bigInt(sharedKeyBase).modPow(exponent, decimal_N)).toString(16)
    console.log("sharedKeyString: " + sharedKeyString);

    this.sharedKey = await Crypto.digestStringAsync(
      SHA256,
      sharedKeyString
    );
    console.log("Shared key calculated: " + this.sharedKey);
    console.log("Shared key length: " + this.sharedKey.length)
  }

  b64ToBigInt(data){
    // Step 1: Decode the base64 string to a byte array
    const byteCharacters = atob(data);
    console.log("byteCharacters: " + byteCharacters);

    const byteArray = new Uint8Array(byteCharacters.length);
    console.log("byteArray2 length: " + byteArray.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    console.log("byteArray2: " + byteArray);

    return BigInt(Array.from(byteArray, byte => byte.toString()).join(""));

  }

    async hash(input){
      const digest = (await Crypto.digestStringAsync(SHA256, input)).toString(16)
      return digest
    }

    getRandomOfLength(length) {
        const min = bigInt(2).pow(length); // 2^255
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
}
 
export default SRP6aClient;
