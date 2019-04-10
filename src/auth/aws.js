import { format as formatDate } from 'date-fns'
import { Buffer } from 'buffer/'
import CryptoJS from 'crypto-js'
import 'crypto-js/lib-typedarrays'
import Base64 from 'crypto-js/enc-base64'
import SHA256 from 'crypto-js/sha256'
import HmacSHA256 from 'crypto-js/hmac-sha256'

import BigInteger from './BigInteger.js'

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'us-west-2',
  credentials: {
    accessKeyId: '***REMOVED***',
    secretAccessKey: '***REMOVED***'
  },
  params: { ClientId: '6101dpcsvmnjukllkelsr6ke0q' }
})

const userPoolId = '***REMOVED***'

const N = new BigInteger(
  'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' +
    '29024E088A67CC74020BBEA63B139B22514A08798E3404DD' +
    'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' +
    'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' +
    'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' +
    'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' +
    '83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
    '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' +
    'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' +
    'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' +
    '15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64' +
    'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7' +
    'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B' +
    'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
    'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31' +
    '43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF',
  16
)
const g = new BigInteger('2', 16)
const k = new BigInteger(hexHash(`00${N.toString(16)}0${g.toString(16)}`), 16)

function randomBytes(nBytes) {
  return Buffer.from(CryptoJS.lib.WordArray.random(nBytes).toString(), 'hex')
}

/**
 * Calculate a hash from a bitArray
 * @param {Buffer} buf Value to hash.
 * @returns {String} Hex-encoded hash.
 * @private
 */
function hash(buf) {
  const str = buf instanceof Buffer ? CryptoJS.lib.WordArray.create(buf) : buf
  const hashHex = SHA256(str).toString()

  return new Array(64 - hashHex.length).join('0') + hashHex
}

/**
 * Calculate a hash from a hex string
 * @param {String} hexStr Value to hash.
 * @returns {String} Hex-encoded hash.
 * @private
 */
function hexHash(hexStr) {
  return hash(Buffer.from(hexStr, 'hex'))
}

/**
 * Converts a BigInteger (or hex string) to hex format padded with zeroes for hashing
 * @param {BigInteger|String} bigInt Number or string to pad.
 * @returns {String} Padded hex string.
 */
function padHex(bigInt) {
  let hashStr = bigInt.toString(16)
  if (hashStr.length % 2 === 1) {
    hashStr = `0${hashStr}`
  } else if ('89ABCDEFabcdef'.indexOf(hashStr[0]) !== -1) {
    hashStr = `00${hashStr}`
  }
  return hashStr
}

/**
 * Standard hkdf algorithm
 * @param {Buffer} ikm Input key material.
 * @param {Buffer} salt Salt value.
 * @returns {Buffer} Strong key material.
 * @private
 */
function computehkdf(ikm, salt) {
  const infoBitsWordArray = CryptoJS.lib.WordArray.create(
    Buffer.concat([
      Buffer.from('Caldera Derived Key', 'utf8'),
      Buffer.from(String.fromCharCode(1), 'utf8')
    ])
  )
  const ikmWordArray =
    ikm instanceof Buffer ? CryptoJS.lib.WordArray.create(ikm) : ikm
  const saltWordArray =
    salt instanceof Buffer ? CryptoJS.lib.WordArray.create(salt) : salt

  const prk = HmacSHA256(ikmWordArray, saltWordArray)
  const hmac = HmacSHA256(infoBitsWordArray, prk)
  return Buffer.from(hmac.toString(), 'hex').slice(0, 16)
}

export async function signInUser(username, password) {
  const randomBigInt = new BigInteger(randomBytes(128).toString('hex'), 16)
  const smallAValue = randomBigInt.mod(N)
  const largeAValue = g.modPow(smallAValue, N)

  if (largeAValue.mod(N).equals(BigInteger.ZERO))
    throw new Error('Illegal paramater. A mod N cannot be 0.')

  const challenge = await cognito
    .initiateAuth({
      AuthFlow: 'USER_SRP_AUTH',
      AuthParameters: {
        USERNAME: username,
        SRP_A: largeAValue.toString(16)
      }
    })
    .promise()

  const {
    USER_ID_FOR_SRP,
    SECRET_BLOCK,
    SRP_B,
    SALT
  } = challenge.ChallengeParameters
  const dateNow = formatDate(new Date(), "EE MMM d HH:mm:ss U'T'C yyyy")

  const message = CryptoJS.lib.WordArray.create(
    Buffer.concat([
      Buffer.from(userPoolId, 'utf8'),
      Buffer.from(USER_ID_FOR_SRP, 'utf8'),
      Buffer.from(SECRET_BLOCK, 'base64'),
      Buffer.from(dateNow, 'utf8')
    ])
  )

  const serverBValue = new BigInteger(SRP_B, 16)
  if (serverBValue.mod(N).equals(BigInteger.ZERO))
    throw new Error('B cannot be zero.')

  const UValue = new BigInteger(
    hexHash(padHex(largeAValue) + padHex(serverBValue)),
    16
  )

  if (UValue.equals(BigInteger.ZERO)) throw new Error('U cannot be zero.')

  const usernamePasswordHash = hash(
    `${userPoolId}${USER_ID_FOR_SRP}:${password}`
  )
  const xValue = new BigInteger(
    hexHash(padHex(new BigInteger(SALT, 16)) + usernamePasswordHash),
    16
  )

  const intValue2 = serverBValue.subtract(k.multiply(g.modPow(xValue, N)))
  const sValue = intValue2
    .modPow(smallAValue.add(UValue.multiply(xValue)), N)
    .mod(N)
  const key = CryptoJS.lib.WordArray.create(
    computehkdf(
      Buffer.from(padHex(sValue), 'hex'),
      Buffer.from(padHex(UValue.toString(16)), 'hex')
    )
  )

  const dataChallenge = await cognito
    .respondToAuthChallenge({
      ChallengeName: 'PASSWORD_VERIFIER',
      ChallengeResponses: {
        USERNAME: USER_ID_FOR_SRP,
        PASSWORD_CLAIM_SECRET_BLOCK: SECRET_BLOCK,
        TIMESTAMP: dateNow,
        PASSWORD_CLAIM_SIGNATURE: Base64.stringify(HmacSHA256(message, key))
      }
    })
    .promise()

  return dataChallenge
}

export function changePassword(username, password, session) {
  return cognito
    .respondToAuthChallenge({
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: password
      }
    })
    .promise()
}

export function forgotPassword(username) {
  return cognito.forgotPassword({ Username: username }).promise()
}

export function confirmForgotPassword(username, code, password) {
  return cognito
    .confirmForgotPassword({
      ConfirmationCode: code,
      Password: password,
      Username: username
    })
    .promise()
}
