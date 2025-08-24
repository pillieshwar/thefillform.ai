import { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Avatar,
  Space,
  Row,
  Col,
  Card,
  Divider,
  Tag,
  Menu,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  LogoutOutlined,
  FileDoneOutlined,
  CreditCardOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import Statistic from "antd/es/statistic/Statistic";

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
  const [profile, setProfile] = useState<IdTokenPayload | null>(null);

  useEffect(() => {
    (chrome || browser).storage.local.get("profile", (result) => {
      if (result.profile) {
        setProfile(result.profile);
      }
    });
  }, []);

  const handleLogout = () => {
    (chrome || browser).storage.local.clear(() => {
      window.close();
    });
  };

  const handleBilling = () => {
    window.open("https://your-billing-website.com", "_blank"); // replace with your billing page
  };

  return (
    <Layout style={{ minHeight: "50vh", background: "#fff" }}>
      {/* Header */}
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
                My Account
              </Title>
            </Space>
          </Col>
        </Row>
      </Header>

      {/* Content */}
      <Content style={{ padding: "1rem", textAlign: "center" }}>
        {/* Profile */}
        <Avatar
          size={72}
          src={profile?.picture}
          icon={<UserOutlined />}
          style={{ marginBottom: "0.75rem" }}
        />
        <Title level={4} style={{ margin: 0 }}>
          {profile
            ? `${profile.given_name || ""} ${profile.family_name || ""}`
            : "User"}
        </Title>
        <Text type="secondary">{profile?.email}</Text>
        <br />
        {/* Status */}
        <Tag color="gold">Premium User</Tag>
        <Divider />

        {/* Analytics */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total Forms Filled"
                value={1128}
                prefix={<FileDoneOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic title="Credits Remaining" value={93} suffix="/ 100" />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Menu Options */}
        <Menu
          mode="inline"
          style={{ border: "none", textAlign: "left" }}
          selectable={false}
          items={[
            {
              key: "billing",
              icon: <CreditCardOutlined style={{ fontSize: "18px" }} />,
              label: (
                <Space
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  Billing & Subscription
                  <ExportOutlined style={{ fontSize: "14px", color: "#888" }} />
                </Space>
              ),
              onClick: handleBilling,
            },
            {
              key: "signout",
              icon: (
                <LogoutOutlined style={{ fontSize: "18px", color: "red" }} />
              ),
              label: <span style={{ color: "red" }}>Sign Out</span>,
              onClick: handleLogout,
            },
          ]}
        />
      </Content>
    </Layout>
  );
};

export default AccountSettings;
