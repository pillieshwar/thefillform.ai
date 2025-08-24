import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Button, Avatar, Typography, Space } from "antd";
import {
  UserOutlined,
  GoogleOutlined,
  LogoutOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import { sampleData } from "../utils/testData";

const { Title, Text } = Typography;

interface IdTokenPayload {
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

const Login = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<IdTokenPayload | null>(null);

  const handleLogin = () => {
    chrome.runtime.sendMessage({ type: "LOGIN" }, (response) => {
      if (response?.error) {
        console.error("Login failed:", response.error);
        return;
      }
      setUser(response);

      if (response?.idToken) {
        try {
          const decoded: IdTokenPayload = jwtDecode(response.idToken);
          setProfile(decoded);
        } catch (err) {
          console.error("Failed to decode token:", err);
        }
      }
    });
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
  };

  const handleApiCall = async () => {
    (chrome || browser).storage.local.get("tokens", async (result) => {
      const tokens = result.tokens;
      if (!tokens?.idToken) {
        console.error("No token found. Please log in first.");
        return;
      }

      try {
        const res = await fetch(
          "https://980oelzvbi.execute-api.us-east-1.amazonaws.com/prod/voice", // 👈 replace with your API Gateway endpoint
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens.idToken}`,
            },
            body: JSON.stringify(sampleData),
          }
        );

        const data = await res.json();
        console.log("API response:", data);
      } catch (err) {
        console.error("API call failed:", err);
      }
    });
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {user ? (
        <>
          {/* Header with avatar + welcome */}
          <Space
            align="center"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2rem",
            }}
          >
            <Title
              level={5}
              style={{ margin: 0, flex: 1, textAlign: "center" }}
            >
              Welcome {profile?.given_name || "User"}!
            </Title>

            <Avatar
              size={28}
              src={profile?.picture}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#87d068" }}
            />
          </Space>

          {/* Profile details */}
          {profile && (
            <div style={{ marginBottom: "1.5rem" }}>
              <Text>Email: {profile.email}</Text>
              <br />
              <Text>
                Name: {profile.given_name} {profile.family_name}
              </Text>
            </div>
          )}
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Sign out
            </Button>

            <Button
              type="primary"
              icon={<CloudServerOutlined />}
              onClick={handleApiCall}
            >
              Make API Call
            </Button>
          </Space>
        </>
      ) : (
        <Button
          type="primary"
          icon={<GoogleOutlined />}
          size="large"
          onClick={handleLogin}
          style={{ background: "#4285F4", borderColor: "#4285F4" }}
        >
          Login with Google
        </Button>
      )}
    </div>
  );
};

export default Login;
