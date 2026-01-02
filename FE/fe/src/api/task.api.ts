import axios from "./axios";
import type { TaskStatus } from "../types/task";

export const TaskApi = {
  list: (params: any) =>
    axios.get("/api/v1/tasks", { params }),

  detail: (taskId: number) =>
    axios.get(`/api/v1/tasks/${taskId}`),

  create: (data: any) =>
    axios.post("/api/v1/tasks", data),

  patch: (taskId: number, data: any) =>
    axios.patch(`/api/v1/tasks/${taskId}`, data),

  assign: (taskId: number, assigneeId: number) =>
    axios.patch(`/api/v1/tasks/${taskId}/assignee`, { assigneeId }),

  updateStatus: (taskId: number, status: TaskStatus) =>
    axios.patch(`/api/v1/tasks/${taskId}/status`, { status }),

  delete: (taskId: number) =>
    axios.delete(`/api/v1/tasks/${taskId}`),

  createSubTask: (taskId: number, title: string) =>
    axios.post(`/api/v1/tasks/${taskId}/subtasks`, { title }),

  patchSubTask: (
    taskId: number,
    subTaskId: number,
    data: { title?: string; done?: boolean }
  ) =>
    axios.patch(
      `/api/v1/tasks/${taskId}/subtasks/${subTaskId}`,
      data
    ),

  deleteSubTask: (taskId: number, subTaskId: number) =>
    axios.delete(`/api/v1/tasks/${taskId}/subtasks/${subTaskId}`),

  addComment: (taskId: number, content: string) =>
    axios.post(`/api/v1/tasks/${taskId}/comments`, { content }),
};
