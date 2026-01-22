import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Space, Button, theme } from 'antd';

const { Title, Paragraph, Text } = Typography;

const LandingPage = () => {
    const navigate = useNavigate();
    const {
        token: { colorPrimary },
    } = theme.useToken();

    return (
        <>
            {/* Hero Section */}
            <div id="home" style={{ padding: '80px 24px', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, #f1f5f9 0%, transparent 50%)' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <Text
                        strong
                        style={{
                            color: colorPrimary,
                            background: '#e0e7ff',
                            padding: '6px 16px',
                            borderRadius: 20,
                            display: 'inline-block',
                            marginBottom: 24
                        }}
                    >
                        🚀 The standard for personal finance
                    </Text>
                    <Title level={1} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 24, lineHeight: 1.1 }}>
                        Manage your money with <br />
                        <span style={{
                            background: `linear-gradient(135deg, ${colorPrimary}, #0ea5e9)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>precision & clarity.</span>
                    </Title>
                    <Paragraph style={{ fontSize: 18, color: '#64748b', marginBottom: 40, maxWidth: 600, marginInline: 'auto' }}>
                        Experience the future of financial management. Automatic tracking, predictive analytics, and bank-grade security in one beautiful interface.
                    </Paragraph>
                    <Space size="large" wrap style={{ justifyContent: 'center' }}>
                        <Button type="primary" size="large" onClick={() => navigate('/register')} style={{ height: 50, padding: '0 32px', fontSize: 16 }}>
                            Start Your Journey
                        </Button>
                        <Button size="large" style={{ height: 50, padding: '0 32px', fontSize: 16 }}>
                            View Demo
                        </Button>
                    </Space>
                </div>
            </div>

        </>
    );
};

export default LandingPage;
