import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Nav from '../../Components/adminside/navbar/Navbar';
import Header from '../../Components/adminside/header/Header';


export default function DashboardLayout({ children }) {
  const [openNav, setOpenNav] = useState(false);

  return (
    <>
    
      <Header onOpenNav={() => setOpenNav(true)} />

      <Box
        sx={{
          minHeight: 20,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Nav openNav={openNav} onCloseNav={() => setOpenNav(false)} />
        
        
        {children}

      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};