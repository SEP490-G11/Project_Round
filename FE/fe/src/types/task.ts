export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  assignee?: {
    id: number;
    email: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface TaskSummaryResponse {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  assignee?: {
    id: number;
    email: string;
    fullName: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface SubTask {
  id: number;
  title: string;
  done: boolean;
  active: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    email: string;
    fullName: string;
  };
  createdAt: string;
}

export interface TaskLog {
  id: number;
  action: string;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  actor: {
    id: number;
    email: string;
    fullName: string;
  };
  createdAt: string;
}

export interface TaskDetailResponse {
  task: Task;
  subtasks: SubTask[];
  comments: Comment[];
  logs: TaskLog[];
}

