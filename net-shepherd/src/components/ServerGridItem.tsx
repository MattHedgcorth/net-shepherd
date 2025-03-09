import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Server, ServerStats } from '../types/types';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Storage as ServerIcon,
} from '@mui/icons-material';

interface Props {
  server: Server;
  stats: ServerStats;
  onClick: () => void;
}

const ServerGridItem: React.FC<Props> = ({ server, stats, onClick }) => {
  const getStatusIcon = () => {
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
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <ServerIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          {getStatusIcon()}
        </Box>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {server.commonName}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
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
          <Typography variant="body2">
            Total Websites: {stats.totalWebsites}
          </Typography>
          <Typography variant="body2">
            Running: {stats.runningWebsites}
          </Typography>
          <Typography variant="body2">
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