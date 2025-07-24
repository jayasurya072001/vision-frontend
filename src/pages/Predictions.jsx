import { useState } from "react";
import { Tabs } from "antd";
import ModelDropdown from "../components/ModelDropdown";
import LayoutWrapper from "../components/LayoutWrapper";

// Tab components
import VersionTab from "../components/VersionTab";
import SummaryTab from "../components/SummaryTab";
import ImagesTab from "../components/ImagesTab";
import Regression from "../components/Regression";
import FixedStatus from "../components/FixedStatus";
import NotFixedStatus from "../components/NotFixedStatus"; // Assuming this is the correct import path
import ModelClassInfo from "../components/ModelClassInfo"; // Assuming this is the correct import path
import { useMediaQuery } from "react-responsive";

const { TabPane } = Tabs;

export default function Predictions() {
  const [model, setModel] = useState("nudity");
  const [activeTab, setActiveTab] = useState("version");
  const [selectedTag, setSelectedTag] = useState([]);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setActiveTab("images");
  };

  const handleModelChange = (value) => {
    setModel(value);
    // You might want to fetch data here when model changes
  };

  return (
    <LayoutWrapper>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#1a1a1a", // Dark grey background
          minHeight: "93vh",
          width: isSmallScreen ? "70vw" : "93vw",
          color: "#ffffff", // Bright white text
        }}
      >
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "600",
            }}
          >
            {model.toUpperCase()} Analysis Dashboard
          </h1>
          <ModelDropdown
            value={model}
            onChange={handleModelChange}
            style={{
              width: "200px",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              borderColor: "#444",
            }}
          />
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="line"
          tabBarStyle={{
            marginBottom: "24px",
            color: "#ffffff",
          }}
          tabBarGutter={32}
          items={[
            {
              key: "version",
              label: (
                <span
                  style={{
                    color: activeTab === "version" ? "#1890ff" : "#ffffff",
                    fontSize: "16px",
                    padding: "0 16px",
                  }}
                >
                  Version
                </span>
              ),
              children: <VersionTab model={model} />,
            },
            {
              key: "classes",
              label: (
                <span
                  style={{
                    color: activeTab === "classes" ? "#1890ff" : "#ffffff",
                    fontSize: "16px",
                    padding: "0 16px",
                  }}
                >
                  Classes
                </span>
              ),
              children: <ModelClassInfo model={model} />,
            },
            {
              key: "summary",
              label: (
                <span
                  style={{
                    color: activeTab === "summary" ? "#1890ff" : "#ffffff",
                    fontSize: "16px",
                    padding: "0 16px",
                  }}
                >
                  Summary
                </span>
              ),
              children: (
                <SummaryTab model={model} onTagClick={handleTagClick} />
              ),
            },
            {
              key: "images",
              label: (
                <span
                  style={{
                    color: activeTab === "images" ? "#1890ff" : "#ffffff",
                    fontSize: "16px",
                    padding: "0 16px",
                  }}
                >
                  Images
                </span>
              ),
              children: <ImagesTab model={model} filterTag={selectedTag} />,
            },
            {
              key: "regression",
              label: (
                <span
                  style={{
                    color: activeTab === "regression" ? "#1890ff" : "#ffffff",
                    fontSize: "16px",
                    padding: "0 16px",
                  }}
                >
                  Regression
                </span>
              ),
              children: <Regression model={model} />,
            },
            {
              key: "fixed",
              label: (
                <span
                  style={{
                    color: activeTab === "fixed" ? "#1890ff" : "#ffffff",
                    fontSize: "16px",
                    padding: "0 16px",
                  }}
                >
                  Fixed
                </span>
              ),
              children: (
                <FixedStatus model={model} showAssignedColumn={false} />
              ),
            },
            {
              key: "not-fixed",
              label: (
                <span
                  style={{
                    color: activeTab === "notFixed" ? "#1890ff" : "#ffffff",
                    fontSize: "16px",
                    padding: "0 16px",
                  }}
                >
                  Not Fixed
                </span>
              ),
              children: <NotFixedStatus model={model} />,
            },
          ]}
        />
      </div>
    </LayoutWrapper>
  );
}
