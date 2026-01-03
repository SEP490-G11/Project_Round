import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { TaskApi } from "../../api/task.api";
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

  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
        tags: task.tags?.join(", "),
      });
    }
  }, [task]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await TaskApi.patch(task!.id, {
        title: values.title,
        description: values.description,
        priority: values.priority as TaskPriority,
        dueDate: values.dueDate?.format("YYYY-MM-DD"),
        tags: values.tags?.split(",").map((t: string) => t.trim()),
      });

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
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
          <Select>
            <Option value="LOW">LOW</Option>
            <Option value="MEDIUM">MEDIUM</Option>
            <Option value="HIGH">HIGH</Option>
          </Select>
        </Form.Item>

        <Form.Item name="dueDate" label="Due date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
