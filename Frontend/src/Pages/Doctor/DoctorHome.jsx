import React from 'react'
import DocBannerSection from '../../Components/Banner/Doctor/DocBannerSection'
// import FAQSection from '../../Components/userside/Element/FaqSection'
// import BannerSection from '../../Components/Banner/User/BannerSection'


const DoctorHome = () => {
  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 h-screen text-white overflow-hidden">
        <div class="absolute inset-0">
          <DocBannerSection/>
        </div>
      </div>
  )
}

export default DoctorHome
