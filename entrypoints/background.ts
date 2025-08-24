export default defineBackground(() => {
  console.log("Hello background!", { id: chrome.runtime.id });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "LOGIN") {
      const cognitoDomain =
        "https://formfill-auth.auth.us-east-1.amazoncognito.com";
      const clientId = "6bj9qs4trivcf0h1u2kfnm4n1j"; // Your Cognito client ID
      const redirectUri = chrome.identity.getRedirectURL(); // Must match in CDK callbackUrls

      const loginUrl =
        `${cognitoDomain}/oauth2/authorize?` +
        `response_type=token&` + // using implicit flow
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=openid+email+profile`;

      chrome.identity.launchWebAuthFlow(
        { url: loginUrl, interactive: true },
        (redirectUrl) => {
          if (chrome.runtime.lastError || !redirectUrl) {
            console.error("Login failed:", chrome.runtime.lastError);
            sendResponse({
              error: chrome.runtime.lastError?.message || "Login failed",
            });
            return;
          }

          console.log("Got redirect:", redirectUrl);

          // Parse hash fragment for tokens
          const params = new URLSearchParams(
            new URL(redirectUrl).hash.substring(1)
          );
          const idToken = params.get("id_token");
          const accessToken = params.get("access_token");
          const tokenType = params.get("token_type");
          const expiresIn = params.get("expires_in");

          const tokens = { idToken, accessToken, tokenType, expiresIn };

          console.log("Tokens received:", tokens);

          if (idToken && accessToken) {
            (globalThis.chrome || browser).storage.local.set({ tokens }, () => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Failed to save tokens:",
                  chrome.runtime.lastError
                );
              } else {
                console.log("✅ Tokens saved to chrome.storage.local");
              }
            });

            sendResponse(tokens);
          } else {
            console.error("Login failed: no tokens in response");
            sendResponse({ error: "No tokens returned" });
          }
        }
      );

      return true; // keep channel open for async response
    }
  });
});
