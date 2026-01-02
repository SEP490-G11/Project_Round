import axiosClient from "./axios";
import type { AxiosResponse } from "axios";

const healthApi = {
  check(): Promise<AxiosResponse<string>> {
    return axiosClient.get("/health");
  },
};

export default healthApi;
