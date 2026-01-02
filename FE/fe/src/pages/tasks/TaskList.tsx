import { useEffect, useState } from "react";
import { Table, Tag, Button } from "antd";
import { TaskApi } from "../../api/task.api";

export default function TaskList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    TaskApi.list({ page: 0, size: 10 })
      .then((res) => setData(res.data.content))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={data}
      columns={[
        { title: "Title", dataIndex: "title" },
        {
          title: "Priority",
          dataIndex: "priority",
          render: (p) => <Tag>{p}</Tag>,
        },
        { title: "Status", dataIndex: "status" },
        {
          title: "Assignee",
          dataIndex: ["assignee", "fullName"],
        },
        {
          title: "Action",
          render: (_, r) => (
            <Button onClick={() => console.log(r.id)}>
              Detail
            </Button>
          ),
        },
      ]}
    />
  );
}
