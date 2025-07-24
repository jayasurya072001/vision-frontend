import { Column } from "@ant-design/plots";

export default function MiniChart({ currentData, compareData }) {
  const data = [
    { version: "Previous", value: compareData?.fixed || 0 },
    { version: "Current", value: currentData?.fixed || 0 },
  ];

  const config = {
    data,
    height: 200,
    xField: "version",
    yField: "value",
    color: ({ version }) => {
      return version === "Current" ? "#1890ff" : "#888888";
    },
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    xAxis: {
      label: {
        style: {
          fill: "#ffffff",
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: "#ffffff",
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#444",
          },
        },
      },
    },
    tooltip: {
      customContent: (title, items) => {
        return `<div style="padding: 8px; background: #2a2a2a; border: 1px solid #444">
            <div style="margin-bottom: 4px; color: #ffffff">${title}</div>
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; background: ${
                items?.[0]?.color || "#1890ff"
              }; margin-right: 8px;"></span>
              <span style="color: #ffffff">Fixed: ${
                items?.[0]?.value || 0
              }</span>
            </div>
          </div>`;
      },
    },
  };

  return <Column {...config} />;
}
