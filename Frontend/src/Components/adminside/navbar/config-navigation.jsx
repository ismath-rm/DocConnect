import { Box } from "@mui/material";

const icon = (name, isSelected) => (
  <Box
    component="span"
    className="svg-color"
    sx={{
      width: 24,
      height: 24,
      display: 'inline-block',
      background: isSelected ? '#2776DF' : 'white',
      mask: `url(/assets/icons/navbar/${name}.svg) no-repeat center / contain`,
      WebkitMask: `url(/assets/icons/navbar/${name}.svg) no-repeat center / contain`,
    }}
  />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/admincontrol/',
    icon: (isSelected) => icon('ic_analytics', isSelected),
  },
  {
    title: 'Patients',
    path: '/admincontrol/patient',
    icon: (isSelected) => icon('ic_user', isSelected),
  },
  {
    title: 'Doctors',
    path: '/admincontrol/doctor',
    icon: (isSelected) => icon('ic_user', isSelected),
  },
 
  {
    title: 'Verification',
    path: '/admincontrol/DocVerification',
    icon: (isSelected) => icon('ic_lock', isSelected),
  },

  {
    title: 'Booking List',
    path: '/admincontrol/booking',
    icon: (isSelected) => icon('ic_blog', isSelected),
  },
];

export default navConfig;
