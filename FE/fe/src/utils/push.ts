import axiosClient from "../api/axios";

const VAPID_PUBLIC_KEY =
  "BARRnwqaSb921r4qoxVEBS7Al3u3FZ5fonNDBULevuh2Q4WssKNmjix9sbPPsLHOn1Qr7j5l9q75W4QC0Xa8xcQ";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribePush() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker not supported");
    return;
  }

  if (!("PushManager" in window)) {
    console.warn("Push not supported");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Notification permission denied");
    return;
  }

  const reg = await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const payload = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: btoa(
        String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))
      ),
      auth: btoa(
        String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))
      ),
    },
  };

  await axiosClient.post("/api/v1/push/subscribe", payload);
  console.log("✅ Push subscription sent to backend");
}
