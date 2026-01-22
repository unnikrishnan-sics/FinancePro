import React from 'react';
import { Typography, Row, Col, Card, theme } from 'antd';
import { PieChart, TrendingUp, Shield, Smartphone, Globe, CreditCard } from 'lucide-react';

const { Title, Paragraph } = Typography;

const Features = () => {
    const {
        token: { colorPrimary },
    } = theme.useToken();

    return (
        <div style={{ padding: '80px 24px', background: '#fff' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <Title level={1}>Powerful Features</Title>
                    <Paragraph style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
                        Everything you need to take control of your financial life, all in one place.
                    </Paragraph>
                </div>

                <Row gutter={[32, 32]}>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<PieChart size={32} color={colorPrimary} />}
                            title="Visual Analytics"
                            desc="Interactive charts that make complex financial data easy to understand at a glance."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<TrendingUp size={32} color="#0ea5e9" />}
                            title="Predictive AI"
                            desc="Forecast future expenses and income trends based on your historical data."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<Shield size={32} color="#10b981" />}
                            title="Bank-Grade Security"
                            desc="Your data is encrypted with 256-bit AES protection. We prioritize your privacy."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<Smartphone size={32} color={colorPrimary} />}
                            title="Mobile First"
                            desc="Manage your finances on the go with our fully responsive mobile design."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<Globe size={32} color="orange" />}
                            title="Multi-Currency"
                            desc="Support for multiple currencies and real-time exchange rate conversion."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<CreditCard size={32} color="purple" />}
                            title="Smart Budgeting"
                            desc="Set smart budgets for different categories and get alerted when you're close to limits."
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <Card hoverable style={{ height: '100%', borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: 24, background: '#f8fafc', width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <Title level={4} style={{ marginBottom: 12 }}>{title}</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>{desc}</Paragraph>
    </Card>
);

export default Features;
