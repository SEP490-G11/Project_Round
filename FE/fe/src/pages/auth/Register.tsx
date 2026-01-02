import { Button, Card, Form, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../../api/auth.api";

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    // ===== STEP 1: SEND OTP =====
    const onRegister = async (values: {
        email: string;
        password: string;
        fullName: string;
    }) => {
        try {
            setLoading(true);
            await AuthApi.registerRequestOtp(values);
            message.success("OTP sent to email");
            setStep(2);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Register failed");
        } finally {
            setLoading(false);
        }
    };

    // ===== STEP 2: VERIFY OTP =====
    const onVerifyOtp = async (values: { otp: string }) => {
        try {
            setLoading(true);
            await AuthApi.registerVerifyOtp(values.otp);
            message.success("Register success, please login");
            navigate("/login");
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Card title="Register" style={{ width: 400 }}>
                {step === 1 && (
                    <Form layout="vertical" onFinish={onRegister}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, min: 8 }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            label="Full name"
                            name="fullName"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Register
                        </Button>
                    </Form>
                )}

                {step === 2 && (
                    <Form layout="vertical" onFinish={onVerifyOtp}>
                        <Form.Item
                            label="OTP"
                            name="otp"
                            rules={[
                                { required: true },
                                { pattern: /^[0-9]{6}$/, message: "OTP must be 6 digits" },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Verify OTP
                        </Button>
                    </Form>
                )}
            </Card>
        </div>
    );
}
