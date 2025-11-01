import DocBannerSection from '../../Components/Banner/Doctor/DocBannerSection'


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
