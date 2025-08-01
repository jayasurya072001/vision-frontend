import { useEffect, useState } from "react";
import { Card, Table, Typography, Divider, Tag, Spin } from "antd";
import {
  fetchSummaryData,
  fetchSummaryByEvaluated,
  fetchSummaryByMarked,
} from "../services/summary";

const { Title } = Typography;

export default function SummaryTab({ model, onTagClick }) {
  const [summary, setSummary] = useState({});
  const [evaluatedBy, setEvaluatedBy] = useState({});
  const [markedBy, setMarkedBy] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchSummaryData(model);
      const evaluated = await fetchSummaryByEvaluated(model);
      const marked = await fetchSummaryByMarked(model);
      setSummary(data);
      setEvaluatedBy(evaluated);
      setMarkedBy(marked);
      setLoading(false);
    };
    load();
  }, [model]);

  const renderVersionSummary = () => {
    const versions = Object.keys(summary).sort((a, b) => b.localeCompare(a));
    return versions.map((version) => {
      const versionData = summary[version];
      const tagEntries = versionData.by_expected_tag || {};

      const tagRows = Object.entries(tagEntries).map(([tag, stats]) => ({
        key: tag,
        tag,
        ...stats,
      }));

      return (
        <Card
          key={version}
          title={`Version: ${version}`}
          style={{
            marginBottom: 24,
            backgroundColor: "#1f1f1f",
            color: "#fff",
          }}
          headStyle={{ color: "#fff", borderBottom: "1px solid #333" }}
        >
          <Table
            size="small"
            pagination={false}
            dataSource={tagRows}
            columns={[
              {
                title: "Tag",
                dataIndex: "tag",
                render: (tag) => (
                  <Tag
                    color="geekblue"
                    style={{ cursor: "pointer" }}
                    onClick={() => onTagClick([tag])}
                  >
                    {tag}
                  </Tag>
                ),
              },
              { title: "Fixed", dataIndex: "fixed" },
              { title: "Not Fixed", dataIndex: "not_fixed" },
              { title: "Regressed", dataIndex: "regressed" },
              { title: "Not Regressed", dataIndex: "not_regressed" },
            ]}
            style={{ color: "#fff" }}
            scroll={{ x: "max-content", y: 400 }}
          />

          <Divider style={{ backgroundColor: "#333" }} />

          <div style={{ display: "flex", gap: "24px" }}>
            <div>
              <strong>Fixed:</strong> {versionData.fixed}
            </div>
            <div>
              <strong>Not Fixed:</strong> {versionData.not_fixed}
            </div>
            <div>
              <strong>Regressed:</strong> {versionData.regressed}
            </div>
            <div>
              <strong>Not Regressed:</strong> {versionData.not_regressed}
            </div>
          </div>
        </Card>
      );
    });
  };

  const renderUserTagStats = (title, data) => {
    const rows = Object.entries(data).map(([email, tags]) => {
      return {
        key: email,
        email,
        tags: Object.entries(tags)
          .map(([tag, count]) => `${tag} (${count})`)
          .join(", "),
      };
    });

    return (
      <Card
        title={title}
        style={{ marginBottom: 24, backgroundColor: "#1f1f1f", color: "#fff" }}
        headStyle={{ color: "#fff", borderBottom: "1px solid #333" }}
      >
        <Table
          size="small"
          pagination={false}
          dataSource={rows}
          columns={[
            { title: "User", dataIndex: "email" },
            { title: "Tags", dataIndex: "tags" },
          ]}
        />
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ color: "#fff" }}>
      <Title level={3} style={{ color: "#fff" }}>
        Version Summary
      </Title>
      {renderVersionSummary()}

      <Divider style={{ backgroundColor: "#444" }} />

      <Title level={3} style={{ color: "#fff" }}>
        Evaluated By
      </Title>
      {renderUserTagStats("Evaluated By", evaluatedBy)}

      <Divider style={{ backgroundColor: "#444" }} />

      <Title level={3} style={{ color: "#fff" }}>
        Marked By
      </Title>
      {renderUserTagStats("Marked By", markedBy)}
    </div>
  );
}
