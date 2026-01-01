import axiosClient from "./axios";

const healthApi = {
  check() {
    return axiosClient.get("/health");
  },
};

export default healthApi;
