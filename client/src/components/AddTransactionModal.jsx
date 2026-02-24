import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message, InputNumber, Checkbox, Divider, theme } from 'antd';
import API from '../utils/axios';
import dayjs from 'dayjs';

const { Option } = Select;

const AddTransactionModal = ({ visible, onClose, onAdd, editData = null }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const { token } = theme.useToken();

    useEffect(() => {
        if (editData && visible) {
            form.setFieldsValue({
                ...editData,
                date: dayjs(editData.date),
            });
            setIsRecurring(false); // Can't switch to recurring during edit (for now)
        } else {
            form.resetFields();
            setIsRecurring(false);
        }
    }, [editData, visible, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                date: values.date ? values.date.format('YYYY-MM-DD') : undefined
            };

            if (editData) {
                await API.post('/api/v1/transactions/edit-transaction', {
                    ...payload,
                    transactionId: editData._id
                });
                message.success('Transaction updated successfully');
            } else {
                const endpoint = isRecurring
                    ? '/api/v1/transactions/add-recurring'
                    : '/api/v1/transactions/add-transaction';

                await API.post(endpoint, payload);
                message.success(isRecurring ? 'Recurring transaction set up!' : 'Transaction added successfully');

                if (isRecurring) {
                    try {
                        await API.post('/api/v1/transactions/check-recurring', {});
                    } catch (e) { }
                }
            }

            form.resetFields();
            setIsRecurring(false);
            onAdd();
            onClose();
        } catch (error) {
            message.error(editData ? 'Failed to update transaction' : 'Failed to add transaction');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editData ? "Edit Transaction" : "Add New Transaction"}
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Select type' }]}>
                    <Select placeholder="Select type">
                        <Option value="income">Income</Option>
                        <Option value="expense">Expense</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Select category' }]}>
                    <Select placeholder="Select category">
                        <Option value="salary">Salary</Option>
                        <Option value="food">Food</Option>
                        <Option value="transport">Transport</Option>
                        <Option value="entertainment">Entertainment</Option>
                        <Option value="utilities">Utilities</Option>
                        <Option value="investment">Investment</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Enter amount' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} max={9999999999999} prefix="$" />
                </Form.Item>

                <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Select date' }]}>
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="description" label="Description">
                    <Input />
                </Form.Item>

                {!editData && (
                    <>
                        <Divider style={{ margin: '12px 0' }} />
                        <Form.Item name="isRecurring" valuePropName="checked">
                            <Checkbox onChange={e => setIsRecurring(e.target.checked)}>
                                This is a recurring transaction (Subscription, Rent, etc.)
                            </Checkbox>
                        </Form.Item>
                    </>
                )}

                {isRecurring && !editData && (
                    <div style={{ padding: '12px', background: token.colorFillAlter, borderRadius: '8px', marginBottom: '16px' }}>
                        <Form.Item
                            name="frequency"
                            label="Frequency"
                            rules={[{ required: isRecurring, message: 'Select frequency' }]}
                            initialValue="monthly"
                        >
                            <Select>
                                <Option value="monthly">Monthly</Option>
                                <Option value="yearly">Yearly</Option>
                            </Select>
                        </Form.Item>
                    </div>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        {editData ? 'Update Transaction' : (isRecurring ? 'Set Up Recurring Payment' : 'Add Transaction')}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddTransactionModal;
