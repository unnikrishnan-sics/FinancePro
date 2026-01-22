import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, theme, Typography } from 'antd';
import {
    AppstoreOutlined,
    WalletOutlined,
    PieChartOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined,
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG, colorPrimary },
    } = theme.useToken();


    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const menuItems = [
        { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Overview' },
        { key: '/dashboard/transactions', icon: <WalletOutlined />, label: 'Transactions' },
        { key: '/dashboard/analytics', icon: <PieChartOutlined />, label: 'Analytics' },
        { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
    ];

    const userMenu = {
        items: [
            { key: 'profile', label: 'My Profile', icon: <UserOutlined /> },
            { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
            { type: 'divider' },
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout, danger: true },
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
                width={250}
                style={{ borderRight: '1px solid #f0f0f0' }}
            >
                <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: 40, marginRight: collapsed ? 0 : 10 }} />
                    {!collapsed && <Title level={4} style={{ margin: 0 }}>FinancePro</Title>}
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderRight: 0, padding: '16px 8px' }}
                />
            </Sider>

            <Layout>
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Button type="text" shape="circle" icon={<BellOutlined />} />

                        <Dropdown menu={userMenu}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                                    <Text strong style={{ display: 'block' }}>{userInfo.name || 'User'}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{userInfo.email || 'user@example.com'}</Text>
                                </div>
                                <Avatar style={{ backgroundColor: colorPrimary }} icon={<UserOutlined />} />
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        overflow: 'auto'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
