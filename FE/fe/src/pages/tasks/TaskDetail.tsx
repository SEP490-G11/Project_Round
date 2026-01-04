import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Tag,
  Space,
  Divider,
  List,
  Input,
  Button,
  message,
  Select,
  Popconfirm,
} from "antd";

import { TaskApi } from "../../api/task.api";
import type { Task, TaskStatus } from "../../types/task";

interface TaskDetailResponse {
  task: Task;
  subtasks: any[];
  comments: any[];
  logs: any[];
}

const { Option } = Select;

export default function TaskDetail() {
  const { id } = useParams();

  const [data, setData] = useState<TaskDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [comment, setComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

  // ===== AUTH STORAGE =====
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";
  const isAssignee = data?.task.assignee?.id === user?.id;
  const canEdit = isAdmin || isAssignee;

  // ===== FETCH DETAIL =====
  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await TaskApi.detail(Number(id));
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (!data) return null;

  const { task, subtasks, comments, logs } = data;

  // ===== UPDATE STATUS =====
  const updateStatus = async (status: TaskStatus) => {
    try {
      await TaskApi.updateStatus(task.id, status);
      message.success("Status updated");
      fetchDetail();
    } catch {
      message.error("Update status failed");
    }
  };

  // ===== ADD COMMENT =====
  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      await TaskApi.addComment(task.id, comment);
      setComment("");
      fetchDetail();
    } catch {
      message.error("Add comment failed");
    }
  };

  // ===== ADD SUBTASK =====
  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      await TaskApi.createSubTask(task.id, newSubtask);
      setNewSubtask("");
      message.success("Subtask added");
      fetchDetail();
    } catch {
      message.error("Add subtask failed");
    }
  };

  // ===== DELETE SUBTASK =====
  const deleteSubtask = async (subtaskId: number) => {
    try {
      await TaskApi.deleteSubTask(task.id, subtaskId);
      message.success("Subtask deleted");
      fetchDetail();
    } catch {
      message.error("Delete subtask failed");
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* ================= TASK INFO ================= */}
      <Card title={task.title} loading={loading}>
        <Space wrap>
          <Tag>{task.priority}</Tag>

          {(isAdmin || isAssignee) ? (
            <Select
              value={task.status}
              style={{ width: 160 }}
              onChange={updateStatus}
            >
              <Option value="TODO">TODO</Option>
              <Option value="IN_PROGRESS">IN_PROGRESS</Option>
              <Option value="DONE">DONE</Option>
            </Select>
          ) : (
            <Tag color="orange">{task.status}</Tag>
          )}

          {task.assignee && (
            <Tag color="blue">{task.assignee.fullName}</Tag>
          )}
        </Space>

        <Divider />

        <p><b>Description:</b></p>
        <p>{task.description || "-"}</p>
      </Card>

      {/* ================= SUBTASKS ================= */}
      <Card title="Subtasks">
        <List
          dataSource={subtasks}
          locale={{ emptyText: "No subtasks" }}
          renderItem={(s: any) => (
            <List.Item
              actions={
                canEdit
                  ? [
                      <Popconfirm
                        key="delete"
                        title="Delete this subtask?"
                        okText="Delete"
                        cancelText="Cancel"
                        onConfirm={() => deleteSubtask(s.id)}
                      >
                        <Button danger size="small">
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]
                  : []
              }
            >
              <Space>
                <Tag color={s.done ? "green" : "default"}>
                  {s.done ? "DONE" : "TODO"}
                </Tag>
                {s.title}
              </Space>
            </List.Item>
          )}
        />

        {canEdit && (
          <Space style={{ width: "100%", marginTop: 12 }}>
            <Input
              placeholder="New subtask..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
            />
            <Button type="primary" onClick={addSubtask}>
              Add
            </Button>
          </Space>
        )}
      </Card>

      {/* ================= COMMENTS ================= */}
      <Card title="Comments">
        <List
          dataSource={comments}
          locale={{ emptyText: "No comments" }}
          renderItem={(c: any) => (
            <List.Item>
              <b>{c.author.fullName}:</b> {c.content}
            </List.Item>
          )}
        />

        <Space style={{ width: "100%", marginTop: 8 }}>
          <Input
            placeholder="Add comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="primary" onClick={addComment}>
            Send
          </Button>
        </Space>
      </Card>

      {/* ================= ACTIVITY LOG ================= */}
      <Card title="Activity Log">
        <List
          size="small"
          dataSource={logs}
          locale={{ emptyText: "No activity" }}
          renderItem={(l: any) => (
            <List.Item>
              <span>
                <b>{l.actor.fullName}</b> {l.action} {l.fieldName}
                {" "}({l.oldValue} → {l.newValue})
              </span>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
