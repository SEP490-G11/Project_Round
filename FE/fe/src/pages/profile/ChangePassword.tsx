import { Button, Card, Form, Input, message } from "antd";
import { AuthApi } from "../../api/auth.api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }) => {
        try {
            setLoading(true);
            await AuthApi.changePassword(values);
            message.success("Password changed successfully");
            navigate("/", { replace: true });
        } catch (e: any) {
            message.error(
                e?.response?.data?.message || "Change password failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "calc(100vh - 64px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Card title="Change Password" style={{ width: 400 }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Current password"
                        name="currentPassword"
                        rules={[{ required: true }]}
                    >
                        <Input.Password />
                    </Form.Item>

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

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                    >
                        Change Password
                    </Button>
                </Form>
            </Card>
        </div>
    );
}
