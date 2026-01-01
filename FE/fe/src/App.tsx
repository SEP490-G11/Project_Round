import { useEffect } from "react";
import type { AxiosResponse } from "axios";
import healthApi from "./api/health.api";

function App() {
  useEffect(() => {
    healthApi.check()
      .then((res: AxiosResponse<string>) => {
        console.log("BE RESPONSE:", res.data);
      })
      .catch((err) => {
        console.error("BE ERROR:", err);
      });
  }, []);

  return <h1>FE is running</h1>;
}

export default App;
