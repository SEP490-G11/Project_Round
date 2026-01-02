import { Layout, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../../api/auth.api";
import { getCurrentUser } from "../../utils/auth";

const { Header, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch {
      // ignore lỗi logout
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <div>Task Management</div>

        <div style={{ display: "flex", gap: 12 }}>
          <span>{user?.email}</span>
          <Button type="link" onClick={() => navigate("/change-password")}>
            Change Password
          </Button>
          <Button danger onClick={handleLogout}>
            Logout
          </Button>
          

        </div>
      </Header>

      <Content style={{ padding: 24 }}>
        {children}
      </Content>
    </Layout>
  );
}
