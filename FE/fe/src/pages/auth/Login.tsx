import { Button, Card, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../../api/auth.api";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      const res = await AuthApi.login(values);

      // lưu access token
      localStorage.setItem("accessToken", res.data.accessToken);

      message.success("Login success");
      navigate("/", { replace: true });
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card title="Login" style={{ width: 360 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
            ]}
          >
            <Input />
          </Form.Item>


          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            Login
          </Button>
          <Button type="link" onClick={() => navigate("/register")}>
            Register new account
          </Button>
          <Button type="link" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </Button>


        </Form>
      </Card>
    </div>
  );
}
