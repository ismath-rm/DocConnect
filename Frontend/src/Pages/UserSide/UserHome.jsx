import React from 'react'
import FAQSection from '../../Components/userside/Element/FaqSection'
import BannerSection from '../../Components/Banner/User/BannerSection'
import Appointment from '../../Components/userside/Element/Appointment'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import HowItWorksSection from '../../Components/userside/Element/HowItWorksSection'

const UserHome = () => {
  const navigate = useNavigate();
  const authentication_user = useSelector((state) => state.authentication_user)

  return (
    <div className='overflow-x-hidden overflow-y-hidden'>
      <BannerSection/>
      <Appointment/>
      <HowItWorksSection/>
      <FAQSection/>
    </div>
  )
}

export default UserHome
