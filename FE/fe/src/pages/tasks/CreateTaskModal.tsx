import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { TaskApi } from "../../api/task.api";
import { useState } from "react";
import type { TaskPriority } from "../../types/task";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // reload task list
}

interface FormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: dayjs.Dayjs;
  tags?: string;
  assigneeId?: number;
}

export default function CreateTaskModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await TaskApi.create({
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate
          ? values.dueDate.format("YYYY-MM-DD")
          : undefined,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        assigneeId: values.assigneeId,
      });

      message.success("Task created successfully");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      message.error(
        err?.response?.data?.message || "Create task failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Task"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Create"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {/* TITLE */}
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: "Title is required" },
            { max: 200, message: "Max 200 characters" },
          ]}
        >
          <Input placeholder="Task title" />
        </Form.Item>

        {/* DESCRIPTION */}
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Task description" />
        </Form.Item>

        {/* PRIORITY */}
        <Form.Item
          label="Priority"
          name="priority"
          rules={[{ required: true, message: "Priority is required" }]}
        >
          <Select placeholder="Select priority">
            <Option value="LOW">LOW</Option>
            <Option value="MEDIUM">MEDIUM</Option>
            <Option value="HIGH">HIGH</Option>
          </Select>
        </Form.Item>

        {/* DUE DATE */}
        <Form.Item label="Due date" name="dueDate">
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={(d) =>
              d && d.isBefore(dayjs().startOf("day"))
            }
          />
        </Form.Item>

        {/* TAGS */}
        <Form.Item label="Tags (comma separated)" name="tags">
          <Input placeholder="bug, backend, urgent" />
        </Form.Item>

        {/* ASSIGNEE (OPTIONAL – ADMIN) */}
        <Form.Item label="Assignee ID" name="assigneeId">
          <Input type="number" placeholder="User ID" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
