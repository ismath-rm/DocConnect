import React from 'react'
import Logo from '../../assets/logo.png';
import FacebookIcon from '../../assets/icons/facebook.png';  
import TwitterIcon from '../../assets/icons/twitter.png';  
import LinkedinIcon from '../../assets/icons/linkedin.png';
import InstagramIcon from '../../assets/icons/instagram.png';

const DoctorFooter = () => {
    return (
        <footer className="bg-black text-white flex flex-col items-center px-8 py-10 md:px-16 md:py-11">
          <div className="flex flex-col md:flex-row w-full max-w-[1296px] mb-10">
            <div className="flex flex-col w-full md:w-1/3 items-start mb-8 md:mb-0 md:mr-8">
              <img src={Logo} alt="DocConnect Logo" className="w-24 mb-4" />
              <p className="text-gray-400 mb-4">
                Connecting You to Trusted Healthcare, Ensuring Quality and Convenience.
              </p>
              <div className="flex space-x-4">
                <a href="#"><img src={FacebookIcon} alt="Facebook" className="w-6 h-6" /></a>
                <a href="#"><img src={TwitterIcon} alt="Twitter" className="w-6 h-6" /></a>
                <a href="#"><img src={LinkedinIcon} alt="LinkedIn" className="w-6 h-6" /></a>
                <a href="#"><img src={InstagramIcon} alt="Instagram" className="w-6 h-6" /></a> 
              </div> 
            </div>
            <div className="flex flex-col md:flex-row w-full md:space-x-8">
              <div className="flex flex-col w-full md:w-1/3 mb-8 md:mb-0">
                <h2 className="font-bold text-lg mb-4">INFORMATION</h2>
                <a href="#" className="text-neutral-400 mb-2">Video Consult</a>
                <a href="#" className="text-neutral-400 mb-2">Doctors</a>
                <a href="#" className="text-neutral-400 mb-2">About Us</a>
              </div>
              <div className="flex flex-col w-full md:w-1/3 mb-8 md:mb-0">
                <h2 className="font-bold text-lg mb-4">CONTACT INFORMATION</h2>
                <p className="text-neutral-400 mb-2">290 NORTH 47TH STREET,</p>
                <p className="text-neutral-400 mb-2">ERNAKULAM</p>
                <p className="text-neutral-400 mb-2">+91 9847200211</p>
                <p className="text-neutral-400 mb-2">docconnect@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="w-full border-t border-gray-700 my-4"></div>
          <p className="text-gray-600 text-sm">© 2023 DocConnect. All rights reserved.</p>
        </footer>
      );
}

export default DoctorFooter
