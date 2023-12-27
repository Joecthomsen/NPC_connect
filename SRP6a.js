import * as Crypto from 'expo-crypto';
//import { Buffer } from 'buffer';
import bigInt from 'big-integer';
//global.Buffer = require('buffer').Buffer;

const SHA512 = Crypto.CryptoDigestAlgorithm.SHA512;

const NG_1024 = 0
const NG_2048 = 1
const NG_3072 = 2
const NG_4096 = 3
const NG_8192 = 4


/* 
function bytesToNumber(bytes) {
  return parseInt(Buffer.from(bytes, 'base64').toString('hex'), 16);
}

function numberToBytes(number) {
  const hexString = number.toString(16);
  const paddedHexString = hexString.length % 2 === 0 ? hexString : '0' + hexString;
  return Buffer.from(paddedHexString, 'hex').toString('base64');
}
 */
class SRP6aClient {
  constructor(username, password) {

    const g = 2;

    const N_hex = 'EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3'
    
    const N = bigInt(N_hex, 16)//ngConst[2][2];
    this.Iu = username;
    this.p = password;

    this.a = this.getRandomOfLength(256);
    console.log("N: " + N);
    console.log("g: " + g);
    this.A = bigInt(g).modPow(this.a, N);
    console.log("this.A: " + this.A);


/*     this.v = null;
    this.K = null;
    this.H_AMK = null;
    this.authenticated = false;

    this.hashClass = hashClass;
    this.N = N;
    this.g = g;
    this.k = k; */
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
/* 
  longToBytes(longValue) {
    const hexString = longValue.toString(16);
    const paddedHexString = hexString.length % 2 === 0 ? hexString : '0' + hexString;
    return Buffer.from(paddedHexString, 'hex');
  } */
/* 
  authenticated() {
    return this.authenticated;
  }

  get_username() {
    return this.Iu;
  }

  get_ephemeral_secret() {
    return numberToBytes(this.a);
  }

  get_session_key() {
    return this.authenticated ? this.K : null;
  }

  async start_authentication() {
    return [this.Iu, await Crypto.digestStringAsync(SHA512, numberToBytes(this.A))];
  }

  async process_challenge(bytes_s, bytes_B) {
    const s = bytesToNumber(bytes_s);
    const B = bytesToNumber(bytes_B);

    const N = this.N;
    const g = this.g;
    const k = this.k;

    // SRP-6a safety check
    if (B % N === 0) {
      return null;
    }

    const u = H(this.hashClass, this.A, B, { width: longToBytes(N).length });
    if (u === 0) {
      return null;
    }

    const x = this.calculateX(s);
    const v = g ** x % N;
    const S = (B - k * v) ** (this.a + u * x) % N;

    const SBuffer = Buffer.from(S.toString(16), 'hex');
    this.K = await Crypto.digestStringAsync(SHA512, SBuffer.toString('base64'));

    const M = this.calculateM(N, g, this.Iu, s, this.A, B, this.K);
    if (!M) {
      return null;
    }

    const ABuffer = Buffer.from(this.A.toString(16), 'hex');
    const KBuffer = Buffer.from(this.K, 'hex');

    this.H_AMK = await Crypto.digestStringAsync(
      SHA512,
      Buffer.concat([ABuffer, Buffer.from(M, 'hex'), KBuffer]).toString('base64')
    );

    return M;
  }

  verify_session(host_HAMK) {
    if (this.H_AMK === host_HAMK) {
      this.authenticated = true;
    }
  }

  // ... (other methods)

  calculateX(s) {
    const IuBuffer = Buffer.from(this.Iu);
    const pBuffer = Buffer.from(this.p);

    return H(this.hashClass, s, H(this.hashClass, Buffer.concat([IuBuffer, Buffer.from(':'), pBuffer])));
  }

  calculateM(N, g, Iu, s, A, B, K) {
    const IuBuffer = Buffer.from(Iu);
    const h = this.hashClass();
    h.update(H_N_xor_g(this.hashClass, N, g));
    h.update(this.hashClass(IuBuffer).digest());
    h.update(longToBytes(s));
    h.update(longToBytes(A));
    h.update(longToBytes(B));
    h.update(Buffer.from(K, 'hex'));
    return h.digest('hex');
  }
  */
}
 
export default SRP6aClient;
