import { Button, Card, Form, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../../api/auth.api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // STEP 1: request OTP
  const requestOtp = async (v: { email: string }) => {
    try {
      setLoading(true);
      await AuthApi.forgotRequestOtp(v.email);
      message.success("OTP sent");
      setStep(2);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: verify OTP
  const verifyOtp = async (v: { otp: string }) => {
    try {
      setLoading(true);
      await AuthApi.forgotVerifyOtp(v.otp);
      message.success("OTP verified");
      setStep(3);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: reset password
  const resetPassword = async (v: {
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    try {
      setLoading(true);
      await AuthApi.forgotResetPassword(v);
      message.success("Password reset success");
      navigate("/login");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card title="Forgot Password" style={{ width: 400 }}>
        {step === 1 && (
          <Form layout="vertical" onFinish={requestOtp}>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Send OTP
            </Button>
          </Form>
        )}

        {step === 2 && (
          <Form layout="vertical" onFinish={verifyOtp}>
            <Form.Item
              label="OTP"
              name="otp"
              rules={[{ required: true }, { pattern: /^[0-9]{6}$/, message: "OTP must be 6 digits" }]}
            >
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Verify OTP
            </Button>
          </Form>
        )}

        {step === 3 && (
          <Form layout="vertical" onFinish={resetPassword}>
            <Form.Item
              label="New password"
              name="newPassword"
              rules={[{ required: true, min: 8 }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm new password"
              name="confirmNewPassword"
              rules={[{ required: true, min: 8 }]}
            >
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Reset Password
            </Button>
          </Form>
        )}
      </Card>
    </div>
  );
}
