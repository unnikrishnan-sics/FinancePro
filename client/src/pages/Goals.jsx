import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Progress, Typography, Button, message, Spin, Empty, Tag, Space, Tooltip, InputNumber, Modal } from 'antd';
import { PlusOutlined, AimOutlined, CalendarOutlined, DeleteOutlined, RocketOutlined, PlusCircleOutlined } from '@ant-design/icons';
import API from '../utils/axios';
import AddGoalModal from '../components/AddGoalModal';

const { Title, Text } = Typography;

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [contributionModalVisible, setContributionModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [contributionAmount, setContributionAmount] = useState(100);

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
