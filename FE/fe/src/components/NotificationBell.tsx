import { Badge, Dropdown, List, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../socket/notificationSocket";
import { NotificationApi } from "../api/notification.api";
import { getCurrentUser } from "../utils/auth";

export default function NotificationBell() {
  const user = getCurrentUser();
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;

    // ===== LOAD UNREAD INIT =====
    NotificationApi.list({ unreadOnly: true }).then((res) => {
      setItems(res.data.content || []);
      setUnread(res.data.totalElements || 0);
    });

    // ===== REALTIME SOCKET =====
    connectNotificationSocket((data) => {
      setItems((prev) => [data, ...prev]);
      setUnread((u) => u + 1);
      message.info(data.content);
    });

    return () => {
      disconnectNotificationSocket();
    };
  }, []);

  const markRead = async (id: number) => {
    try {
      await NotificationApi.markRead(id);
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      getPopupContainer={(trigger) => trigger.parentElement!}
      dropdownRender={() => (
        <List
          size="small"
          dataSource={items}
          style={{
            width: 340,
            maxHeight: 360,
            overflowY: "auto",
          }}
          locale={{ emptyText: "No notifications" }}
          renderItem={(n: any) => (
            <List.Item
              style={{
                cursor: "pointer",
                background: "#fff",
              }}
              onClick={() => markRead(n.id)}
            >
              <div>
                <b style={{ display: "block" }}>{n.type}</b>
                <div style={{ fontSize: 13 }}>{n.content}</div>
              </div>
            </List.Item>
          )}
        />
      )}
    >
      <Badge count={unread} offset={[-2, 2]}>
        <BellOutlined
          style={{
            fontSize: 20,
            color: "#fff",
            cursor: "pointer",
          }}
        />
      </Badge>
    </Dropdown>
  );
}
