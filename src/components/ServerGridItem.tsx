import React from 'react';
import { Card, CardContent, Typography, Box, Chip, CircularProgress } from '@mui/material';
import { Server, ServerStats } from '../types/types';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Storage as ServerIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { useServerContext } from '../context/ServerContext';
import { Website } from '../types/types';

interface Props {
  server: Server;
  stats: ServerStats;
  onClick: (serverId: string) => void;
}

const ServerGridItem: React.FC<Props> = ({ server, stats, onClick }) => {
  const { isPolling, isPaused, pollingWebsiteIds } = useServerContext();
  
  // Check if any of this server's websites are being polled
  const isServerBeingPolled = () => {
    if (!isPolling) return false;
    
    // Check if any website from this server is in the pollingWebsiteIds array
    return server.websites.some((website: Website) =>
      pollingWebsiteIds.includes(website.id)
    );
  };

  const getStatusIcon = () => {
    if (isPolling && isServerBeingPolled()) {
      if (isPaused) {
        return <PauseIcon sx={{ color: 'info.main', fontSize: 40 }} />;
      }
      return <CircularProgress size={40} />;
    }

    const responsePercentage = stats.runningWebsites === 0
      ? 0
      : (stats.respondingWebsites / stats.runningWebsites) * 100;

    if (responsePercentage > 50) {
      return <CheckIcon sx={{ color: 'success.main', fontSize: 40 }} />;
    } else if (responsePercentage > 0) {
      return <WarningIcon sx={{ color: 'warning.main', fontSize: 40 }} />;
    }
    return <ErrorIcon sx={{ color: 'error.main', fontSize: 40 }} />;
  };

  const getResponseColor = () => {
    const responsePercentage = stats.runningWebsites === 0 
      ? 0 
      : (stats.respondingWebsites / stats.runningWebsites) * 100;

    if (responsePercentage > 50) return 'success.main';
    if (responsePercentage > 0) return 'warning.main';
    return 'error.main';
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: 'rgba(26, 26, 46, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '&:hover': {
          transform: 'scale(1.02)',
          background: 'rgba(26, 26, 46, 0.8)',
        },
      }}
    >
      <CardContent onClick={() => onClick(server.id)}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <ServerIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          {getStatusIcon()}
        </Box>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {server.commonName}
        </Typography>

        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
          {server.machineName}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {server.ipAddresses.map((ip, index) => (
            <Chip
              key={index}
              label={ip}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
            Total Websites: {stats.totalWebsites}
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
            Running: {stats.runningWebsites}
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
            Offline: {stats.offlineWebsites}
          </Typography>
          <Typography variant="body2" sx={{ color: getResponseColor() }}>
            Responding: {stats.respondingWebsites}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ServerGridItem;