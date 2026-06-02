import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Typography, Tag, message, Popconfirm, Switch, Tooltip, Input, Space } from 'antd';
import { 
    UserOutlined, 
    TransactionOutlined, 
    EyeOutlined, 
    DeleteOutlined, 
    LockOutlined, 
    UnlockOutlined, 
    CrownOutlined, 
    SearchOutlined, 
    SecurityScanOutlined,
    WarningOutlined
} from '@ant-design/icons';
import API from '../utils/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    const { darkMode } = useTheme();
    const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, totalSpend: 0 });
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const loggedInUser = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // Get current page from URL, default to 1
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsRes = await API.get('/api/v1/admin/stats');
            const usersRes = await API.get('/api/v1/admin/users');

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setFilteredUsers(usersRes.data);
        } catch (error) {
            message.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        const filtered = users.filter(user => 
            user.name.toLowerCase().includes(value) || 
            user.email.toLowerCase().includes(value) ||
            user._id.toLowerCase().includes(value)
        );
        setFilteredUsers(filtered);
    };

    const handleDeleteUser = async (userId) => {
        try {
            await API.delete(`/api/v1/admin/users/${userId}`);
            message.success('User account and all cascaded transaction logs deleted.');
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to delete user.');
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            const { data } = await API.put(`/api/v1/admin/users/${userId}/block`);
            message.success(data.message);
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to toggle block status.');
        }
    };

    const handleToggleRole = async (userId) => {
        try {
            const { data } = await API.put(`/api/v1/admin/users/${userId}/role`);
            message.success(data.message);
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update user role.');
        }
    };

    const handleTableChange = (pagination) => {
        setSearchParams({ page: pagination.current });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: record.isBlocked ? '#ff4d4f' : 'inherit' }}>
                        {text} {record._id === loggedInUser._id && <Tag color="gold" style={{ marginLeft: 6 }}>You</Tag>}
                    </span>
                    <Text type="secondary" style={{ fontSize: 11 }}>ID: {record._id}</Text>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email, record) => (
                <span style={{ textDecoration: record.isBlocked ? 'line-through' : 'none', opacity: record.isBlocked ? 0.6 : 1 }}>
                    {email}
                </span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'isBlocked',
            key: 'isBlocked',
            render: (isBlocked) => isBlocked ? (
                <Tag color="red" icon={<LockOutlined />}>Blocked</Tag>
            ) : (
                <Tag color="green" icon={<UnlockOutlined />}>Active</Tag>
            )
        },
        {
            title: 'Role',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            render: (isAdmin, record) => (
                <Space>
                    {isAdmin ? <Tag color="gold" icon={<CrownOutlined />}>Admin</Tag> : <Tag color="blue">User</Tag>}
                    {record._id !== loggedInUser._id && (
                        <Popconfirm
                            title={`Are you sure you want to change this user to a ${isAdmin ? 'Standard User' : 'System Administrator'}?`}
                            onConfirm={() => handleToggleRole(record._id)}
                            okText="Yes, Change"
                            cancelText="Cancel"
                        >
                            <Button size="small" type="dashed" style={{ fontSize: 10 }}>Toggle Role</Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        },
        {
            title: 'System Actions',
            key: 'action',
            render: (_, record) => {
                const isSelf = record._id === loggedInUser._id;
                return (
                    <Space size="middle">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/dashboard/admin/analytics/${record._id}`)}
                            style={{ background: '#1677ff' }}
                        >
                            Analytics
                        </Button>
                        
                        {!isSelf && (
                            <>
                                <Popconfirm
                                    title={record.isBlocked ? "Are you sure you want to unblock this user's account?" : "Are you sure you want to block this user's account? They will be immediately logged out and forbidden from logging in."}
                                    onConfirm={() => handleToggleBlock(record._id)}
                                    okText="Yes, Toggle"
                                    cancelText="Cancel"
                                    okButtonProps={{ danger: !record.isBlocked }}
                                >
                                    <Button
                                        size="small"
                                        danger={!record.isBlocked}
                                        type={record.isBlocked ? 'default' : 'dashed'}
                                        icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
                                    >
                                        {record.isBlocked ? 'Unblock' : 'Block'}
                                    </Button>
                                </Popconfirm>

                                <Popconfirm
                                    title="⚠️ CRITICAL EXTREME ACTION: Are you sure you want to completely delete this user? This will permanently wipe their account, all active transactions, notifications, and saving goal timelines. This action CANNOT be undone!"
                                    onConfirm={() => handleDeleteUser(record._id)}
                                    okText="Yes, WIPE Data"
                                    cancelText="Cancel"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button
                                        type="primary"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                    >
                                        Delete
                                    </Button>
                                </Popconfirm>
                            </>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Admin Control Panel</Title>
                    <Text type="secondary">Real-time system monitoring, comprehensive database overrides, and user account management</Text>
                </div>
            </div>

            {/* Statistics Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: '4px solid #52c41a' }}>
                        <Statistic
                            title={<Text strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active System Users</Text>}
                            value={stats.totalUsers}
                            prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: '4px solid #1677ff' }}>
                        <Statistic
                            title={<Text strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recorded Transactions</Text>}
                            value={stats.totalTransactions}
                            prefix={<TransactionOutlined style={{ color: '#1677ff' }} />}
                            valueStyle={{ color: '#1677ff', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: '4px solid #cf1322' }}>
                        <Statistic
                            title={<Text strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total System Outflow</Text>}
                            value={stats.totalSpend}
                            prefix={<span style={{ marginRight: 8, color: '#cf1322', fontWeight: 700 }}>₹</span>}
                            precision={2}
                            valueStyle={{ color: '#cf1322', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Registered Users Block */}
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <SecurityScanOutlined style={{ color: '#1677ff' }} />
                        <span>Registered User Accounts</span>
                    </div>
                } 
                variant="borderless"
                style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                extra={
                    <Input
                        placeholder="Search by name, email or ID..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={searchText}
                        onChange={handleSearch}
                        style={{ width: 280, borderRadius: 8 }}
                        allowClear
                    />
                }
            >
                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    onChange={handleTableChange}
                    rowClassName={(record) => record.isBlocked ? (darkMode ? 'blocked-row-dark' : 'blocked-row-light') : ''}
                    pagination={{
                        current: currentPage,
                        pageSize: 5,
                        showSizeChanger: false
                    }}
                />
            </Card>

            {/* Custom Admin Guide / Warning Alerts Panel */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card 
                        size="small" 
                        bordered={false} 
                        style={{ 
                            background: darkMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #fff2e8 0%, #fff7e6 100%)', 
                            borderRadius: 12,
                            border: darkMode ? '1px solid #334155' : '1px solid #ffd591',
                        }}
                    >
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 8 }}>
                            <WarningOutlined style={{ color: '#d4380d', fontSize: 20, marginTop: 2 }} />
                            <div>
                                <Title level={5} style={{ margin: 0, color: '#d4380d' }}>
                                    ⚠️ Critical Administrative Safety Rules
                                </Title>
                                <ul style={{ margin: '8px 0 0 0', paddingLeft: 18, color: darkMode ? '#94a3b8' : '#595959', fontSize: 13, lineHeight: 1.6 }}>
                                    <li><strong>Account Deletion:</strong> Deleting a user account executes a cascading DB sweep that permanently wipes the user's login profile, saved goals, transaction ledgers, alerts, and feedback lists. This action is irreversible.</li>
                                    <li><strong>Account Suspension (Block):</strong> When an account is suspended/blocked, the user's active session token is immediately invalidated on the server, and future authorization attempts are rejected with a <code>403 Forbidden</code> warning.</li>
                                    <li><strong>Self Protection:</strong> The control panel is programmatically shielded to prevent you from de-admining, blocking, or deleting your own active account, securing system access continuity.</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Embedded CSS for Blocked Rows */}
            <style>{`
                .blocked-row-light {
                    background-color: #fff1f0 !important;
                }
                .blocked-row-dark {
                    background-color: #2a1215 !important;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
