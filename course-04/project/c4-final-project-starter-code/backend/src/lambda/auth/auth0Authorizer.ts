import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-fl8xfxah.us.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJQX/6HD2/zADGMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1mbDh4ZnhhaC51cy5hdXRoMC5jb20wHhcNMjIwODMxMDgwMDQwWhcN
MzYwNTA5MDgwMDQwWjAkMSIwIAYDVQQDExlkZXYtZmw4eGZ4YWgudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv5eTxXPm+CBWroPS
skHa9TrG9lLlnDfrgqBAaZbXyrbIYit5tGQR+7OeEC4ED7LxooIIyCcuk9S7V9U8
P27nmdIhRFuQBDa9FWqKaFM/6hM8abC1TzpjBlZk5ZnLhkqLT7ApGkH3Z33iUfLd
MU/Ftv/vmnAe+SpkjHPsHT1mAMFpF1wCfKUuT6mRiIpXp0aOOtlgD4S85bEIEN9O
QLoQHE/kl8zUixpEi+V4O9hMO1T18tcC8UpeByneuROxrqY3xsmH6QZF6yT/RdHk
B5LEX2qCXHJKR/vDJDlQtO0DQYwc13+7rzHaxf8+y6tJrT2s+Mr07Bd79tLYf2Oe
uSFiBQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTo7WAxVRvG
b7AkiMn3u8b/oheXKjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ALjijqtiFdh4HJADpAM0UeXPUvNUzTHR+1NZb1Z6SiOvc2Z2lQ6l4McKXu5ZTY5J
cA2lsJcsU4eqR3w8ENwXuionBVsxKqJvJouxY1nI5JOk9do1NA6AHVMoUuxWykWr
sFUyHveuMeD43t/NaUuRByC49mgp/zumuIClwtqRMgRfsr32RIQ5TaR7MMsLqLFM
IhkzjpCzrssG0WHJNbZnHvz5171R+5u1abc+VMcISMfE5sC63ZVYgDkE+XjFOd7G
nMUrEu9980nijg8A7GKDIlHjschyRTwWgdFH+8pM0GWYJW8IHyUdVgoWQAS3t6Gq
MvGXwHbNPaFPcyy87ekLFdQ=
-----END CERTIFICATE-----`
export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const { data } = await Axios.get<any>(jwksUrl, { 
    headers: { 
      Accept: 'application/json'
    }
  });
  console.log(data.keys[0].kid, jwt.header.alg) 
  const jwtPayload = verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  return jwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
