import { Layout } from "antd";
import Sidebar from "./Sidebar";

const { Header, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />

      <Layout>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #eee",
            padding: "0 16px",
          }}
        >
          Task Management
        </Header>

        <Content style={{ padding: 16 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
