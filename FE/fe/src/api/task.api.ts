// src/api/task.api.ts
import axiosClient from "./axios";
import type { Page } from "../types/page";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskDetailResponse,
} from "../types/task";

/* =====================
   REQUEST TYPES
===================== */

export interface TaskListParams {
  page: number;
  size: number;
  q?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  sort?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string; // yyyy-MM-dd
  tags?: string[];
  assigneeId?: number;
}

export interface PatchTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

/* =====================
   API
===================== */

export const TaskApi = {
  // ===== LIST =====
  list: (params: TaskListParams) =>
    axiosClient.get<Page<Task>>(
      "/api/v1/tasks",
      { params }
    ),

  // ===== DETAIL =====
  detail: (taskId: number) =>
  axiosClient.get<TaskDetailResponse>(
    `/api/v1/tasks/${taskId}`
  ),

  // ===== CREATE (ADMIN) =====
  create: (data: CreateTaskRequest) =>
    axiosClient.post<Task>(
      "/api/v1/tasks",
      data
    ),

  // ===== PATCH (ADMIN) =====
  patch: (taskId: number, data: PatchTaskRequest) =>
    axiosClient.patch<Task>(
      `/api/v1/tasks/${taskId}`,
      data
    ),

  // ===== ASSIGN (ADMIN) =====
  assign: (taskId: number, assigneeId: number) =>
    axiosClient.patch<Task>(
      `/api/v1/tasks/${taskId}/assignee`,
      { assigneeId }
    ),

  // ===== UPDATE STATUS =====
  updateStatus: (taskId: number, status: TaskStatus) =>
    axiosClient.patch<Task>(
      `/api/v1/tasks/${taskId}/status`,
      { status }
    ),

  // ===== DELETE (ADMIN) =====
  delete: (taskId: number) =>
    axiosClient.delete<void>(
      `/api/v1/tasks/${taskId}`
    ),

  // ===== SUBTASK =====
  createSubTask: (taskId: number, title: string) =>
    axiosClient.post(
      `/api/v1/tasks/${taskId}/subtasks`,
      { title }
    ),

  patchSubTask: (
    taskId: number,
    subTaskId: number,
    data: { title?: string; done?: boolean }
  ) =>
    axiosClient.patch(
      `/api/v1/tasks/${taskId}/subtasks/${subTaskId}`,
      data
    ),

  deleteSubTask: (taskId: number, subTaskId: number) =>
    axiosClient.delete(
      `/api/v1/tasks/${taskId}/subtasks/${subTaskId}`
    ),

  // ===== COMMENT =====
  addComment: (taskId: number, content: string) =>
    axiosClient.post(
      `/api/v1/tasks/${taskId}/comments`,
      { content }
    ),
};
