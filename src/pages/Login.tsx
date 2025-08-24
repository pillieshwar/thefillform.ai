import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Button,
  Avatar,
  Typography,
  Space,
  Layout,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserOutlined,
  GoogleOutlined,
  LogoutOutlined,
  CloudServerOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { sampleData } from "../utils/testData";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

interface IdTokenPayload {
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}
interface LoginProps {
  onOpenAccount: () => void;
}

const Login = ({ onOpenAccount }: LoginProps) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<IdTokenPayload | null>(null);

  // 🔹 Load saved tokens/profile when popup opens
  useEffect(() => {
    (chrome || browser).storage.local.get(["tokens", "profile"], (result) => {
      if (result.tokens?.idToken && result.profile) {
        setUser(result.tokens);
        setProfile(result.profile);
      }
    });
  }, []);

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
          // ✅ Save to local storage for persistence
          (chrome || browser).storage.local.set({
            tokens: response,
            profile: decoded,
          });
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
          "https://980oelzvbi.execute-api.us-east-1.amazonaws.com/prod/voice", // replace with your API Gateway endpoint
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
    <Layout style={{ minHeight: "50vh", background: "#fff" }}>
      {/* 🔹 Header */}
      <Header
        style={{
          background: "#fff",
          padding: "0.5rem 1rem", // reduced padding
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Row align="middle" justify="space-between">
          {/* Left: Logo + Extension name */}
          <Col>
            <Space align="center" size={8}>
              <Avatar
                shape="square"
                size={20}
                style={{
                  background: "#1890ff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                F
              </Avatar>
              <Title
                level={5}
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontFamily: "Segoe UI, Roboto, sans-serif",
                }}
              >
                Fill.ai
              </Title>
            </Space>
          </Col>

          {/* Right: Profile avatar + Close */}
          <Col>
            <Space size={8}>
              {profile ? (
                <Avatar
                  size={30}
                  src={profile.picture}
                  icon={<UserOutlined />}
                  onClick={onOpenAccount}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <Avatar size={28} icon={<UserOutlined />} />
              )}
              {/* <CloseOutlined
                style={{ fontSize: "16px", cursor: "pointer" }}
                onClick={() => window.close()}
              /> */}
            </Space>
          </Col>
        </Row>
      </Header>

      {/* 🔹 Main Content */}
      <Content style={{ padding: "1rem", textAlign: "center" }}>
        {" "}
        {/* reduced */}
        {user ? (
          <>
            <Title level={5} style={{ marginBottom: "0.75rem" }}>
              Welcome {profile?.given_name || "User"}!
            </Title>
            {profile && (
              <div style={{ marginBottom: "1rem" }}>
                <Text>Email: {profile.email}</Text>
                <br />
                <Text>
                  Name: {profile.given_name} {profile.family_name}
                </Text>
              </div>
            )}
            <Divider style={{ margin: "1rem 0" }} /> {/* tighter */}
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
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
            size="middle"
            onClick={handleLogin}
            style={{
              background: "#4285F4",
              borderColor: "#4285F4",
              padding: "0 1.25rem", // smaller button padding
              fontWeight: 500,
            }}
          >
            Login with Google
          </Button>
        )}
      </Content>
    </Layout>
  );
};

export default Login;
