import { Layout } from "antd";
import Sidebar from "./Sidebar";

const { Content } = Layout;

export default function LayoutWrapper({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Content style={{ padding: "24px", minHeight: "100vh" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
