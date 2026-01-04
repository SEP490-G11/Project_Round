import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Select,
  Input,
  Space,
  Button,
  Popconfirm,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

import { TaskApi } from "../../api/task.api";
import { ReportApi } from "../../api/report.api";
import { downloadBlob } from "../../utils/download";

import type {
  Task,
  TaskStatus,
  TaskPriority,
} from "../../types/task";

import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";

const { Option } = Select;

export default function TaskList() {
  const navigate = useNavigate();

  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [status, setStatus] = useState<TaskStatus | undefined>();
  const [priority, setPriority] = useState<TaskPriority | undefined>();
  const [keyword, setKeyword] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ===== AUTH STORAGE =====
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";

  // ===== FETCH TASK LIST =====
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await TaskApi.list({
        page,
        size,
        status,
        priority,
        q: keyword || undefined,
      });
      setData(res.data.content);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, size, status, priority, keyword]);

  // ===== DELETE TASK (ADMIN) =====
  const handleDelete = async (taskId: number) => {
    try {
      await TaskApi.delete(taskId);
      message.success("Task deleted");
      fetchData();
    } catch {
      message.error("Delete failed");
    }
  };

  // ===== EXPORT TASKS =====
  const handleExport = async () => {
    try {
      const res = await ReportApi.exportTasks();
      downloadBlob(res.data, "tasks.xlsx");
      message.success("Export success");
    } catch {
      message.error("Export failed");
    }
  };

  // ===== TABLE COLUMNS =====
  const columns: ColumnsType<Task> = [
    {
      title: "Title",
      dataIndex: "title",
      render: (_: any, record: Task) => (
        <a onClick={() => navigate(`/tasks/${record.id}`)}>
          {record.title}
        </a>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (p) => <Tag color="blue">{p}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "DONE" ? "green" : "orange"}>
          {s}
        </Tag>
      ),
    },
    {
      title: "Assignee",
      dataIndex: ["assignee", "fullName"],
      render: (v) => v || "-",
    },

    // ===== ACTIONS (ADMIN ONLY) =====
    ...(isAdmin
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Task) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedTask(record);
                    setOpenEdit(true);
                  }}
                >
                  Update
                </Button>

                <Popconfirm
                  title="Delete task"
                  description="Are you sure you want to delete this task?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button size="small" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      {/* ================= FILTER BAR ================= */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search task..."
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
        />

        <Select
          placeholder="Status"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setStatus(v)}
        >
          <Option value="TODO">TODO</Option>
          <Option value="IN_PROGRESS">IN_PROGRESS</Option>
          <Option value="DONE">DONE</Option>
        </Select>

        <Select
          placeholder="Priority"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setPriority(v)}
        >
          <Option value="LOW">LOW</Option>
          <Option value="MEDIUM">MEDIUM</Option>
          <Option value="HIGH">HIGH</Option>
        </Select>

        {/* EXPORT – ALL USERS */}
        <Button onClick={handleExport}>
          Export Excel
        </Button>

        {/* CREATE TASK – ADMIN ONLY */}
        {isAdmin && (
          <Button
            type="primary"
            onClick={() => setOpenCreate(true)}
          >
            Create Task
          </Button>
        )}
      </Space>

      {/* ================= TABLE ================= */}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: page + 1,
          pageSize: size,
          onChange: (p, s) => {
            setPage(p - 1);
            setSize(s);
          },
        }}
      />

      {/* ================= CREATE MODAL ================= */}
      <CreateTaskModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={fetchData}
      />

      {/* ================= EDIT MODAL ================= */}
      {selectedTask && (
        <EditTaskModal
          open={openEdit}
          task={selectedTask}
          onClose={() => {
            setOpenEdit(false);
            setSelectedTask(null);
          }}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}
