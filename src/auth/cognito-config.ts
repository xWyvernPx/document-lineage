import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: 'mckf0oo0r0jdtkjtuicl9kcrq',
        userPoolId: 'ap-southeast-1_luFLIRQPG',
        identityPoolId: undefined,
        loginWith: {
          oauth: {
            domain: 'cognito-idp.ap-southeast-1.amazonaws.com',
            scopes: ['email', 'openid', 'phone'],
            redirectSignIn: ['http://localhost:5173'],
            redirectSignOut: ['http://localhost:5173'],
            responseType: 'code',
          },
        },
      }
    },
    // Optional configuration for additional settings
    // Storage: {},
    // API: {}
  });
}; 