import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserWrapper from './Wrapper/UserWrapper/UserWrapper';
import './Styles/auth.scss';
import DoctorWrapper from './Wrapper/DoctorWrapper/DoctorWrapper';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import UserStore from './Redux/UserStore';
import AdminWrapper from './Wrapper/AdminWrapper/AdminWrapper';

function App() {
  return (
    <Provider store={UserStore}>
      <Router>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce} // Corrected syntax here
        />
        <Routes>
          <Route path="*" element={<UserWrapper />} />
          <Route path="/doctor/*" element={<DoctorWrapper />} />
          <Route path='/admincontrol/*' element={<AdminWrapper/>} /> 
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
