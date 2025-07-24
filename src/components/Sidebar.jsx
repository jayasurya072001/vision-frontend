import React from "react";
import { Tooltip, Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../utils/auth";

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/labelling",
      icon: <FileTextOutlined />,
      label: "Labelling",
    },
    {
      key: "/predictions",
      icon: <LineChartOutlined />, // better represents predictions/analytics
      label: "Predictions",
    },
    {
      key: "/tasks",
      icon: <CheckCircleOutlined />, // better than OrderedList for tasks
      label: "Tasks",
    },
    {
      key: "/team",
      icon: <TeamOutlined />,
      label: "Team Members",
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "/logout") {
      logout();
      navigate("/");
    } else {
      navigate(key);
    }
  };

  return (
    <Sider width={80} style={{ background: "#001529" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{ borderRight: 0, flex: 1, padding: "4px" }}
        >
          {mainMenuItems.map((item) => (
            <Menu.Item
              key={item.key}
              style={{ marginTop: "10px" }}
              icon={
                <Tooltip title={item.label} placement="right">
                  {React.cloneElement(item.icon, {
                    style: { fontSize: "20px", paddingTop: "5px" },
                  })}
                </Tooltip>
              }
            />
          ))}
        </Menu>
        <Menu
          theme="dark"
          mode="vertical"
          selectable={false}
          onClick={handleMenuClick}
        >
          <Menu.Item
            key="/logout"
            icon={
              <Tooltip title="Logout" placement="right">
                <LogoutOutlined style={{ fontSize: "20px" }} />
              </Tooltip>
            }
          />
        </Menu>
      </div>
    </Sider>
  );
};

export default Sidebar;
