import { Button, Card, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../../api/auth.api";
import { useState } from "react";
import axiosClient from "../../api/axios";

const VAPID_PUBLIC_KEY =
  "BARRnwqaSb921r4qoxVEBS7Al3u3FZ5fonNDBULevuh2Q4WssKNmjix9sbPPsLHOn1Qr7j5l9q75W4QC0Xa8xcQ";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  //SUBSCRIBE PUSH THẬT
  const subscribePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const payload = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: btoa(
          String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))
        ),
        auth: btoa(
          String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))
        ),
      },
    };

    await axiosClient.post("/api/v1/push/subscribe", payload);
    console.log("Push subscribed");
  };

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);

      const res = await AuthApi.login(values);

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      //SUBSCRIBE PUSH SAU LOGIN
      await subscribePush();

      message.success("Login success");
      navigate("/", { replace: true });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Login failed");
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
            rules={[{ required: true, message: "Email is required" }]}
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

          <Button type="primary" htmlType="submit" block loading={loading}>
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
