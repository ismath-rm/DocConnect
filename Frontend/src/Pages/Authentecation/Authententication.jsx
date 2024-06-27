import React from 'react'
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


const Authentication = () => {
  

    return (
    <div className='auth'>
      <Routes>
        <Route path="/signup" element={<PrivateRoute><UserRegister/></PrivateRoute>} />
        <Route path='/login' element={<PrivateRoute><UserLogin /></PrivateRoute>}/>
        <Route path="doctor/login" element={<DoctorPrivateRoute><DoctorLogin /></DoctorPrivateRoute>} />
        <Route path="/doctor/signup" element={<DoctorPrivateRoute><DoctorRegister /></DoctorPrivateRoute>} />
        <Route path="/verifyotp" element={<PrivateRoute><VerifyOtp /></PrivateRoute>} />
        <Route path="/forgotpassword" element={<PrivateRoute><ForgotPassword /></PrivateRoute>} />
 
        
      </Routes>
    
    </div>
  )
}

export default Authentication
