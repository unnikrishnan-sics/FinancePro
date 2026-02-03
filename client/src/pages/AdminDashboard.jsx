import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Typography, Tag, message } from 'antd';
import { UserOutlined, DollarOutlined, TransactionOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, totalSpend: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const statsRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/stats`, config);
            const usersRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/users`, config);

            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            message.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            render: (isAdmin) => isAdmin ? <Tag color="gold">Admin</Tag> : <Tag color="blue">User</Tag>
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/dashboard/admin/analytics/${record._id}`)}
                >
                    View Analysis
                </Button>
            )
        }
    ];

    return (
        <div>
            <Title level={3}>Admin Dashboard</Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Total Users"
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                            contentStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Total Transactions"
                            value={stats.totalTransactions}
                            prefix={<TransactionOutlined />}
                            contentStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Total System Spend"
                            value={stats.totalSpend}
                            prefix={<DollarOutlined />}
                            precision={2}
                            contentStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Registered Users" variant="borderless">
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
};

export default AdminDashboard;
