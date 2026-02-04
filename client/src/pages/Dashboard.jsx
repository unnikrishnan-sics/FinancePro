import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, message, theme } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, PlusOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import API from '../utils/axios';
import AddTransactionModal from '../components/AddTransactionModal';
import { useTheme } from '../context/ThemeContext';

const { Title } = Typography;

const Dashboard = () => {
    const [user, setUser] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { token } = theme.useToken();
    const { chartType } = useTheme();

    // Stats
    const [totalBalance, setTotalBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
            fetchTransactions();
        }
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // Trigger recurring check silently
            API.post('/api/v1/transactions/check-recurring', {}).catch(() => { });

            const { data } = await API.get('/api/v1/transactions/get-transactions');
            setTransactions(data);
            calculateStats(data);
            prepareChartData(data);
        } catch (error) {
            message.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalIncome = data
            .filter(item => item.type === 'income')
            .reduce((acc, item) => acc + item.amount, 0);

        const totalExpense = data
            .filter(item => item.type === 'expense')
            .reduce((acc, item) => acc + item.amount, 0);

        setIncome(totalIncome);
        setExpense(totalExpense);
        setTotalBalance(totalIncome - totalExpense);
    };

    const prepareChartData = (data) => {
        // 1. Group by Date
        const grouped = data.reduce((acc, item) => {
            const dateKey = new Date(item.date).toLocaleDateString();
            if (!acc[dateKey]) {
                acc[dateKey] = { date: dateKey, amount: 0, income: 0, expense: 0 };
            }
            if (item.type === 'income') {
                acc[dateKey].income += item.amount;
                acc[dateKey].amount += item.amount; // Net balance effect: +Income
            } else {
                acc[dateKey].expense += item.amount;
                acc[dateKey].amount -= item.amount; // Net balance effect: -Expense
            }
            return acc;
        }, {});

        // 2. Convert to Array and Sort Chronologically
        const sortedData = Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Format Date for Display
        const cData = sortedData.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            // Use absolute amount for visualization if needed, or keep net
            // For "Spending Analytics", showing Net Daily Change is often good, or just Expense.
            // Let's show Net Change since the previous chart was just +/- amounts.
            // Or better: Let's track Cumulative Balance for a smoother line?
            // The user expectation is likely "Trend". Let's toggle between Net Change.
            // Actually, previous implementation just plotted amounts.
            // Let's stick to Net Amount (Income - Expense) for the day.
            amount: item.income - item.expense
        }));

        setChartData(cData.slice(-10)); // Show last 10 days
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString()
        },
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
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    onClick={() => handleDelete(record._id)}
                >
                    Delete
                </Button>
            ),
        },
    ];

    const handleDelete = async (id) => {
        try {
            await API.post('/api/v1/transactions/delete-transaction', { transactionId: id });
            message.success('Transaction deleted');
            fetchTransactions();
        } catch (error) {
            message.error('Failed to delete transaction');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Overview</Title>
                    <Typography.Text type="secondary">Welcome back, {user.name} 👋</Typography.Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Add Transaction
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Balance"
                            value={totalBalance}
                            precision={2}
                            valueStyle={{ color: totalBalance >= 0 ? '#3f8600' : '#cf1322' }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Income"
                            value={income}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Expenses"
                            value={expense}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Savings"
                            value={income - expense}
                            precision={2}
                            valueStyle={{ color: '#1677ff' }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Spending Analytics" bordered={false} style={{ height: '100%' }}>
                        <div style={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                {chartType === 'bar' ? (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="income" fill="#52c41a" name="Income" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" fill="#f5222d" name="Expenses" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : chartType === 'line' ? (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="income" stroke="#52c41a" strokeWidth={3} dot={{ r: 4 }} name="Income" />
                                        <Line type="monotone" dataKey="expense" stroke="#f5222d" strokeWidth={3} dot={{ r: 4 }} name="Expenses" />
                                    </LineChart>
                                ) : (
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f5222d" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#f5222d" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="income" stroke="#52c41a" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                                        <Area type="monotone" dataKey="expense" stroke="#f5222d" fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Recent Transactions" bordered={false} style={{ height: '100%' }}>
                        <Table
                            dataSource={transactions}
                            columns={columns}
                            pagination={{ pageSize: 5 }}
                            rowKey="_id"
                            loading={loading}
                            size="small"
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                </Col>
            </Row>

            <AddTransactionModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onAdd={fetchTransactions}
            />
        </div>
    );
};

export default Dashboard;
