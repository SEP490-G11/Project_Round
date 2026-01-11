import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],

  //GIỮ NGUYÊN – để tránh lỗi global is not defined
  define: {
    global: "window",
  },

  // ➕ CHỈ THÊM PHẦN NÀY
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "cert/localhost-key.pem")
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "cert/localhost.pem")
      ),
    },
  },
});
