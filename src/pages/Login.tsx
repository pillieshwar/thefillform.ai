import {
  AudioOutlined,
  CloudServerOutlined,
  FilePdfOutlined,
  GoogleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Layout,
  Row,
  Space,
  Typography,
  Tabs,
  Divider,
} from "antd";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { sampleData } from "../utils/testData";
import VoiceRecorder from "./VoiceRecorder";

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

  // Load saved tokens/profile
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
  const [loading, setLoading] = useState(false);

  const handleApiCall = async () => {
    (chrome || browser).storage.local.get(
      ["tokens", "recordedAudio"],
      async (result) => {
        const tokens = result.tokens;
        const audioBase64 = result.recordedAudio;

        if (!tokens?.idToken) {
          console.error("No token found. Please log in first.");
          return;
        }
        if (!audioBase64) {
          console.error("No recorded audio found.");
          return;
        }
        try {
          setLoading(true); // ⏳ disable + show spinner
          const res = await fetch(
            "https://980oelzvbi.execute-api.us-east-1.amazonaws.com/prod/voice",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokens.idToken}`,
              },
              body: JSON.stringify({
                audio: audioBase64, // 👈 send audio here
                uiSchema: [
                  { id: "name", type: "text", label: "Full Name" },
                  { id: "email", type: "email", label: "Email" },
                  { id: "password", type: "password", label: "Password" },
                ],
              }),
            }
          );
          const data = await res.json();
          console.log("API response:", data);
        } catch (err) {
          console.error("API call failed:", err);
        } finally {
          setLoading(false); // ✅ re-enable when finished
        }
      }
    );
  };

  return (
    <Layout style={{ minHeight: "50vh", background: "#fff" }}>
      {/* Header */}
      <Header
        style={{
          background: "#fff",
          padding: "0.5rem 1rem",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="center" size={8}>
              <Avatar
                shape="square"
                size={20}
                style={{ background: "#854ee0" }}
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
            </Space>
          </Col>
        </Row>
      </Header>

      {/* Main Content */}
      <Content style={{ padding: "1.5rem", textAlign: "center" }}>
        {user ? (
          <>
            <Title level={4} style={{ marginBottom: "0.25rem" }}>
              Welcome back, {profile?.given_name || "User"}!
            </Title>
            <Text type="secondary">
              Choose how you want to fill forms today
            </Text>

            {/* Tabs for Voice / PDF */}
            <Tabs
              defaultActiveKey="voice"
              style={{ marginTop: "1.5rem" }}
              className="custom-tabs"
              items={[
                {
                  key: "voice",
                  label: (
                    <Space>
                      <AudioOutlined /> Voice Recording
                    </Space>
                  ),
                  children: (
                    <div style={{ textAlign: "center", marginTop: "1rem" }}>
                      <VoiceRecorder />

                      <Text type="secondary">
                        Speak your form data naturally
                      </Text>
                    </div>
                  ),
                },
                {
                  key: "pdf",
                  label: (
                    <Space>
                      <FilePdfOutlined /> PDF Upload
                    </Space>
                  ),
                  children: (
                    <div style={{ textAlign: "center", marginTop: "1rem" }}>
                      <Text type="secondary">
                        Extract data from your PDF documents
                      </Text>
                      <div style={{ marginTop: "1rem" }}>
                        <Button
                          style={{
                            background: "#854ee0",
                            borderColor: "#854ee0",
                            color: "#fff",
                          }}
                        >
                          Choose PDF
                        </Button>
                      </div>
                    </div>
                  ),
                },
              ]}
            />

            <Divider />
            {/* Example API Call button */}
            <div style={{ marginTop: "1.5rem" }}>
              <Button
                type="primary"
                icon={<CloudServerOutlined />}
                onClick={handleApiCall}
                loading={loading} // ⏳ shows spinner + disables button
                style={{
                  background: "#854ee0",
                  borderColor: "#854ee0",
                }}
              >
                Fill
              </Button>
            </div>
          </>
        ) : (
          <Button
            type="primary"
            icon={<GoogleOutlined />}
            size="middle"
            onClick={handleLogin}
            style={{
              background: "#854ee0",
              borderColor: "#854ee0",
              padding: "0 1.25rem",
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
