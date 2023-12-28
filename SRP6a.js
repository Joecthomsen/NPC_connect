import * as Crypto from 'expo-crypto';
//import { Buffer } from 'buffer';
import bigInt from 'big-integer';
import { TextEncoder } from 'text-encoding';
import { connectToSSIDPrefix, connectionStatus } from 'react-native-wifi-reborn';
import {toByteArray} from 'base64-js'
import { btoa, atob } from 'react-native-quick-base64';
import { decode } from 'base-64';

const SHA1 = Crypto.CryptoDigestAlgorithm.SHA1;

const NG_1024 = 0
const NG_2048 = 1
const NG_3072 = 2
const NG_4096 = 3
const NG_8192 = 4

class SRP6aClient {
  constructor(username, password) {

    this.g = "2";

    const N_hex = 'EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3'
    
    const N = bigInt(N_hex, 16)//ngConst[2][2];
    this.N = N.toString();
    this.Iu = username.toString();
    this.p = password.toString();

    const N_concat_g = new TextEncoder().encode(N + this.g.toString());
    const N_concat_g_str = N_concat_g.toString(); 

    //create k with SHA512
    Crypto.digestStringAsync('SHA-512', N_concat_g_str).then(hash => {
      this.k = parseInt(hash, 16); // Assign the calculated hash to the variable 'k'
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
    console.log("N: " + N);
    console.log("g: " + this.g);
    this.A = bigInt(this.g).modPow(this.a, N).toString();
    console.log("this.A: " + this.A);

    this.sharedKey;
  }

  async calculateProof(salt, devicePublickey){

    const hash_N = parseInt(await Crypto.digestStringAsync(SHA1, this.N), 16).toString();
    const hash_g = parseInt( await Crypto.digestStringAsync(SHA1, this.g), 16).toString();
    const hash_I = parseInt( await Crypto.digestStringAsync(SHA1, this.Iu), 16).toString();
    const hash_N_XOR_hash_g = (parseInt(hash_N, 16) ^ parseInt(hash_g, 16)).toString();
    const salt_string = this.salt.toString()
    const devicePublickey_string = this.devicePublickey.toString()
    const sharedKey_string = this.sharedKey.toString();
    
    console.log("salt: " + salt_string);
    console.log("devicePublickey: " + devicePublickey_string);
    console.log("hash_N: " + hash_N);
    console.log("hash_g: " + hash_g);
    console.log("hash_I: " + hash_I);
    console.log("hash_N_XOR_hash_g: " + hash_N_XOR_hash_g);
    console.log("this.A: " + this.A)
    console.log("this.devicePubKey: " + this.devicePublickey)
    console.log("shared key: " + sharedKey_string)
   
    const concatString = hash_I + salt_string + this.A + devicePublickey_string + sharedKey_string

    console.log("concatString: " + concatString);

    return parseInt(await Crypto.digestStringAsync(SHA1, hash_N_XOR_hash_g + concatString), 16);
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

    this.salt = this.b64ToBigInt(salt) //salt.toString();
    console.log("salt: " + this.salt);

    this.p = this.p.toString();
    console.log("this.p: " + this.p);

    this.A = this.A.toString();
    console.log("this.A: " + this.A);

    this.x = parseInt(await Crypto.digestStringAsync(SHA1, k_string + this.salt + this.p), 16).toString();
    console.log("this.x: " + this.x);

    this.v = bigInt(this.g).modPow(this.x, this.N).toString();
    console.log("this.v: " + this.v);

    const deviceKeyString = devicePublickey.toString();
    console.log("deviceKeyString: " + deviceKeyString)
    this.u = parseInt(await Crypto.digestStringAsync(SHA1, this.A + deviceKeyString), 16)
    console.log("this.u: " + this.u)
    console.log("Varialbes init...")

    this.devicePublickey = this.b64ToBigInt(devicePublickey)
    console.log("devidePublickey_string: " + this.devicePublickey)

    const kInt = BigInt(this.k);
    console.log("kInt: " + kInt);
    const vInt = BigInt(this.v);
    console.log("vInt: " + vInt);

    const sharedKeyBase = BigInt( this.devicePublickey - (kInt * vInt));
    console.log("sharedKeyBase: " + sharedKeyBase);
    
    console.log("this.u: " + this.u);
    console.log("this.x: " + this.x);
    const uInt = parseInt(this.u, 16);
    const xInt = parseInt(this.x);
    console.log("xInt: " + xInt);
    console.log("uInt: " + uInt);
    const uBigInt = BigInt(uInt);
    const xBigInt = BigInt(xInt);
    console.log("uBigInt: " + uBigInt);
    const exponent = BigInt( this.a.add(uBigInt * xBigInt));
    console.log("exponent: " + exponent);

    const sharedKeyString = (bigInt(sharedKeyBase).modPow(exponent, this.N)).toString()
    console.log("sharedKeyString: " + sharedKeyString);

    this.sharedKey = parseInt( await Crypto.digestStringAsync(
      SHA1,
      sharedKeyString
    ), 16);
    console.log("Shared key calculated: " + this.sharedKey);
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
}
 
export default SRP6aClient;
