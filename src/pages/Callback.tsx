// src/pages/Callback.tsx
import { useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await fetchAuthSession();
        console.log("Logged in:", session.tokens?.idToken?.payload);
        navigate("/"); // back to home after login
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };
    checkSession();
  }, [navigate]);

  return <p>Processing login...</p>;
};

export default Callback;
