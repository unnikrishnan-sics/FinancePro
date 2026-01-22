import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard = () => {
    const [user, setUser] = useState({});

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);

    // Mock Data for Table
    const dataSource = [
        { key: '1', date: '2024-05-20', category: 'Grocery', amount: 120.50, type: 'expense' },
        { key: '2', date: '2024-05-19', category: 'Salary', amount: 8500.00, type: 'income' },
        { key: '3', date: '2024-05-18', category: 'Utilities', amount: 95.00, type: 'expense' },
        { key: '4', date: '2024-05-15', category: 'Freelance', amount: 350.00, type: 'income' },
        { key: '5', date: '2024-05-12', category: 'Dining Out', amount: 45.00, type: 'expense' },
    ];

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'income' ? 'success' : 'error'}>
                    {type.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => (
                <span style={{ color: record.type === 'income' ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>
                    {record.type === 'expense' ? '-' : '+'} ${amount.toFixed(2)}
                </span>
            )
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Overview</Title>
                    <Typography.Text type="secondary">Welcome back, {user.name} 👋</Typography.Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />}>Add Transaction</Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Balance"
                            value={12593.00}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix=""
                        />
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                            <span style={{ color: '#3f8600' }}><ArrowUpOutlined /> 2.5%</span> vs last month
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Income"
                            value={8500.00}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                            <span style={{ color: '#3f8600' }}><ArrowUpOutlined /> 12%</span> vs last month
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Expenses"
                            value={4200.00}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                            <span style={{ color: '#cf1322' }}><ArrowUpOutlined /> 4.1%</span> vs last month
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Savings"
                            value={3393.00}
                            precision={2}
                            valueStyle={{ color: '#1677ff' }}
                            prefix={<DollarOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                            <span style={{ color: '#3f8600' }}><ArrowUpOutlined /> 2.1%</span> vs last month
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Spending Analytics" bordered={false} style={{ height: '100%' }}>
                        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: 8, border: '1px dashed #d9d9d9' }}>
                            <Typography.Text type="secondary">[Chart Component Placeholder]</Typography.Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Recent Transactions" bordered={false} extra={<a href="#">View All</a>} style={{ height: '100%' }}>
                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
