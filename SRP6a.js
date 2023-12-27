import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
import bigInt from 'big-integer';


const SHA512 = Crypto.CryptoDigestAlgorithm.SHA512;

function bytesToNumber(bytes) {
  return parseInt(Buffer.from(bytes, 'base64').toString('hex'), 16);
}

function numberToBytes(number) {
  const hexString = number.toString(16);
  const paddedHexString = hexString.length % 2 === 0 ? hexString : '0' + hexString;
  return Buffer.from(paddedHexString, 'hex').toString('base64');
}

class SRP6aClient {
  constructor(username, password, hashAlg = SHA512, ngType = NG_3072) {
    const hashClass = _hashMap[hashAlg];

    const [N, g] = getNg(ngType);
    const k = H(hashClass, N, g, { width: longToBytes(N).length });

    this.Iu = username;
    this.p = password;

    this.a = getRandomOfLength(32);
    this.A = g ** this.a % N;

    this.v = null;
    this.K = null;
    this.H_AMK = null;
    this.authenticated = false;

    this.hashClass = hashClass;
    this.N = N;
    this.g = g;
    this.k = k;
  }

  getRandomOfLength(length) {
    const min = bigInt(2).pow(length); // 2^255
    const max = bigInt(2).pow(length - 1).minus(1); // 2^256 - 1

    return bigInt.randBetween(min, max);
  }

  longToBytes(longValue) {
    const hexString = longValue.toString(16);
    const paddedHexString = hexString.length % 2 === 0 ? hexString : '0' + hexString;
    return Buffer.from(paddedHexString, 'hex');
  }

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
}

export default SRP6aClient;
