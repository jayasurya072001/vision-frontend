import LayoutWrapper from "../components/LayoutWrapper";
import ModelDropdown from "../components/ModelDropdown";
import NotFixedStatus from "../components/NotFixedStatus";
import NotFixedImagesCard from "../components/NotFixedImagesCard";
import { useState, useEffect, version } from "react";
import { getUser } from "../utils/auth"; // adjust path
import { useMediaQuery } from "react-responsive";

export default function Tasks() {
  const [model, setModel] = useState("nudity");
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";

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
        <h1>Tasks Page</h1>
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
        {isAdmin && (
          <div>
            <NotFixedStatus model={model} showAssignedColumn={true} />
          </div>
        )}
        {!isAdmin && (
          <div>
            <NotFixedImagesCard model={model} />
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
