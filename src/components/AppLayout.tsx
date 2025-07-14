import React from "react";
import { Layout, Dropdown, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { logout } from "../features/auth/authSlice";
import SidebarMenu from "./SidebarMenu";

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo text-white text-center py-4">
          <h2 style={{ color: "#fff", margin: 0 }}>Milán Fragancias</h2>
        </div>
        <SidebarMenu onLogout={handleLogout} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: 0,
            textAlign: "right",
            paddingRight: 24,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Dropdown
            menu={{
              items: [
                {
                  key: "logout",
                  icon: <UserOutlined />,
                  label: "Cerrar sesión",
                  onClick: handleLogout,
                },
              ],
            }}
            placement="bottomRight"
          >
            <span style={{ cursor: "pointer" }}>
              <Avatar
                style={{ backgroundColor: "#87d068", marginRight: 8 }}
                icon={<UserOutlined />}
              />
              {user?.name}
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: "24px 16px 0" }}>
          <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
