import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Progress, Typography, Button, message, Spin, Empty, Tag, Space, Tooltip, InputNumber, Modal, Radio, Select, theme } from 'antd';
import { PlusOutlined, AimOutlined, CalendarOutlined, DeleteOutlined, RocketOutlined, PlusCircleOutlined, LineChartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../utils/axios';
import AddGoalModal from '../components/AddGoalModal';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

const Goals = () => {
    const { token } = theme.useToken();
    const { darkMode } = useTheme();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [contributionModalVisible, setContributionModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [contributionAmount, setContributionAmount] = useState(100);

    // Simulation States
    const [simModalVisible, setSimModalVisible] = useState(false);
    const [simRiskProfile, setSimRiskProfile] = useState('medium');
    const [simMonthlySavings, setSimMonthlySavings] = useState(0);
    const [simSuccessRate, setSimSuccessRate] = useState(0);
    const [simPathData, setSimPathData] = useState([]);
    const [simLoading, setSimLoading] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/api/v1/goals');
            setGoals(data);
        } catch (error) {
            message.error('Failed to fetch goals');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSimulation = (goal) => {
        setSelectedGoal(goal);
        
        // Calculate recommended savings
        const deadlineDate = goal.deadline ? new Date(goal.deadline) : new Date();
        const now = new Date();
        const months = Math.max(1, Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24 * 30.41)));
        const remaining = goal.targetAmount - goal.currentAmount;
        const recommendedMonthly = Math.max(0, Math.ceil(remaining / months));
        
        setSimMonthlySavings(recommendedMonthly);
        setSimRiskProfile('medium');
        setSimModalVisible(true);
        
        // Run initial simulation
        setTimeout(() => {
            runMonteCarlo(goal, recommendedMonthly, 'medium');
        }, 50);
    };

    const runMonteCarlo = (goal, monthlySavings, riskProfile) => {
        setSimLoading(true);

        const target = goal.targetAmount;
        const current = goal.currentAmount;
        
        const deadlineDate = goal.deadline ? new Date(goal.deadline) : new Date();
        const now = new Date();
        let months = Math.max(1, Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24 * 30.41)));
        if (months > 120) months = 120; // Cap at 10 years to prevent performance lag
        
        let mu = 0;
        let sigma = 0;
        
        if (riskProfile === 'low') {
            mu = 0.05 / 12; // 5% annual
            sigma = 0.04 / Math.sqrt(12); // 4% annual volatility
        } else if (riskProfile === 'high') {
            mu = 0.12 / 12; // 12% annual
            sigma = 0.22 / Math.sqrt(12); // 22% annual volatility
        } else { // medium
            mu = 0.08 / 12; // 8% annual
            sigma = 0.12 / Math.sqrt(12); // 12% annual volatility
        }

        const NUM_TRIALS = 1000;
        const allPaths = [];
        const pathTracers = [];

        for (let t = 0; t < NUM_TRIALS; t++) {
            let val = current;
            const singlePath = [val];
            for (let m = 1; m <= months; m++) {
                // Box-Muller standard normal
                const u1 = Math.random() || 0.0001;
                const u2 = Math.random();
                const Z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                
                const r = mu + sigma * Z;
                val = (val + monthlySavings) * (1 + r);
                singlePath.push(Math.max(0, val));
            }
            allPaths.push(val);
            pathTracers.push(singlePath);
        }

        const successCount = allPaths.filter(v => v >= target).length;
        const rate = Math.round((successCount / NUM_TRIALS) * 100);
        setSimSuccessRate(rate);

        const formattedChartData = [];
        for (let m = 0; m <= months; m++) {
            const valuesAtMonth = pathTracers.map(path => path[m]).sort((a, b) => a - b);
            
            const worstIdx = Math.floor(NUM_TRIALS * 0.1);
            const medianIdx = Math.floor(NUM_TRIALS * 0.5);
            const bestIdx = Math.floor(NUM_TRIALS * 0.9);

            formattedChartData.push({
                month: `M${m}`,
                'Worst Case': Math.round(valuesAtMonth[worstIdx]),
                'Median Case': Math.round(valuesAtMonth[medianIdx]),
                'Best Case': Math.round(valuesAtMonth[bestIdx]),
                'Target': target
            });
        }
        
        setSimPathData(formattedChartData);
        setSimLoading(false);
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/api/v1/goals/${id}`);
            message.success('Goal removed');
            fetchGoals();
        } catch (error) {
            message.error('Failed to remove goal');
        }
    };

    const handleAddContribution = async () => {
        if (!contributionAmount || contributionAmount <= 0) {
            return message.warning('Please enter a valid amount');
        }

        try {
            await API.post('/api/v1/goals/contribution', {
                goalId: selectedGoal._id,
                amount: contributionAmount
            });
            message.success(`Added ₹${contributionAmount} to ${selectedGoal.title}`);
            setContributionModalVisible(false);
            setContributionAmount(100);
            fetchGoals();
        } catch (error) {
            message.error('Failed to add contribution');
        }
    };

    if (loading && goals.length === 0) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Savings Goals</Title>
                    <Text type="secondary">Turn your dreams into financial milestones</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
                    New Goal
                </Button>
            </div>

            {goals.length === 0 ? (
                <Card>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No goals found. Start by creating one!"
                    >
                        <Button type="primary" onClick={() => setIsAddModalVisible(true)}>Create Goal</Button>
                    </Empty>
                </Card>
            ) : (
                <Row gutter={[24, 24]}>
                    {goals.map(goal => {
                        const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                        const isCompleted = goal.status === 'completed' || percent >= 100;

                        return (
                            <Col xs={24} md={12} lg={8} key={goal._id}>
                                <Card
                                    hoverable
                                    variant="borderless"
                                    style={{
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        borderTop: `4px solid ${isCompleted ? '#52c41a' : '#1677ff'}`
                                    }}
                                    actions={[
                                        <Tooltip title="Add Money">
                                            <PlusCircleOutlined key="add" onClick={() => { setSelectedGoal(goal); setContributionModalVisible(true); }} style={{ fontSize: 18, color: '#1677ff' }} />
                                        </Tooltip>,
                                        <Tooltip title="Stochastic Simulation (Predict)">
                                            <LineChartOutlined key="simulate" onClick={() => handleOpenSimulation(goal)} style={{ fontSize: 18, color: '#faad14' }} />
                                        </Tooltip>,
                                        <Tooltip title="Delete Goal">
                                            <DeleteOutlined key="delete" onClick={() => handleDelete(goal._id)} style={{ fontSize: 18, color: '#ff4d4f' }} />
                                        </Tooltip>
                                    ]}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <Space orientation="vertical" size={0}>
                                            <Title level={4} style={{ margin: 0 }}>{goal.title}</Title>
                                        </Space>
                                        <div style={{ textAlign: 'right' }}>
                                            <Text strong style={{ fontSize: 18 }}>₹{goal.currentAmount.toLocaleString()}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 12 }}>of ₹{goal.targetAmount.toLocaleString()}</Text>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 24 }}>
                                        <Progress
                                            percent={percent}
                                            status={isCompleted ? 'success' : 'active'}
                                            strokeColor={isCompleted ? '#52c41a' : {
                                                '0%': '#1677ff',
                                                '100%': '#52c41a',
                                            }}
                                            size={{ strokeWidth: 12 }}
                                        />
                                    </div>

                                    {/* AI Savings Plan */}
                                    {!isCompleted && goal.deadline && (
                                        <div style={{
                                            background: '#f0f7ff',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            marginBottom: '16px',
                                            border: '1px dashed #1677ff'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <RocketOutlined style={{ color: '#1677ff' }} />
                                                <Text strong style={{ fontSize: 12, color: '#1677ff' }}>AI SAVINGS PLAN</Text>
                                            </div>
                                            {(() => {
                                                const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                                                if (daysRemaining <= 0) return <Text type="danger" size="small">Deadline passed or today!</Text>;

                                                const remainingAmount = goal.targetAmount - goal.currentAmount;
                                                const daily = remainingAmount / daysRemaining;
                                                const monthly = remainingAmount / (daysRemaining / 30);

                                                return (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <Text style={{ fontSize: 13 }}>Save <Text strong>₹{Math.ceil(daily).toLocaleString()}</Text> daily</Text>
                                                        {daysRemaining > 30 && (
                                                            <Text style={{ fontSize: 13 }}>Or <Text strong>₹{Math.ceil(monthly).toLocaleString()}</Text> per month</Text>
                                                        )}
                                                        <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                                                            {daysRemaining > 30 
                                                                ? `To reach your goal in ${Math.floor(daysRemaining / 30)} months and ${daysRemaining % 30} days`
                                                                : `Target reached in just ${daysRemaining} days if you start today!`}
                                                        </Text>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Space>
                                            <AimOutlined style={{ color: '#888', fontSize: 14 }} />
                                            <Text type="secondary">Remaining: ₹{(goal.targetAmount - goal.currentAmount).toLocaleString()}</Text>
                                        </Space>
                                        {goal.deadline && (
                                            <Space>
                                                <CalendarOutlined style={{ color: '#888', fontSize: 14 }} />
                                                <Text type="secondary">{new Date(goal.deadline).toLocaleDateString()}</Text>
                                            </Space>
                                        )}
                                    </div>

                                    {isCompleted && (
                                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                                            <Tag color="success" icon={<RocketOutlined style={{ fontSize: 12 }} />} style={{ padding: '4px 12px' }}>GOAL REACHED!</Tag>
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            <Modal
                title={`Stochastic Goal Market Simulator: ${selectedGoal?.title}`}
                open={simModalVisible}
                onCancel={() => setSimModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setSimModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={850}
                styles={{ body: { padding: '20px 0' } }}
            >
                {selectedGoal && (
                    <Row gutter={[24, 24]} style={{ padding: '0 10px' }}>
                        {/* Simulation controls (Left Column) */}
                        <Col xs={24} md={10}>
                            <Card title="Simulation Parameters" size="small" bordered={false} style={{ background: '#f8fafc', borderRadius: 12 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div>
                                        <Text type="secondary" style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Goal Target</Text>
                                        <Text strong style={{ fontSize: 16 }}>₹{selectedGoal.targetAmount.toLocaleString()}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Current Balance</Text>
                                        <Text strong style={{ fontSize: 16 }}>₹{selectedGoal.currentAmount.toLocaleString()}</Text>
                                    </div>
                                    
                                    <div>
                                        <Text type="secondary" style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Monthly Contribution (₹)</Text>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={0}
                                            value={simMonthlySavings}
                                            onChange={(val) => {
                                                setSimMonthlySavings(val || 0);
                                                runMonteCarlo(selectedGoal, val || 0, simRiskProfile);
                                            }}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                                        />
                                    </div>

                                    <div>
                                        <Text type="secondary" style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Market Asset Risk Profile</Text>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={simRiskProfile}
                                            onChange={(val) => {
                                                setSimRiskProfile(val);
                                                runMonteCarlo(selectedGoal, simMonthlySavings, val);
                                            }}
                                            options={[
                                                { value: 'low', label: 'Low Risk (Bonds/FDs - ~5% CAGR)' },
                                                { value: 'medium', label: 'Medium Risk (Balanced - ~8% CAGR)' },
                                                { value: 'high', label: 'High Risk (Equities - ~12% CAGR)' }
                                            ]}
                                        />
                                    </div>
                                    
                                    <Button 
                                        type="primary" 
                                        onClick={() => runMonteCarlo(selectedGoal, simMonthlySavings, simRiskProfile)} 
                                        loading={simLoading}
                                        block
                                    >
                                        Recalculate Simulation
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                        
                        {/* Simulation results (Right Column) */}
                        <Col xs={24} md={14}>
                            {simLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                                    <Spin size="large" tip="Running 1,000 Stochastic Trials..." />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Progress
                                                type="circle"
                                                percent={simSuccessRate}
                                                strokeColor={simSuccessRate >= 80 ? '#52c41a' : simSuccessRate >= 50 ? '#1890ff' : '#ff4d4f'}
                                                width={110}
                                                strokeWidth={8}
                                            />
                                            <Text strong style={{ display: 'block', marginTop: 8 }}>Success Probability</Text>
                                        </div>
                                        <div style={{ maxWidth: 220 }}>
                                            <Title level={5} style={{ margin: 0 }}>Simulation Summary</Title>
                                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 8, lineHeight: 1.5 }}>
                                                {simSuccessRate >= 80 ? 
                                                    `Excellent! There is a very high probability (${simSuccessRate}%) that your regular monthly savings will comfortably achieve your target.` :
                                                    simSuccessRate >= 50 ? 
                                                    `Moderate likelihood (${simSuccessRate}%). Consider increasing your monthly contributions slightly to improve your target certainty.` :
                                                    `High shortfall risk (${simSuccessRate}%). We strongly advise boosting monthly savings or extending your timeline to secure success.`
                                                }
                                            </Text>
                                        </div>
                                    </div>

                                    <div>
                                        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>Stochastic Pathway Forecast (Monthly)</Text>
                                        <div style={{ width: '100%', height: 200 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={simPathData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="month" style={{ fontSize: 11 }} />
                                                    <YAxis style={{ fontSize: 11 }} />
                                                    <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                                    <Line type="monotone" dataKey="Best Case" stroke="#52c41a" strokeDasharray="3 3" dot={false} />
                                                    <Line type="monotone" dataKey="Median Case" stroke="#1890ff" strokeWidth={2} dot={false} />
                                                    <Line type="monotone" dataKey="Worst Case" stroke="#ff4d4f" strokeDasharray="3 3" dot={false} />
                                                    <Line type="monotone" dataKey="Target" stroke="#8c8c8c" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Col>

                        {/* Explanation section for CAGR & Stochastic Simulator */}
                        <Col xs={24}>
                            <Card 
                                size="small" 
                                bordered={false} 
                                style={{ 
                                    background: darkMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', 
                                    borderRadius: 12,
                                    border: darkMode ? '1px solid #334155' : '1px solid #bae6fd',
                                    marginTop: 16
                                }}
                            >
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 8 }}>
                                    <InfoCircleOutlined style={{ color: darkMode ? '#38bdf8' : '#0284c7', fontSize: 20, marginTop: 2 }} />
                                    <div>
                                        <Title level={5} style={{ margin: 0, color: darkMode ? '#38bdf8' : '#0369a1' }}>
                                            Understanding the Analytics: CAGR & Stochastic Simulations
                                        </Title>
                                        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                                            <Col xs={24} sm={12}>
                                                <Text strong style={{ color: darkMode ? '#38bdf8' : '#0369a1', display: 'block', marginBottom: 4 }}>
                                                    📈 What is CAGR?
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 13, display: 'block', lineHeight: 1.5, color: darkMode ? '#94a3b8' : '#334155' }}>
                                                    <strong>Compound Annual Growth Rate (CAGR)</strong> is the average annual rate at which your savings grow, factoring in <strong>compounding</strong> (earning interest on your previous interest). For instance, a <strong>12% CAGR</strong> means your portfolio grows by an average of 12% a year. While real markets fluctuate month-to-month, CAGR represents the smoothed, average growth baseline.
                                                </Text>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Text strong style={{ color: darkMode ? '#38bdf8' : '#0369a1', display: 'block', marginBottom: 4 }}>
                                                    🎲 How the Stochastic Simulator Works
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 13, display: 'block', lineHeight: 1.5, color: darkMode ? '#94a3b8' : '#334155' }}>
                                                    Instead of assuming a straight-line constant return, our model runs <strong>1,000 independent virtual future scenarios</strong>. Every month, we inject randomized market booms, corrections, and crashes using a mathematical tool called the <strong>Box-Muller transform</strong>, which perfectly replicates real-world asset volatility.
                                                </Text>
                                            </Col>
                                            <Col xs={24}>
                                                <div style={{ borderTop: darkMode ? '1px dashed #334155' : '1px dashed #bae6fd', paddingTop: 8, marginTop: 4 }}>
                                                    <Text style={{ fontSize: 12, color: darkMode ? '#38bdf8' : '#0369a1' }}>
                                                        💡 <strong>How to read the lines:</strong> The <strong>Worst Case (10th percentile)</strong> represents a severe market downturn (90% of trials performed better). The <strong>Median Case (50th percentile)</strong> is the most typical and likely average path. The <strong>Best Case (90th percentile)</strong> represents a highly favorable market bull run. The <strong>Success Probability</strong> is the percentage of the 1,000 runs that successfully reached or exceeded your target goal.
                                                    </Text>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Modal>

            <AddGoalModal
                visible={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
                onAdd={fetchGoals}
            />

            <Modal
                title={`Add Money to: ${selectedGoal?.title}`}
                open={contributionModalVisible}
                onOk={handleAddContribution}
                onCancel={() => setContributionModalVisible(false)}
                okText="Add Contribution"
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>How much would you like to contribute today?</Text>
                    <InputNumber
                        size="large"
                        style={{ width: 200 }}
                        min={1}
                        value={contributionAmount}
                        onChange={setContributionAmount}
                        prefix="₹"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Goals;
