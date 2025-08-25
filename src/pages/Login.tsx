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
import { extractForm } from "../utils/extractForm"; // ✅ utility function
import { populateForm } from "../utils/populateForm";

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
  const [formSchema, setFormSchema] = useState<any[]>([]);

  // Load saved tokens/profile
  useEffect(() => {
    (chrome || browser).storage.local.get(["tokens", "profile"], (result) => {
      if (result.tokens?.idToken && result.profile) {
        setUser(result.tokens);
        setProfile(result.profile);
      }
    });
  }, []);

  // 🔹 Listener for schema messages
  useEffect(() => {
    const handleMessage = (msg: any) => {
      if (msg.type === "FORM_SCHEMA") {
        console.log("Schema received in popup:", msg.schema);
        setFormSchema(msg.schema);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const handleExtractForm = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: extractForm, // 👈 inject function directly
          },
          (results) => {
            if (results && results[0].result) {
              console.log("Extracted schema:", results[0].result);
              setFormSchema(results[0].result); // ✅ update state
            }
          }
        );
      }
    });
  };

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

  const handleApiCall = () => {
    (chrome || browser).storage.local.get(
      ["tokens", "recordedAudio"],
      (result) => {
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

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) return;

          // Step 1: extract form directly in the page
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              func: extractForm,
            },
            async (results) => {
              const schema = results?.[0]?.result || [];
              if (schema.length === 0) {
                console.error("No form fields found");
                return;
              }

              console.log("Extracted schema:", schema);
              setFormSchema(schema); // optional, just for showing in popup

              try {
                setLoading(true);
                const cleanedSchema = formSchema.map((field) => {
                  return Object.fromEntries(
                    Object.entries(field).filter(
                      ([_, value]) => value !== null && value !== ""
                    )
                  );
                });
                console.log("cleanedSchema:::", cleanedSchema);
                // Step 2: call backend with schema + audio
                const res = await fetch(
                  "https://980oelzvbi.execute-api.us-east-1.amazonaws.com/prod/voice",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${tokens.idToken}`,
                    },
                    body: JSON.stringify({
                      audio: audioBase64,
                      uiSchema: cleanedSchema, // use fresh schema directly
                    }),
                  }
                );

                const data = await res.json();
                console.log("API response:", data);

                // Step 3: inject filled values into page
                chrome.scripting.executeScript({
                  target: { tabId: tabs[0].id! },
                  func: populateForm,
                  args: [data.filledFields],
                });
              } catch (err) {
                console.error("API call failed:", err);
              } finally {
                setLoading(false);
              }
            }
          );
        });
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
          <div>
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
            <Button
              type="primary"
              style={{
                background: "#854ee0",
                borderColor: "#854ee0",
                marginTop: "1rem",
              }}
              onClick={handleExtractForm}
            >
              Extract Form Schema
            </Button>
          </div>
        )}
        {/* Show result (optional) */}
        {formSchema.length > 0 && (
          <pre
            style={{ textAlign: "left", maxHeight: "150px", overflow: "auto" }}
          >
            {JSON.stringify(formSchema, null, 2)}
          </pre>
        )}
      </Content>
    </Layout>
  );
};

export default Login;
