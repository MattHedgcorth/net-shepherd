import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Refresh as RefreshIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { theme } from './theme/theme';
import ServerGrid from './components/ServerGrid';
import WebsiteList from './components/WebsiteList';
import { ServerProvider, useServerContext } from './context/ServerContext';

const ServerGridPage: React.FC = () => {
  const { data, updateLayout, pollWebsites } = useServerContext();
  const [username] = React.useState<string>('john.doe');

  const handleLayoutChange = (newLayout: any[]) => {
    updateLayout(username, newLayout);
  };

  return (
    <Box sx={{ height: '100vh', bgcolor: 'background.default', position: 'relative' }}>
      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={pollWebsites}
        sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
      >
        Poll Websites
      </Button>
      <ServerGrid
        servers={data.servers}
        initialLayout={data.userLayouts[username]?.layout || []}
        onLayoutChange={handleLayoutChange}
        username={username}
      />
    </Box>
  );
};

const ServerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, pollWebsites } = useServerContext();
  const server = data.servers.find(s => s.id === id);

  if (!server) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Grid
        </Button>
        <Box sx={{ mt: 2 }}>Server not found</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Grid
        </Button>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={pollWebsites}
        >
          Poll Websites
        </Button>
      </Box>
      <WebsiteList websites={server.websites} />
    </Box>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ServerGridPage />} />
      <Route path="/server/:id" element={<ServerDetailPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ServerProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ServerProvider>
    </ThemeProvider>
  );
};

export default App;
