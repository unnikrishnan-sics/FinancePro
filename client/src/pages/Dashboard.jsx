import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, message, theme, Tooltip, Space, Progress } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import API from '../utils/axios';
import AddTransactionModal from '../components/AddTransactionModal';
import { useTheme } from '../context/ThemeContext';

const { Title } = Typography;

const Dashboard = () => {
    const [user, setUser] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { token } = theme.useToken();
    const { chartType, darkMode } = useTheme();
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Stats
    const [totalBalance, setTotalBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [chartData, setChartData] = useState([]);

    // Health Score Stats
    const [healthScore, setHealthScore] = useState(0);
    const [scoreRating, setScoreRating] = useState('Poor');
    const [scoreColor, setScoreColor] = useState('#ff4d4f');
    const [scoreTips, setScoreTips] = useState('Analyzing data...');

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
            fetchDashboardData();
        }
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Trigger recurring check silently
            API.post('/api/v1/transactions/check-recurring', {}).catch(() => { });

            // Fetch transactions
            const txRes = await API.get('/api/v1/transactions/get-transactions');
            const txs = txRes.data;
            setTransactions(txs);

            // Fetch goals
            let goalsData = [];
            try {
                const goalsRes = await API.get('/api/v1/goals');
                goalsData = goalsRes.data;
                setGoals(goalsData);
            } catch (e) {
                console.error(e);
            }

            // Calculate stats
            const totalIncome = txs
                .filter(item => item.type === 'income')
                .reduce((acc, item) => acc + item.amount, 0);

            const totalExpense = txs
                .filter(item => item.type === 'expense')
                .reduce((acc, item) => acc + item.amount, 0);

            setIncome(totalIncome);
            setExpense(totalExpense);
            const currentBal = totalIncome - totalExpense;
            setTotalBalance(currentBal);

            calculateScore(currentBal, totalIncome, totalExpense, goalsData);
            prepareChartData(txs);
        } catch (error) {
            message.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const calculateScore = (bal, inc, exp, goalList) => {
        // 1. Savings Rate Score (Max 35 points)
        const savingsRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
        let savingsScore = 0;
        if (savingsRate >= 20) {
            savingsScore = 35;
        } else if (savingsRate > 0) {
            savingsScore = (savingsRate / 20) * 35;
        }

        // 2. Liquidity / Emergency Buffer Score (Max 35 points)
        const avgMonthlyExp = exp || 1; 
        const monthsCovered = bal > 0 ? bal / avgMonthlyExp : 0;
        let liquidityScore = 0;
        if (monthsCovered >= 3) {
            liquidityScore = 35;
        } else if (monthsCovered > 0) {
            liquidityScore = (monthsCovered / 3) * 35;
        }

        // 3. Goal Progress Score (Max 30 points)
        let goalScore = 15; // baseline of 15 if no goals
        if (goalList && goalList.length > 0) {
            const avgProgress = goalList.reduce((acc, g) => {
                const prog = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
                return acc + Math.min(100, prog);
            }, 0) / goalList.length;
            goalScore = (avgProgress / 100) * 30;
        }

        // Total
        const total = Math.round(savingsScore + liquidityScore + goalScore);
        setHealthScore(total);

        // Styling and recommendations
        if (total >= 80) {
            setScoreRating('Excellent');
            setScoreColor('#52c41a');
            setScoreTips('Fantastic balance! Your savings rate is strong and you have a solid emergency buffer. Consider long-term wealth investments for any extra surplus.');
        } else if (total >= 60) {
            setScoreRating('Good');
            setScoreColor('#1677ff');
            setScoreTips('Healthy financial standing. Focus on building and keeping your 3-month emergency fund safe, and continue contributing towards your savings goals.');
        } else if (total >= 40) {
            setScoreRating('Fair');
            setScoreColor('#faad14');
            setScoreTips('Modest standing. Try to reduce flexible, non-essential expenses like dining out or shopping to boost your monthly savings rate.');
        } else {
            setScoreRating('Poor');
            setScoreColor('#ff4d4f');
            setScoreTips('Action required: Your savings rate is negative or emergency buffer is critically low. Set strict budget limits and review recent transactions.');
        }
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
            amount: item.income - item.expense
        }));

        setChartData(cData.slice(-10)); // Show last 10 days
    };

    const handleEdit = (record) => {
        setEditingTransaction(record);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setEditingTransaction(null);
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
                    {record.type === 'expense' ? '-' : '+'} ₹{amount.toFixed(2)}
                </span>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit Transaction">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Transaction">
                        <Button
                            type="text"
                            danger
                            size="small"
                            onClick={() => handleDelete(record._id)}
                        >
                            Delete
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleDelete = async (id) => {
        try {
            await API.post('/api/v1/transactions/delete-transaction', { transactionId: id });
            message.success('Transaction deleted');
            fetchDashboardData();
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

            <Row gutter={[24, 24]}>
                {/* Left Side: Stats, Analytics Charts, and Transactions (span 16) */}
                <Col xs={24} lg={16}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <Statistic
                                    title="Total Balance"
                                    value={totalBalance}
                                    precision={2}
                                    valueStyle={{ color: totalBalance >= 0 ? '#3f8600' : '#cf1322', fontWeight: 700 }}
                                    prefix={<span style={{ marginRight: 4 }}>₹</span>}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <Statistic
                                    title="Income"
                                    value={income}
                                    precision={2}
                                    valueStyle={{ color: '#3f8600', fontWeight: 700 }}
                                    prefix={<ArrowUpOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <Statistic
                                    title="Expenses"
                                    value={expense}
                                    precision={2}
                                    valueStyle={{ color: '#cf1322', fontWeight: 700 }}
                                    prefix={<ArrowDownOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Spending Analytics" bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: 24 }}>
                        <div style={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                {chartType === 'bar' ? (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Bar dataKey="income" fill="#52c41a" name="Income" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" fill="#f5222d" name="Expenses" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : chartType === 'line' ? (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <RechartsTooltip />
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
                                        <RechartsTooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="income" stroke="#52c41a" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                                        <Area type="monotone" dataKey="expense" stroke="#f5222d" fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Recent Transactions" bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: 24 }}>
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

                {/* Right Side: Premium Financial Health Index Card (span 8) */}
                <Col xs={24} lg={8}>
                    <Card
                        title={<span style={{ fontWeight: 700, fontSize: 16 }}>Financial Health Index</span>}
                        bordered={false}
                        style={{
                            height: '100%',
                            borderRadius: 16,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                            background: darkMode ? 'rgba(28, 28, 30, 0.6)' : '#fff',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 0' }}>
                            <Progress
                                type="dashboard"
                                percent={healthScore}
                                strokeColor={scoreColor}
                                size={170}
                                strokeWidth={10}
                                format={percent => (
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 34, fontWeight: 800, color: scoreColor }}>{percent}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', textTransform: 'uppercase', marginTop: 4 }}>{scoreRating}</span>
                                    </div>
                                )}
                            />

                            <div style={{
                                marginTop: 24,
                                padding: '16px',
                                background: scoreColor + '12',
                                border: `1px solid ${scoreColor}28`,
                                borderRadius: 12,
                                textAlign: 'left',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                            }}>
                                <Typography.Text strong style={{ display: 'block', marginBottom: 6, color: scoreColor, fontSize: 14 }}>
                                    Status: {scoreRating}
                                </Typography.Text>
                                <Typography.Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6, display: 'block' }}>
                                    {scoreTips}
                                </Typography.Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <AddTransactionModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                onAdd={fetchDashboardData}
                editData={editingTransaction}
            />
        </div>
    );
};

export default Dashboard;
