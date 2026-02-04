import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, theme, Typography } from 'antd';
import { useTheme } from '../context/ThemeContext';
import {
    AppstoreOutlined,
    WalletOutlined,
    PieChartOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined,
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    NotificationOutlined,
    CheckCircleOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { Badge, Popover, List, message as antMessage } from 'antd';
import API from '../utils/axios';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const { darkMode } = useTheme();
    const {
        token: { colorBgContainer, colorBgLayout, borderRadiusLG, colorPrimary, colorBorder },
    } = theme.useToken();


    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const menuItems = userInfo.isAdmin ? [
        { key: '/dashboard/admin', icon: <AppstoreOutlined />, label: 'Admin Dashboard' },
        { key: '/dashboard/admin/system-analytics', icon: <PieChartOutlined />, label: 'System Analytics' },
        { key: '/dashboard/admin/messages', icon: <MessageOutlined />, label: 'Messages' },
        { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
    ] : [
        { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Overview' },
        { key: '/dashboard/transactions', icon: <WalletOutlined />, label: 'Transactions' },
        { key: '/dashboard/analytics', icon: <PieChartOutlined />, label: 'Analytics' },
        { key: '/dashboard/feedback', icon: <MessageOutlined />, label: 'Feedback' },
        { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
    ];

    React.useEffect(() => {
        if (userInfo.isAdmin && location.pathname === '/dashboard') {
            navigate('/dashboard/admin');
        }
    }, [userInfo, location, navigate]);

    const userMenu = {
        items: [
            { key: 'profile', label: 'My Profile', icon: <UserOutlined /> },
            { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
            { type: 'divider' },
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout, danger: true },
        ]
    };

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const res = await API.post('/api/v1/notifications/get-all-notification',
                { userId: userInfo._id }
            );
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications', error);
        }
    };

    // Mark Read
    const handleRead = async () => {
        try {
            await API.post('/api/v1/notifications/mark-as-read',
                { userId: userInfo._id }
            );
            setUnreadCount(0);
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    // Initial Fetch
    React.useEffect(() => {
        if (userInfo._id) fetchNotifications();
    }, []);

    const notificationContent = (
        <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>Notifications</Text>
                <Button type="link" size="small" onClick={handleRead}>Mark all read</Button>
            </div>
            <List
                dataSource={notifications}
                renderItem={item => (
                    <List.Item style={{ background: item.read ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.08)' : '#f0faff'), padding: '12px 8px', borderRadius: 4 }}>
                        <List.Item.Meta
                            avatar={item.type === 'warning' ? <BellOutlined style={{ color: '#faad14' }} /> : <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            title={<Text style={{ fontSize: 13 }}>{item.message}</Text>}
                            description={<Text type="secondary" style={{ fontSize: 11 }}>{new Date(item.date).toLocaleDateString()}</Text>}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: 'No notifications' }}
            />
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh', background: colorBgLayout }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme={darkMode ? 'dark' : 'light'}
                width={250}
                style={{ borderRight: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}` }}
            >
                <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}` }}>
                    <img src="/logo.png" alt="Logo" style={{ height: 40, marginRight: collapsed ? 0 : 10 }} />
                    {!collapsed && <Title level={4} style={{ margin: 0, color: darkMode ? '#fff' : 'inherit' }}>FinancePro</Title>}
                </div>

                <Menu
                    theme={darkMode ? 'dark' : 'light'}
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderRight: 0, padding: '16px 8px' }}
                />
            </Sider>

            <Layout style={{ background: colorBgLayout }}>
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Popover content={notificationContent} trigger="click" placement="bottomRight" onOpenChange={(visible) => visible && fetchNotifications()}>
                            <Badge count={unreadCount} offset={[-5, 5]}>
                                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 20 }} />} />
                            </Badge>
                        </Popover>

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
