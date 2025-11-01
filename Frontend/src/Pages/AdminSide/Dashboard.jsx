
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import AppWidgetSummary from '../../Components/adminside/elements/app-widget-summary';
import { useEffect, useState } from 'react';
import axios from 'axios'
import { BASE_URL } from '../../utils/constants/Constants'
import Cookies from 'js-cookie';


const api = axios.create({
  baseURL: `${BASE_URL}appointment/api/admin-transactions/`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default function Dashboard() {
  const [adminData, setadminData] = useState(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const accessToken = Cookies.get("access");
        if (!accessToken) {
          throw new Error("Access token not found");
        }

        
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        const response = await api.get();
        setadminData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);


  return (
    <Container maxWidth="xl" sx={{ mt: 10 }}>
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Weekly Sales"
            total={adminData ? adminData.total_transactions : 0}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Patients"
            total={adminData ? adminData.total_patients : 0}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Doctors"
            total={adminData ? adminData.total_doctors : 0}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Bug Reports"
            total={adminData ? adminData.total_revenue : 0}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        
      </Grid>
    </Container>
  );
}
