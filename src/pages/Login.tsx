import { useState } from "react";

const Login = () => {
  const [user, setUser] = useState<any>(null);

  const handleLogin = () => {
    chrome.runtime.sendMessage({ type: "LOGIN" }, (response) => {
      if (response?.error) {
        console.error("Login failed:", response.error);
        return;
      }
      console.log("Tokens:", response);
      setUser(response);
    });
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {user ? (
        <>
          <h1>Logged in!</h1>
          <p>ID Token: {user.idToken?.slice(0, 20)}...</p>
          <button onClick={() => setUser(null)}>Sign out</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
};

export default Login;
