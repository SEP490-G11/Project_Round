// src/socket/notificationSocket.ts
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;

export const connectNotificationSocket = (
  onMessage: (data: any) => void
) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    reconnectDelay: 5000,

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    onConnect: () => {
      console.log("🔔 Notification WS connected");

      stompClient?.subscribe(
       _attachQueue(),
        (msg) => {
          const body = JSON.parse(msg.body);
          onMessage(body);
        }
      );
    },

    onStompError: (frame) => {
      console.error("STOMP error", frame);
    },
  });

  stompClient.activate();
};

export const disconnectNotificationSocket = () => {
  stompClient?.deactivate();
  stompClient = null;
};

const _attachQueue = () => "/user/queue/notifications";
