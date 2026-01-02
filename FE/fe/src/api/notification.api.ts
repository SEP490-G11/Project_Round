import axios from "./axios";

export const NotificationApi = {
  list: (params?: any) =>
    axios.get("/notifications", { params }),

  markRead: (id: number) =>
    axios.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    axios.patch("/notifications/read-all"),
};
