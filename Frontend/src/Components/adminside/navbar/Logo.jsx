import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

const Logo = forwardRef(({ sx }, ref) => {
    // const theme = useTheme();

    const logo = (
        <Box
            ref={ref}
            component="img"
            src="/assets/Logo/DocConnect.png"
            alt="Logo"
            sx={{
                width: 300,
                height: 100,
                ...sx,
            }}

        />
    );

    return logo;
});

Logo.propTypes = {
    disabledLink: PropTypes.bool,
    sx: PropTypes.object,
};

export default Logo;
