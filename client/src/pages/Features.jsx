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
                            desc="Interactive charts (Area, Bar, Pie) that make financial data easy to understand at a glance."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<TrendingUp size={32} color="#0ea5e9" />}
                            title="Predictive AI"
                            desc="Forecast future expenses using Linear Regression based on your historical spending habits."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<Shield size={32} color="#10b981" />}
                            title="Secure Authentication"
                            desc="JWT-based security with encrypted passwords and a secure 'Forgot Password' recovery flow."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<Smartphone size={32} color={colorPrimary} />}
                            title="Mobile Responsive"
                            desc="Access your dashboard anywhere with a fully responsive layout optimized for all devices."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<Globe size={32} color="orange" />}
                            title="Smart Recommendations"
                            desc="Get AI-driven advice like 'Super Saver' or 'Debt Warning' based on your saving habits."
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <FeatureCard
                            icon={<CreditCard size={32} color="purple" />}
                            title="Fully Customizable"
                            desc="Personalize your experience with Dark Mode, custom colors, and compact view options."
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
