import { Button, Form, Input, Typography, Card, message, Layout } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login } from "../services/team-member";
import { setUser } from "../utils/auth";

const { Title } = Typography;
const { Content } = Layout;

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const data = await login(values.email, values.password);
      if (data && data._id) {
        localStorage.setItem("user", JSON.stringify(data));
        message.success("Login successful!");
        setUser(data);
        navigate("/dashboard");
      } else {
        message.error("Unexpected error occurred.");
      }
    } catch (error) {
      message.error(error.message || "Login failed.");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
        }}
      >
        <Card
          style={{ width: 400, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        >
          <Title level={3} style={{ textAlign: "center" }}>
            Vision Track Login
          </Title>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
