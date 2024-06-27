
import React from "react";
import AdminPrivateRoute from '../../Components/private/AdminPrivateRoute'
import AdminLogin from "../../Pages/AdminSide/AdminLogin";
import { Outlet, useRoutes } from "react-router-dom";
import '../../Styles/main.scss';
import DashboardLayout from "../../Pages/AdminSide/DashboardLayout";;
import AdminLogRoute from "../../Components/private/AdminLogRoute";
import Dashboard from '../../Pages/AdminSide/Dashboard'


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
        

      ]
    }
    
  ]);

  return routes;
}

export default AdminWrapper;
