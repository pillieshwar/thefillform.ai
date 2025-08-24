export const AUTH_CONFIG = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_Rtct3tdnP",
      userPoolClientId: "6bj9qs4trivcf0h1u2kfnm4n1j",
      loginWith: {
        oauth: {
          domain: "formfill-auth.auth.us-east-1.amazoncognito.com",
          scopes: ["openid", "email", "profile"],
          redirectSignIn: ["http://localhost:3000/callback"],
          redirectSignOut: ["http://localhost:3000"],
          responseType: "code" as const,
        },
        email: true,
      },
    },
  },
  region: "us-east-1",
};
