import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Typography, Tag, message, Tabs, Switch, InputNumber, Timeline, Progress, Space, Alert, Popconfirm, Select } from 'antd';
import { 
    DashboardOutlined, 
    SettingOutlined, 
    HistoryOutlined, 
    SlidersOutlined, 
    LineChartOutlined, 
    RobotOutlined, 
    ToolOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    GlobalOutlined,
    FireOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import API from '../utils/axios';
import { useTheme } from '../context/ThemeContext';

const { Title, Text, Paragraph } = Typography;

const AdminSystemControl = () => {
    const { darkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('1');
    const [loading, setLoading] = useState(false);

    // Cohort Stats
    const [cohortData, setCohortData] = useState({
        averageHealthScore: 0,
        cohortDistribution: { Excellent: 0, Good: 0, Fair: 0, Poor: 0 },
        activeUsersCount: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        stressTestResults: { baseline: 100, inflationShock: 80, marketCrash: 70, perfectStorm: 50 }
    });

    // Config State
    const [config, setConfig] = useState({
        maintenanceMode: false,
        disableAiAdvisor: false,
        globalHighValueThreshold: 2000,
        maxDailyTransactionCount: 50
    });
    const [configLoading, setConfigLoading] = useState(false);

    // Audit Trail State
    const [auditLogs, setAuditLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => {
        fetchCohortAnalytics();
        fetchSystemConfig();
        fetchAuditLogs();
    }, []);

    const fetchCohortAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/api/v1/admin/cohort-analytics');
            setCohortData(data);
        } catch (error) {
            message.error('Failed to fetch cohort analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemConfig = async () => {
        setConfigLoading(true);
        try {
            const { data } = await API.get('/api/v1/admin/config');
            setConfig(data);
        } catch (error) {
            message.error('Failed to load system configuration');
        } finally {
            setConfigLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        setLogsLoading(true);
        try {
            const { data } = await API.get('/api/v1/admin/audit-logs');
            setAuditLogs(data);
        } catch (error) {
            message.error('Failed to load system audit trail');
        } finally {
            setLogsLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        setConfigLoading(true);
        try {
            const { data } = await API.put('/api/v1/admin/config', config);
            message.success(data.message);
            fetchAuditLogs(); // Refresh trail
        } catch (error) {
            message.error('Failed to save configurations');
        } finally {
            setConfigLoading(false);
        }
    };

    // Prepare chart data for stress test (Simplified for users)
    const stressChartData = [
        { name: 'Sunny Days ☀️', success: cohortData.stressTestResults.baseline, fill: '#52c41a' },
        { name: 'High Prices 🌧️', success: cohortData.stressTestResults.inflationShock, fill: '#1677ff' },
        { name: 'Market Slump ⛈️', success: cohortData.stressTestResults.marketCrash, fill: '#faad14' },
        { name: 'Perfect Storm 🌪️', success: cohortData.stressTestResults.perfectStorm, fill: '#f5222d' }
    ];

    const getActionTagColor = (action) => {
        switch (action) {
            case 'DELETE_USER': return 'red';
            case 'BLOCK_USER': return 'volcano';
            case 'UNBLOCK_USER': return 'green';
            case 'CHANGE_ROLE': return 'blue';
            case 'UPDATE_SYSTEM_SETTINGS': return 'orange';
            default: return 'default';
        }
    };

    const getHealthColor = (score) => {
        if (score >= 80) return '#52c41a';
        if (score >= 60) return '#1677ff';
        if (score >= 40) return '#faad14';
        return '#f5222d';
    };

    const getHealthRating = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>System Management & Macro Analytics</Title>
                <Text type="secondary">Run system-wide stress tests, manage global toggles, and review secure administrative security logs</Text>
            </div>

            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                style={{ marginBottom: 24 }}
                items={[
                    {
                        key: '1',
                        label: (
                            <span>
                                <LineChartOutlined /> Cohort Macro Analytics & Stress-Test
                            </span>
                        ),
                        children: (
                            <div>
                                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                                    {/* Average Cohort Score */}
                                    <Col xs={24} md={10}>
                                        <Card title="Cohort Financial Health Rating" variant="borderless" style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
                                                <Progress
                                                    type="circle"
                                                    percent={cohortData.averageHealthScore}
                                                    strokeColor={getHealthColor(cohortData.averageHealthScore)}
                                                    strokeWidth={10}
                                                    width={150}
                                                    format={percent => (
                                                        <div>
                                                            <div style={{ fontSize: 28, fontWeight: 700, color: getHealthColor(percent) }}>{percent}</div>
                                                            <div style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 500 }}>Avg Index</div>
                                                        </div>
                                                    )}
                                                />
                                                <Tag 
                                                    color={getHealthColor(cohortData.averageHealthScore)} 
                                                    style={{ marginTop: 20, fontSize: 14, padding: '4px 16px', borderRadius: 20, fontWeight: 600 }}
                                                >
                                                    SYSTEM STATUS: {getHealthRating(cohortData.averageHealthScore).toUpperCase()}
                                                </Tag>
                                                <Paragraph type="secondary" style={{ textAlign: 'center', fontSize: 12, marginTop: 16, maxWidth: 300 }}>
                                                    This represents the weighted average financial standing computed across all registered standard user portfolios, combining savings rates, liquidity reserve ratios, and milestone achievements.
                                                </Paragraph>
                                            </div>
                                        </Card>
                                    </Col>

                                    {/* System Outflow Distribution */}
                                    <Col xs={24} md={14}>
                                        <Card title="Platform Cohort Composition" variant="borderless" style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                            <Row gutter={[16, 16]}>
                                                <Col xs={12} sm={6}>
                                                    <Card size="small" style={{ textAlign: 'center', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
                                                        <Statistic title="Excellent (80+)" value={cohortData.cohortDistribution.Excellent} valueStyle={{ color: '#52c41a', fontWeight: 700 }} />
                                                    </Card>
                                                </Col>
                                                <Col xs={12} sm={6}>
                                                    <Card size="small" style={{ textAlign: 'center', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 8 }}>
                                                        <Statistic title="Good (60-79)" value={cohortData.cohortDistribution.Good} valueStyle={{ color: '#1677ff', fontWeight: 700 }} />
                                                    </Card>
                                                </Col>
                                                <Col xs={12} sm={6}>
                                                    <Card size="small" style={{ textAlign: 'center', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                                                        <Statistic title="Fair (40-59)" value={cohortData.cohortDistribution.Fair} valueStyle={{ color: '#faad14', fontWeight: 700 }} />
                                                    </Card>
                                                </Col>
                                                <Col xs={12} sm={6}>
                                                    <Card size="small" style={{ textAlign: 'center', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 8 }}>
                                                        <Statistic title="Poor (<40)" value={cohortData.cohortDistribution.Poor} valueStyle={{ color: '#f5222d', fontWeight: 700 }} />
                                                    </Card>
                                                </Col>
                                            </Row>
                                            
                                            <div style={{ marginTop: 24, padding: '16px', background: darkMode ? '#1c1c1e' : '#f8fafc', borderRadius: 12 }}>
                                                <Title level={5} style={{ margin: 0, fontSize: 14 }}>Cohort Milestone Aggregation</Title>
                                                <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                                                    <Col xs={12}>
                                                        <Text type="secondary">Total Target Milestones:</Text>
                                                        <Title level={4} style={{ margin: '4px 0 0 0', fontWeight: 700 }}>₹{cohortData.totalTargetAmount.toLocaleString()}</Title>
                                                    </Col>
                                                    <Col xs={12}>
                                                        <Text type="secondary">Total Saved Funds:</Text>
                                                        <Title level={4} style={{ margin: '4px 0 0 0', color: '#52c41a', fontWeight: 700 }}>₹{cohortData.totalCurrentAmount.toLocaleString()}</Title>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Stress testing panel */}
                                <Card 
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <GlobalOutlined style={{ color: '#1677ff' }} />
                                            <span>☀️ Economic Weather Simulator: Will your users hit their goals?</span>
                                        </div>
                                    } 
                                    variant="borderless"
                                    style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                                    extra={
                                        <Button type="primary" icon={<SlidersOutlined />} onClick={fetchCohortAnalytics} loading={loading} style={{ background: '#1677ff' }}>
                                            Simulate Economic Shocks
                                        </Button>
                                    }
                                >
                                    <Row gutter={[24, 24]}>
                                        <Col xs={24} md={14}>
                                            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                                As an administrator, you can simulate different "economic weather" conditions to see how they impact your users' chances of reaching their saving milestones!
                                            </Text>
                                            <div style={{ width: '100%', height: 250 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stressChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" style={{ fontSize: 11 }} />
                                                        <YAxis label={{ value: 'Projected Goals Met (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11, textAnchor: 'middle' } }} style={{ fontSize: 11 }} />
                                                        <RechartsTooltip formatter={(value) => `${value}% of Goals Met`} />
                                                        <Bar dataKey="success" radius={[8, 8, 0, 0]}>
                                                            {stressChartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Col>
                                        
                                        <Col xs={24} md={10} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <Alert
                                                message="☀️ Scenario 1: Sunny Days (Normal Economy)"
                                                description={`Everything is going smoothly! Standard yields are earning average interest. Success chance: ${cohortData.stressTestResults.baseline}% of user goals will be achieved!`}
                                                type="success"
                                                showIcon
                                            />
                                            <Alert
                                                message="🌧️ Scenario 2: High Prices (Inflation Spike)"
                                                description={`Living expenses rise by 15% system-wide, leaving users with less money to save. Milestone success chance drops to ${cohortData.stressTestResults.inflationShock}%.`}
                                                type="info"
                                                showIcon
                                            />
                                            <Alert
                                                message="⛈️ Scenario 3: Market Slump (Stock Market Slowdown)"
                                                description={`The stock market hits a bear run, lowering interest yields. Milestone success chance is at ${cohortData.stressTestResults.marketCrash}%.`}
                                                type="warning"
                                                showIcon
                                            />
                                            <Alert
                                                message="🌪️ Scenario 4: Perfect Storm (Combined Crisis)"
                                                description={`High prices spike combined with a stock market dip. Milestone success chance plunges to ${cohortData.stressTestResults.perfectStorm}%.`}
                                                type="error"
                                                showIcon
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </div>
                        )
                    },
                    {
                        key: '2',
                        label: (
                            <span>
                                <SlidersOutlined /> Dynamic Platform Configurations
                            </span>
                        ),
                        children: (
                            <Card 
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <ToolOutlined style={{ color: '#1677ff' }} />
                                        <span>Global Feature Configurations & Limits</span>
                                    </div>
                                }
                                variant="borderless"
                                style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                                loading={configLoading}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 650, margin: '10px 0' }}>
                                    {/* Maintenance Lock */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: `1px solid ${darkMode ? '#2c2c2e' : '#f0f0f0'}` }}>
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>🚨 Platform Maintenance Override Lock</Title>
                                            <Text type="secondary" style={{ fontSize: 13 }}>Standard user access to database, transactions, and overview dashboards is suspended immediately. Only administrators can login.</Text>
                                        </div>
                                        <Switch 
                                            checked={config.maintenanceMode} 
                                            onChange={(checked) => setConfig(prev => ({ ...prev, maintenanceMode: checked }))} 
                                            style={{ marginLeft: 20 }}
                                        />
                                    </div>

                                    {/* AI Advisor Toggle */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: `1px solid ${darkMode ? '#2c2c2e' : '#f0f0f0'}` }}>
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>🤖 Toggle AI Advisor (Gemini Chatbot)</Title>
                                            <Text type="secondary" style={{ fontSize: 13 }}>Temporarily disable context-aware chat advisor proxies globally. Chatbot sidebar bubbles are locked with an active warning alert.</Text>
                                        </div>
                                        <Switch 
                                            checked={config.disableAiAdvisor} 
                                            onChange={(checked) => setConfig(prev => ({ ...prev, disableAiAdvisor: checked }))} 
                                            style={{ marginLeft: 20 }}
                                        />
                                    </div>

                                    {/* Global alert threshold */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: `1px solid ${darkMode ? '#2c2c2e' : '#f0f0f0'}` }}>
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>💰 Default High-Value Spending Alert (₹)</Title>
                                            <Text type="secondary" style={{ fontSize: 13 }}>System default alert threshold. Any transaction exceeding this limit prompts a high-spending warning notification for users lacking customized limits.</Text>
                                        </div>
                                        <InputNumber 
                                            style={{ width: 150 }}
                                            min={100}
                                            value={config.globalHighValueThreshold}
                                            onChange={(val) => setConfig(prev => ({ ...prev, globalHighValueThreshold: val || 2000 }))}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                                        />
                                    </div>

                                    {/* Rate limiting transaction counts */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: `1px solid ${darkMode ? '#2c2c2e' : '#f0f0f0'}` }}>
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>⚡ Max Daily Transactions Limit Cap</Title>
                                            <Text type="secondary" style={{ fontSize: 13 }}>Rate limiting protection. Suspends user ledger postings if transactions logged in a single day exceed this value (prevents script spamming).</Text>
                                        </div>
                                        <InputNumber 
                                            style={{ width: 150 }}
                                            min={5}
                                            max={200}
                                            value={config.maxDailyTransactionCount}
                                            onChange={(val) => setConfig(prev => ({ ...prev, maxDailyTransactionCount: val || 50 }))}
                                        />
                                    </div>

                                    <div style={{ marginTop: 8 }}>
                                        <Popconfirm
                                            title="Confirm System Configurations Change?"
                                            description="Are you sure you want to write these settings? Changes are applied globally and recorded in the audit trail logs."
                                            onConfirm={handleSaveConfig}
                                            okText="Yes, Save Config"
                                            cancelText="Cancel"
                                        >
                                            <Button type="primary" size="large" icon={<SettingOutlined />} loading={configLoading}>
                                                Apply Global Configurations
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            </Card>
                        )
                    },
                    {
                        key: '3',
                        label: (
                            <span>
                                <HistoryOutlined /> Chronological System Audit Trail
                            </span>
                        ),
                        children: (
                            <Card 
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <HistoryOutlined style={{ color: '#fa8c16' }} />
                                        <span>Secure Administrative Security Logs</span>
                                    </div>
                                }
                                variant="borderless"
                                style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                                extra={
                                    <Button type="dashed" onClick={fetchAuditLogs} loading={logsLoading} icon={<HistoryOutlined />}>
                                        Refresh Security Trail
                                    </Button>
                                }
                            >
                                <div style={{ padding: '10px 0' }}>
                                    {auditLogs.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <Text type="secondary">No system interventions or configuration modifications have been logged yet.</Text>
                                        </div>
                                    ) : (
                                        <Timeline 
                                            mode="left"
                                            loading={logsLoading}
                                            items={auditLogs.map((log, idx) => ({
                                                color: log.action.includes('DELETE') ? 'red' : log.action.includes('BLOCK') ? 'volcano' : log.action.includes('ROLE') ? 'blue' : 'orange',
                                                label: <Text type="secondary" style={{ fontSize: 12 }}>{new Date(log.timestamp).toLocaleString()}</Text>,
                                                children: (
                                                    <div style={{ paddingBottom: 16 }}>
                                                        <Space size={8} style={{ marginBottom: 4 }}>
                                                            <Tag color={getActionTagColor(log.action)} style={{ fontWeight: 600 }}>{log.action}</Tag>
                                                            <Text strong style={{ fontSize: 13 }}>Admin: {log.adminName}</Text>
                                                        </Space>
                                                        <div>
                                                            <Text style={{ fontSize: 13, color: darkMode ? '#c9d1d9' : '#333' }}>{log.details}</Text>
                                                        </div>
                                                        {log.targetUserName && (
                                                            <div style={{ marginTop: 4 }}>
                                                                <Text type="secondary" style={{ fontSize: 11 }}>Target Account: {log.targetUserName} (ID: {log.targetUserId})</Text>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            }))}
                                        />
                                    )}
                                </div>
                            </Card>
                        )
                    }
                ]}
            />
        </div>
    );
};

export default AdminSystemControl;
