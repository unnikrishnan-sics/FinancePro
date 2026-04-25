import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from 'antd';
import API from '../utils/axios';
import dayjs from 'dayjs';

const { Option } = Select;

const AddGoalModal = ({ visible, onClose, onAdd, editData }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (editData) {
                form.setFieldsValue({
                    ...editData,
                    deadline: editData.deadline ? dayjs(editData.deadline) : null
                });
            } else {
                form.resetFields();
            }
        }
    }, [editData, visible, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editData) {
                // Edit logic if needed
            } else {
                await API.post('/api/v1/goals', values);
                message.success('Goal created successfully');
            }
            form.resetFields();
            onAdd();
            onClose();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={editData ? "Edit Goal" : "Create New Goal"}
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            okText={editData ? "Update" : "Create"}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" initialValues={{ category: 'Savings' }}>
                <Form.Item
                    name="title"
                    label="Goal Title"
                    rules={[{ required: true, message: 'Please enter goal title' }]}
                >
                    <Input placeholder="e.g. New Laptop, Vacation" />
                </Form.Item>

                <Form.Item
                    name="targetAmount"
                    label="Target Amount (₹)"
                    rules={[{ required: true, message: 'Please enter target amount' }]}
                >
                    <InputNumber style={{ width: '100%' }} min={1} placeholder="Enter amount" />
                </Form.Item>


                <Form.Item
                    name="deadline"
                    label="Target Date (Optional)"
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddGoalModal;
