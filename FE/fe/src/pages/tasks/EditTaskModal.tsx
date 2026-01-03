import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { TaskApi } from "../../api/task.api";
import { UserApi } from "../../api/user.api";
import type { UserBrief } from "../../api/user.api";
import type { Task, TaskPriority } from "../../types/task";
import { useEffect, useState } from "react";

const { Option } = Select;

interface Props {
  open: boolean;
  task?: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTaskModal({
  open,
  task,
  onClose,
  onSuccess,
}: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // ===== USERS FOR ASSIGN =====
  const [users, setUsers] = useState<UserBrief[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ===== AUTH =====
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";

  // ===== INIT FORM =====
  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
        tags: task.tags?.join(", "),
        assigneeId: task.assignee?.id,
      });
    }
  }, [task]);

  // ===== LOAD USERS =====
  useEffect(() => {
    if (!open || !isAdmin) return;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await UserApi.list();
        setUsers(res.data);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [open, isAdmin]);

  // ===== SUBMIT =====
  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 1️⃣ UPDATE TASK INFO
      await TaskApi.patch(task!.id, {
        title: values.title,
        description: values.description,
        priority: values.priority as TaskPriority,
        dueDate: values.dueDate?.format("YYYY-MM-DD"),
        tags: values.tags
          ?.split(",")
          .map((t: string) => t.trim()),
      });

      // 2️⃣ ASSIGN USER (ADMIN ONLY)
      if (
        isAdmin &&
        values.assigneeId &&
        values.assigneeId !== task?.assignee?.id
      ) {
        await TaskApi.assign(task!.id, values.assigneeId);
      }

      message.success("Task updated");
      onSuccess();
      onClose();
    } catch (e) {
      message.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Task"
      onOk={submit}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {/* TITLE */}
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        {/* DESCRIPTION */}
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* PRIORITY */}
        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="LOW">LOW</Option>
            <Option value="MEDIUM">MEDIUM</Option>
            <Option value="HIGH">HIGH</Option>
            <Option value="URGENT">URGENT</Option>
          </Select>
        </Form.Item>

        {/* DUE DATE */}
        <Form.Item name="dueDate" label="Due date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* TAGS */}
        <Form.Item name="tags" label="Tags">
          <Input placeholder="tag1, tag2, tag3" />
        </Form.Item>

        {/* ASSIGNEE – ADMIN ONLY */}
        {isAdmin && (
          <Form.Item name="assigneeId" label="Assignee">
            <Select
              allowClear
              placeholder="Select assignee"
              loading={loadingUsers}
              notFoundContent={
                loadingUsers ? <Spin size="small" /> : null
              }
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
