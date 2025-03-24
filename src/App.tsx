import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Refresh as RefreshIcon, ArrowBack as ArrowBackIcon, Pause as PauseIcon, PlayArrow as PlayArrowIcon, Stop as StopIcon } from '@mui/icons-material';
import { theme } from './theme/theme';
import ServerGrid from './components/ServerGrid';
import WebsiteList from './components/WebsiteList';
import { ServerProvider, useServerContext } from './context/ServerContext';
import { UserProvider, useUser } from './context/UserContext';
import Header from './components/Header';



const PollControls: React.FC<{ serverId?: string }> = ({ serverId = "" }) => {
  const { pollWebsites, isPolling, isPaused, togglePause, stopPolling } = useServerContext();
  
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={() => pollWebsites(serverId)}
        disabled={isPolling}
      >
        {isPolling ? 'Polling...' : `Poll ${serverId ? 'Server' : 'All'} Websites`}
      </Button>
      {isPolling && (
        <>
          <Button
            variant="outlined"
            startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={togglePause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<StopIcon />}
            onClick={stopPolling}
            color="error"
          >
            Stop
          </Button>
        </>
      )}
    </Box>
  );
};

const ServerGridPage: React.FC = () => {
  const { data, updateLayout, pollWebsites, isPolling, isPaused, togglePause, stopPolling } = useServerContext();
  const [username] = React.useState<string>('john.doe');

  const handleLayoutChange = (newLayout: any[]) => {
    updateLayout(username, newLayout);
  };

  const { user } = useUser();

  return (
    <Box sx={{
      height: '100vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header user={{ name: username }} />
      <Box sx={{ flex: 1, position: 'relative', marginTop: 0, display: 'flex', flexDirection: 'column', paddingTop: '0px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <PollControls />
        </Box>
        <ServerGrid
          servers={data.servers}
          initialLayout={data.userLayouts[username]?.layout || []}
          onLayoutChange={handleLayoutChange}
          username={username}
        />
      </Box>
    </Box>
  );
};

const ServerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, pollWebsites, isPolling, isPaused, togglePause, stopPolling, pollingServerId } = useServerContext();
  const [username] = React.useState<string>('john.doe');
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
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header user={{ name: username }} />
      <Box sx={{ flex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Back to Grid
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => pollWebsites(id || "")}
              disabled={isPolling}
            >
              {isPolling ? 'Polling...' : 'Poll Server Websites'}
            </Button>
            {isPolling && (
              <>
                <Button
                  variant="outlined"
                  startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                  onClick={togglePause}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<StopIcon />}
                  onClick={stopPolling}
                  color="error"
                >
                  Stop
                </Button>
              </>
            )}
          </Box>
        </Box>
        <WebsiteList
          websites={server.websites}
          isPolling={isPolling}
          isPaused={isPaused}
          pollingServerId={pollingServerId}
        />
      </Box>
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
      <UserProvider>
        <ServerProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ServerProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
