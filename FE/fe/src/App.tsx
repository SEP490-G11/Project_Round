import { useEffect } from "react";
import type { AxiosError } from "axios";
import healthApi from "./api/health.api";

function App() {
  useEffect(() => {
    healthApi
      .check()
      .then((res) => {
        console.log("BE RESPONSE:", res.data);
      })
      .catch((err: AxiosError) => {
        console.error("BE ERROR:", err.message);
      });
  }, []);

  return <h1>FE is running 🚀</h1>;
}

export default App;
