import { Layout, Typography, Avatar, Space, Row, Col, Button } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

interface IdTokenPayload {
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface AccountSettingsProps {
  onBack: () => void;
}

const AccountSettings = ({ onBack }: AccountSettingsProps) => {
  // For now, just pull from local storage
  // You could also pass profile down from App
  const profile: IdTokenPayload = {
    email: "john@example.com",
    given_name: "John",
    family_name: "Doe",
    picture: "",
  };

  const handleLogout = () => {
    (chrome || browser).storage.local.clear(() => {
      window.close();
    });
  };

  return (
    <Layout style={{ minHeight: "50vh", background: "#fff" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0.5rem 1rem",
          borderBottom: "1px solid #eee",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <ArrowLeftOutlined
                style={{ fontSize: "16px", cursor: "pointer" }}
                onClick={onBack}
              />
              <Title level={5} style={{ margin: 0 }}>
                Account Settings
              </Title>
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: "1rem", textAlign: "center" }}>
        <Avatar
          size={64}
          src={profile.picture}
          icon={<UserOutlined />}
          style={{ marginBottom: "1rem" }}
        />
        <Text strong>Email: {profile.email}</Text>
        <br />
        <Text>
          Name: {profile.given_name} {profile.family_name}
        </Text>

        <div style={{ marginTop: "1rem" }}>
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default AccountSettings;
