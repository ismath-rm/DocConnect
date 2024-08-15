
import React from "react";
import AdminPrivateRoute from '../../Components/private/AdminPrivateRoute';
import AdminLogin from "../../Pages/AdminSide/AdminLogin";
import { Outlet, useRoutes } from "react-router-dom";
import '../../Styles/main.scss';
import DashboardLayout from "../../Pages/AdminSide/DashboardLayout";;
import AdminLogRoute from "../../Components/private/AdminLogRoute";
import Dashboard from '../../Pages/AdminSide/Dashboard';
import Patient from '../../Pages/AdminSide/Patient';
import Doctor from "../../Pages/AdminSide/Doctor";
import VarificationDoc from "../../Pages/AdminSide/VarificationDoc";
import Booking from "../../Pages/AdminSide/Booking";
import Account from "../../Pages/AdminSide/Account";


function AdminWrapper() {
  const routes = useRoutes([
    {
      path: "/login",
      element: (
        <AdminLogRoute>
          <AdminLogin />
        </AdminLogRoute>
      ),
    },
    {
      element: (
        <AdminPrivateRoute>
          
            <DashboardLayout>
              <Outlet />
            </DashboardLayout>
          
        </AdminPrivateRoute>
      ),
      children: [
        { path: "/", element: <Dashboard /> },
        { path: "/patient", element: <Patient /> },
        { path: "/doctor", element: <Doctor /> },
        { path: "DocVerification", element: <VarificationDoc/> },
        { path: "/booking", element: <Booking /> },
        {path: "/account", element : <Account/>},
        

      ]
    }
    
  ]);

  return routes;
}

export default AdminWrapper;
