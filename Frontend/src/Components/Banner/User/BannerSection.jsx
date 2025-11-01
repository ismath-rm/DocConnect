import { Link } from "react-router-dom";
import Banner1 from '../../../assets/images/Banner6.jpg'



const BannerSection = () => {
  return (
    <div className=''>
        <div
        
            className="relative bg-gradient-to-r from-purple-800 to-blue-600 w-screen h-screen  text-white"
            style={{
                backgroundImage: `url(${Banner1})`,
                backgroundSize: "cover",
                objectFit:"contain"
            }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
                <h1 className="text-5xl font-bold leading-tight mb-4">
                Caring for you, like family
                </h1>
                <p className="text-lg text-gray-300 mb-8">
                Compassionate healthcare, closer to home
                </p>
                <Link
                to="#"
                className="bg-blue-600 text-white-900 hover:bg-blue-500 py-2 px-6 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                >
                Get Started
                </Link>
            </div>
        </div>

        
    </div>
  )
}

export default BannerSection
