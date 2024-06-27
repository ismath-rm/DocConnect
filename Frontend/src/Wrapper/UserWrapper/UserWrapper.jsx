import React, { useEffect } from 'react'
import { useRoutes, Outlet } from 'react-router-dom';
import Authentication from '../../Pages/Authentecation/Authententication'
import UserHome from '../../Pages/UserSide/UserHome';
import UserHeader from '../../Components/userside/UserHeader';
import UserFooter from '../../Components/userside/UserFooter';
import { useDispatch, useSelector } from 'react-redux';
import IsAuthUser from '../../utils/IsAuthUser';
import { set_Authentication } from '../../Redux/authentication/authenticationSlice';
import UserProfile from '../../Pages/UserSide/UserProfile';

const UserWrapper = () => {
  const dispatch = useDispatch();
  const authentication_user = useSelector(state => state.authentication_user)

  const checkAuth = async () => {
    const isAuthenticated = await IsAuthUser();
    dispatch(
      set_Authentication({
        name: isAuthenticated.name,
        isAuthenticated:isAuthenticated.isAuthenticated,
        user_id:isAuthenticated.user_id,
      })
    );
  };

  const token = localStorage.getItem('access');


  useEffect(() =>{
    if(!authentication_user.user_id){
      checkAuth();
    }

  },[authentication_user])

  const routes = useRoutes([{
    element: (
      <>
      <UserHeader/>
      <Outlet/>
      <UserFooter/>
      </>
    ),
    children:[
      {path: '/auth/*',element:<Authentication/>},
      {path: '/',element:<UserHome/>},
    ],
  },
  {
    element: (
      <>
      <UserHeader/>
      <Outlet/>
      <UserFooter/>
      </>
    ),
    children:[
      {path: '/profile',element:<UserProfile/>}
    ]
  }
])

  return routes
}

export default UserWrapper
