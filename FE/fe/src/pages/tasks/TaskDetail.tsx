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
} from "antd";

import { TaskApi } from "../../api/task.api";
import type { Task } from "../../types/task";

interface TaskDetailResponse {
  task: Task;
  subtasks: any[];
  comments: any[];
  logs: any[];
}

export default function TaskDetail() {
  const { id } = useParams();
  const [data, setData] = useState<TaskDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

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

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* TASK INFO */}
      <Card title={task.title} loading={loading}>
        <Space wrap>
          <Tag>{task.priority}</Tag>
          <Tag color="orange">{task.status}</Tag>
          {task.assignee && (
            <Tag color="blue">{task.assignee.fullName}</Tag>
          )}
        </Space>

        <Divider />

        <p><b>Description:</b></p>
        <p>{task.description || "-"}</p>
      </Card>

      {/* SUBTASKS */}
      <Card title="Subtasks">
        <List
          dataSource={subtasks}
          renderItem={(s: any) => (
            <List.Item>
              <Space>
                <Tag color={s.done ? "green" : "default"}>
                  {s.done ? "DONE" : "TODO"}
                </Tag>
                {s.title}
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* COMMENTS */}
      <Card title="Comments">
        <List
          dataSource={comments}
          renderItem={(c: any) => (
            <List.Item>
              <b>{c.author.fullName}:</b> {c.content}
            </List.Item>
          )}
        />

        <Space style={{ width: "100%" }}>
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

      {/* LOGS */}
      <Card title="Activity Log">
        <List
          size="small"
          dataSource={logs}
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
