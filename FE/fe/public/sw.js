/* 
   INSTALL
 */
self.addEventListener("install", (event) => {
  console.log("🧩 Service Worker installed");

  // dev cho tiện, production có thể bỏ
  self.skipWaiting();
});

/* 
   ACTIVATE
 */
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activated");

  event.waitUntil(self.clients.claim());
});

/* 
   PUSH EVENT
 */
self.addEventListener("push", (event) => {
  console.log("📩 Push event received");

  let data = {
    title: "Task Management",
    body: "You have a new notification",
    url: "/",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/vite.svg",
    badge: "/vite.svg",
    data: {
      url: data.url || "/",
    },
    requireInteraction: true, // ⚠️ notification không tự biến mất
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/* 
   CLICK NOTIFICATION
*/
self.addEventListener("notificationclick", (event) => {
  console.log("👉 Notification clicked");

  event.notification.close();

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Nếu đã có tab mở → focus
      for (const client of allClients) {
        if (client.url.includes(event.notification.data.url)) {
          return client.focus();
        }
      }

      // Nếu chưa có → mở tab mới
      return self.clients.openWindow(event.notification.data.url || "/");
    })()
  );
});
