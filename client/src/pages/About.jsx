import React from 'react';
import { Typography, Row, Col, Card, Avatar } from 'antd';
import { UserOutlined, TeamOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const About = () => {
    return (
        <div style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <Title level={1}>About FinancePro</Title>
                <Paragraph style={{ fontSize: 18, color: '#64748b' }}>
                    Democratizing professional-grade financial tools for everyone.
                </Paragraph>
            </div>

            <Row gutter={[48, 48]} align="middle">
                <Col xs={24} md={12}>
                    <div style={{
                        height: 300,
                        background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                        borderRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <Title level={2} style={{ color: 'white', margin: 0 }}>Our Mission</Title>
                    </div>
                </Col>
                <Col xs={24} md={12}>
                    <Title level={3}>Driven by Innovation</Title>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                        We believe that financial freedom starts with financial awareness. Founded in 2024, our mission is to provide intuitive, powerful, and secure tools that empower individuals to take control of their financial future.
                    </Paragraph>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                        Our team of engineers and financial experts work tirelessly to build a platform that simplifies complex financial data into actionable insights.
                    </Paragraph>
                </Col>
            </Row>

            <div style={{ marginTop: 80 }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Our Core Values</Title>
                <Row gutter={[32, 32]}>
                    <Col xs={24} md={8}>
                        <Card style={{ textAlign: 'center', height: '100%', borderRadius: 12 }}>
                            <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', marginBottom: 16 }} />
                            <Title level={4}>User First</Title>
                            <Paragraph>We design every feature with the user's needs and experience in mind.</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card style={{ textAlign: 'center', height: '100%', borderRadius: 12 }}>
                            <Avatar size={64} icon={<TeamOutlined />} style={{ backgroundColor: '#d1fae5', color: '#10b981', marginBottom: 16 }} />
                            <Title level={4}>Transparency</Title>
                            <Paragraph>We believe in clear, honest communication about how our tools work.</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card style={{ textAlign: 'center', height: '100%', borderRadius: 12 }}>
                            <Avatar size={64} icon={<GlobalOutlined />} style={{ backgroundColor: '#fff7ed', color: '#f97316', marginBottom: 16 }} />
                            <Title level={4}>Inclusivity</Title>
                            <Paragraph>Financial tools should be accessible to everyone, everywhere.</Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default About;
