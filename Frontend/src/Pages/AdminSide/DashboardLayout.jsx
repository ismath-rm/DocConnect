import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';


export default function DashboardLayout({ children }) {

  return (
    <>
    

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        
        
        {children}

      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};