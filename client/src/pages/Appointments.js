import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { useDispatch } from "react-redux";
import Layout from "../components/Layout";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import axios from "axios";
import moment from 'moment';
import dayjs from 'dayjs';

function Appointments () {
    const [appointments, setAppointments] = useState([]);
    const dispatch = useDispatch();

    const getAppointmentsData = async () => {
      try {
        dispatch(showLoading());

        const response = await axios.get("/api/user/get-appointments-by-user-id", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        dispatch(hideLoading());
        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (error) {
        dispatch(hideLoading());
      }
    };
    
      const columns = [
        {
            title: "Id",
            dataIndex: "_id",
        },
        {
          title: "Doctor",
          dataIndex: "name",
          render: (text, record) => (
            <span>
              {record.doctorInfo.firstName} {record.doctorInfo.lastName}
            </span>
          ),
        },
        {
          title: "Phone",
          dataIndex: "phoneNumber",
          render: (text, record) => (
            <span>
              {record.doctorInfo.phoneNumber}
            </span>
          ),
          
        },
        {
          title: "Date & Time",
          dataIndex: "createdAt",
          render: (text, record) => (
            <span>
              {dayjs(record.date).format("DD-MM-YYYY")} || {dayjs(record.time).format("HH:mm")}
            </span>
          ),
          
        },
        {
          title: "Status",
          dataIndex: "status",
        },

      ];
     
      useEffect(() => {
        getAppointmentsData();
      }, []);

    return (
        <Layout>
            <h1 className='page-title'>Appointments</h1>
            <hr />
            <Table columns={columns} dataSource={appointments}/>
        </Layout>
    )
}

export default Appointments;