import { DatePicker, TimePicker, Col, Row, Button } from 'antd';
import Layout from '../components/Layout';
import React, {useEffect, useState } from 'react';
import {  useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertsSlice';
import axios from "axios";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import moment from 'moment';


function BookAppointment() {
    const [ isAvailable, setIsAvailable ] = useState(false);
    const navigate = useNavigate();
    const [ date, setDate ] = useState();
    const [ time, setTime ] = useState();
    const { user } = useSelector((state) => state.user);
    const [ doctor, setDoctor ] = useState(null);
    const params = useParams();
    const dispatch = useDispatch();

    const getDoctorData = async () => {
        try {
          dispatch(showLoading());
          const response = await axios.post(
            "/api/doctor/get-doctor-info-by-id",
            {
              doctorId: params.doctorId,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
    
          dispatch(hideLoading());
          if (response.data.success) {
            setDoctor(response.data.data);
          }
        } catch (error) {
          console.log("error", error);
          dispatch(hideLoading());
        }
    };

    const bookNow = async () => {
        try {
          setIsAvailable(false);
          dispatch(showLoading());
          const response = await axios.post(
            "/api/user/book-appointment",
            {
              doctorId: params.doctorId,
              userId: user._id,
              doctorInfo: doctor,
              userInfo: user,
              date: date,
              time: time,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
    
          dispatch(hideLoading());
          if (response.data.success) {
            toast.success(response.data.message);
            navigate("/appointments")

          }
        } catch (error) {
          console.log("error", error);
            toast.error('Error booking appointment')
          dispatch(hideLoading());
        }
    };

    const checkAvailability = async () => {
      try {
        dispatch(showLoading());
        const response = await axios.post(
          "/api/user/check-booking-availability",
          {
            doctorId: params.doctorId,
            date: date,
            time: time,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
  
        dispatch(hideLoading());
        if (response.data.success) {
          toast.success(response.data.message)
          setIsAvailable(true);
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.log("error", error);
        toast.error('Error booking appointment')
        dispatch(hideLoading());
      }
  };

    useEffect(() => {
        getDoctorData();
    }, []);


    return (
        <Layout>
            { doctor && (
                <div>
                    <h1 className='page-title'>{doctor.firstName} {doctor.lastName}</h1>
                    <hr />
                    <Row gutter={20} className='mt-5' align="middle">
                        <Col span={8} sm={24} xs={24} lg={8}>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6CiRQP2x4x3VkaXnoJeJsuvjOmlVN98Y__g&usqp=CAU" 
                            alt=""
                            width="100%"
                            height="400"
                          />
                 
                        </Col>  
                        <Col span={8} sm={24} xs={24} lg={8}>
                            <p>
                              <b> Timings :</b> {doctor.timings[0]} - {doctor.timings[1]}
                              </p>
                              <p>
                                <b>Phone Number : </b>{doctor.phoneNumber}
                              </p>
                              <p>
                                <b>Address : </b>{doctor.address}
                              </p>
                              <p>
                                <b>Fee Per Visit : </b>{doctor.feePerConsultation}
                              </p>
                              <p>
                                <b> Website : </b>{doctor.website}
                              </p>
                            
                            <div className='d-flex flex-column pt-2 mt-2'>
                                <DatePicker 
                                  format='DD-MM-YYYY' 
                                  onChange={(value) => {
                                      setDate(
                                        moment(value).format('DD-MM-YYYY'))
                                        setIsAvailable(false);
                                  }} />

                                <TimePicker 
                                    format='HH:mm' 
                                    className="mt-3" 
                                    onChange={(value) => {
                                      setIsAvailable(false);
                                        setTime(
                                            moment(value).format("HH:mm")
                                        );
                                    }}
                                />
                                {!isAvailable && <Button className="primary-button mt-3 full-width-button"  onClick={checkAvailability}>Check Availability</Button>}
                                {isAvailable && (<Button className="primary-button mt-3 full-width-button" onClick={bookNow}>Book Now</Button>)}
                            </div>
                        </Col>
                 
                    </Row>
                </div>
            )}
        </Layout>
    )
}

export default BookAppointment;