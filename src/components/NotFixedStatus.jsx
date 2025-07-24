import { useEffect, useState } from "react";
import { Select, Spin, Table, Image, Typography, message } from "antd";
import { fetchModelVersions } from "../services/models";
import { fetchNotFixedStatus, assignTask } from "../services/labellingService";
import { getUser } from "../utils/auth"; // adjust path
import { fetchTeamMembers } from "../services/team-member"; // adjust path

const { Option } = Select;
const { Text } = Typography;

export default function NotFixedStatus({ model, showAssignedColumn = false }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const loadVersions = async () => {
      setLoadingVersions(true);
      try {
        const data = await fetchModelVersions(model);
        const versionList = data.versions.map((v) => v.version);
        setVersions(versionList);
        if (versionList.length > 0) {
          setSelectedVersion(versionList[versionList.length - 1]); // latest
        }
      } catch (err) {
        console.error("Failed to fetch versions", err);
      } finally {
        setLoadingVersions(false);
      }
    };

    loadVersions();
  }, [model]);

  useEffect(() => {
    fetchTeamMembers()
      .then(setTeamMembers)
      .catch(() => {
        message.error("Failed to fetch team members");
      });
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      fetchTableData(pagination.current, pagination.pageSize);
    }
  }, [selectedVersion]);

  const fetchTableData = async (page, pageSize) => {
    setLoadingTable(true);
    try {
      const skip = (page - 1) * pageSize;
      const res = await fetchNotFixedStatus(
        model,
        selectedVersion,
        pageSize,
        skip
      );
      setData(res.results);
      setTotal(res.total);
      setPagination({ current: page, pageSize });
    } catch (err) {
      console.error("Failed to fetch table data", err);
    } finally {
      setLoadingTable(false);
    }
  };

  const handleVersionChange = (value) => {
    setSelectedVersion(value);
    fetchTableData(1, pagination.pageSize);
  };

  const handleTableChange = (pagination) => {
    fetchTableData(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <div style={{ maxWidth: 300, whiteSpace: "pre-wrap" }}>
          <Text
            style={{ cursor: "pointer", color: "#1890ff" }}
            onClick={() => copyToClipboard(id)}
          >
            {id}
          </Text>
        </div>
      ),
    },
    {
      title: "Image",
      dataIndex: "input_value",
      key: "image",
      render: (url) => (
        <Image
          src={url}
          width={100}
          height={100}
          style={{ objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Expected Tags",
      dataIndex: "expected_tags",
      key: "expected_tags",
      render: (tags) => (
        <div style={{ maxWidth: 300, whiteSpace: "pre-wrap" }}>
          {tags.map((t) => (
            <Text key={t} style={{ display: "block", color: "#87d068" }}>
              {t}
            </Text>
          ))}
        </div>
      ),
    },
    {
      title: "Fixed Status",
      dataIndex: "fix_status",
      key: "status",
      render: (status) => (
        <Text
          type={status[selectedVersion] === "regressed" ? "danger" : "success"}
        >
          {status[selectedVersion]}
        </Text>
      ),
    },
    {
      title: "Violation Tags",
      dataIndex: "fix_info",
      key: "violations",
      render: (info) => {
        const tags = info[0].violationTags || [];
        return tags.length ? (
          tags.map((tag) => (
            <Text key={tag} style={{ display: "block", color: "#ffa39e" }}>
              {tag}
            </Text>
          ))
        ) : (
          <Text type="secondary">None</Text>
        );
      },
    },
    {
      title: "Predictions",
      dataIndex: "fix_info",
      key: "predictions",
      render: (info) => {
        const preds = info[0].predictions || {};
        const sorted = Object.entries(preds)
          .sort((a, b) => b[1] - a[1]) // sort descending by score
          .slice(0, 5); // optional: limit to top 5

        return sorted.length ? (
          <div style={{ maxWidth: 300, whiteSpace: "pre-wrap" }}>
            {sorted.map(([label, score]) => (
              <Text key={label} style={{ display: "block", color: "#bae637" }}>
                {label}: <b>{score.toFixed(4)}</b>
              </Text>
            ))}
          </div>
        ) : (
          <Text type="secondary">N/A</Text>
        );
      },
    },
  ];
  if (showAssignedColumn && isAdmin) {
    columns.push({
      title: "Assigned To",
      dataIndex: "assigned_to",
      key: "assigned_to",
      render: (val, record) => (
        <Select
          value={val || undefined}
          placeholder="Assign..."
          style={{ width: 160 }}
          onChange={async (newAssignee) => {
            try {
              setLoadingTable(true); // 🔄 start loading
              await assignTask(record._id, newAssignee);
              message.success("Task assigned successfully");
            } catch (e) {
              message.error("Failed to assign task");
            } finally {
              setLoadingTable(false); // ✅ stop loading
            }
          }}
          options={teamMembers.map((tm) => ({
            label: tm.name + " (" + tm.email + ")",
            value: tm.email,
          }))}
        />
      ),
    });
  }

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          paddingLeft: "12px",
          display: "flex",
          gap: "2rem",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            color: "#fff",
            margin: 0,
            fontSize: "18px",
            fontWeight: 500,
          }}
        >
          Version
        </h2>

        {loadingVersions ? (
          <Spin />
        ) : (
          <Select
            value={selectedVersion}
            onChange={handleVersionChange}
            style={{ width: 200 }}
            placeholder="Select version"
          >
            {versions.map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        )}
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        loading={loadingTable}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}
