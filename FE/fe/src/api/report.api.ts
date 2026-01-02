import axios from "./axios";

export const ReportApi = {
  exportTasks: () =>
    axios.get("/api/v1/reports/tasks/export", {
      responseType: "blob",
    }),
};
