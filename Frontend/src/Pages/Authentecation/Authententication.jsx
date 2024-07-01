import React, { useState, useEffect, useRef } from 'react'
// import BIRDS from "vanta/dist/vanta.waves.min";
import BIRDS from 'vanta/dist/vanta.net.min'
import * as THREE from "three";
import { Routes, Route } from "react-router-dom"
import UserLogin from '../UserSide/UserLogin';
import '../../Styles/auth.scss'
import UserRegister from '../UserSide/UserRegister'
import DoctorLogin from '../Doctor/DoctorLogin';
import DoctorRegister from '../Doctor/DoctorRegister';
import VerifyOtp from '../UserSide/VerifyOtp';
import PrivateRoute from '../../Components/private/PrivateRoute';
import DoctorPrivateRoute from '../../Components/private/DoctorPrivateRoute';
import ForgotPassword from '../UserSide/ForgotPassword';
import ResetPassword from '../UserSide/ResetPassword';


const Authentication = () => {
  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        VANTA.NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x8ff7,
          points: 15.00,
          maxDistance: 21.00,
          spacing: 16.00
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

    return (
      <div className='auth' ref={vantaRef}>
        <p style={{ color: "#fff", paddingTop: "20px" }}>
      <Routes>
        <Route path="/signup" element={<PrivateRoute><UserRegister/></PrivateRoute>} />
        <Route path='/login' element={<PrivateRoute><UserLogin /></PrivateRoute>}/>
        <Route path="doctor/login" element={<DoctorPrivateRoute><DoctorLogin /></DoctorPrivateRoute>} />
        <Route path="/doctor/signup" element={<DoctorPrivateRoute><DoctorRegister /></DoctorPrivateRoute>} />
        <Route path="/verifyotp" element={<PrivateRoute><VerifyOtp /></PrivateRoute>} />
        <Route path="/forgotpassword" element={<PrivateRoute><ForgotPassword /></PrivateRoute>} />
            <Route path="/resetpassword/:id/:token" element={<PrivateRoute><ResetPassword /></PrivateRoute>} />
      </Routes>
        </p>
    </div>
  )
}

export default Authentication
