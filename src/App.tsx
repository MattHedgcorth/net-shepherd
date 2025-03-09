import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { theme } from './theme/theme';
import { ServerProvider } from './context/ServerContext';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ServerProvider>
        <Box sx={{ 
          height: '100vh', 
          bgcolor: 'background.default', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Typography variant="h4" color="primary">
            Net Shepherd
          </Typography>
        </Box>
      </ServerProvider>
    </ThemeProvider>
  );
};

export default App;
