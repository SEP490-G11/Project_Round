import { Layout, Button, Space } from "antd";
import { useNavigate, Outlet } from "react-router-dom";
import { AuthApi } from "../../api/auth.api";
import { getCurrentUser } from "../../utils/auth";
import NotificationBell from "../NotificationBell";

const { Header, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "relative", // 🔑 FIX LAYER
          zIndex: 1000,
          background: "#0b1d33", // modern navy
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ color: "#fff", fontWeight: 600 }}>
          Task Management
        </div>

        <Space size="middle">
          <NotificationBell />
          <span style={{ color: "#fff" }}>{user?.email}</span>
          <Button type="link" onClick={() => navigate("/change-password")}>
            Change Password
          </Button>
          <Button danger onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
