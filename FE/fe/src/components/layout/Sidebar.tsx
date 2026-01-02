import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

export default function Sidebar() {
  const location = useLocation();

  return (
    <Sider width={220} theme="light">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: "100%", borderRight: 0 }}
        items={[
          {
            key: "/",
            label: <Link to="/">Dashboard</Link>,
          },
          {
            key: "/tasks",
            label: <Link to="/tasks">Tasks</Link>,
          },
          {
            key: "/notifications",
            label: <Link to="/notifications">Notifications</Link>,
          },
        ]}
      />
    </Sider>
  );
}
