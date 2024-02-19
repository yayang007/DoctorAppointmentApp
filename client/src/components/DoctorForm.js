import React from 'react'
import { Form, Col, Row, Input, TimePicker, Button } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import dayjs from "dayjs";



function DoctorForm({ onFinish, initialValues }) {
    return (
        <Form layout="vertical" onFinish={onFinish} initialValues={{
            ...initialValues,
            ...(initialValues && {
                timings: [
                    dayjs(initialValues?.timings[0], "HH:mm"),
                    dayjs(initialValues?.timings[1], "HH:mm")
                ]
            })
        }}>
            <h1 className="card-title mt=3">Personal Information</h1>
            <Row gutter={20}>
                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="First Name" name="firstName" rules={[{ required: true }]}>
                        <Input placeholder="First Name" />
                    </FormItem>
                </Col>

                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="Last Name" name="lastName" rules={[{ required: true }]}>
                        <Input placeholder="Last Name" />
                    </FormItem>
                </Col>

                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="Phone Number" name="phoneNumber" rules={[{ required: true }]}>
                        <Input placeholder="Phone Number" />
                    </FormItem>
                </Col>

                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="Website" name="website" rules={[{ required: true }]}>
                        <Input placeholder="Website" />
                    </FormItem>
                </Col>

                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="Address" name="address" rules={[{ required: true }]}>
                        <Input placeholder="Address" />
                    </FormItem>
                </Col>
            </Row>
            <hr />
            <h1 className="card-title mt=3">Professional Information</h1>
            <Row gutter={20}>
                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="Specialization" name="specialization" rules={[{ required: true }]}>
                        <Input placeholder="Specialization" />
                    </FormItem>
                </Col>

                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="Experience" name="experience" rules={[{ required: true }]}>
                        <Input placeholder="Experience" />
                    </FormItem>
                </Col>

                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="Fee Per Consultation" name="feePerConsultation" rules={[{ required: true }]}>
                        <Input placeholder="Fee Per Consultation" type="number" />
                    </FormItem>
                </Col>

                <Col span={8} xs={24} sm={24} lg={8}>
                    <FormItem required label="Timings" name="timings" rules={[{ required: true }]}>
                        <TimePicker.RangePicker format="HH:mm" />
                    </FormItem>
                </Col>

            </Row>

            <div className="d-flex justify-content-end">
                <Button className="primary-button" htmlType="submit" >Submit</Button>
            </div>
        </Form>
    )
}

export default DoctorForm;