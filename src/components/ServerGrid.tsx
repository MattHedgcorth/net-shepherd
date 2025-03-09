import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import ServerGridItem from './ServerGridItem';
import { Server, GridLayout as GridLayoutType, ServerStats } from '../types/types';
import { useNavigate } from 'react-router-dom';

interface Props {
  servers: Server[];
  initialLayout: GridLayoutType[];
  onLayoutChange: (layout: GridLayoutType[]) => void;
  username: string;
}

const ServerGrid: React.FC<Props> = ({
  servers,
  initialLayout,
  onLayoutChange,
  username,
}) => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<GridLayoutType[]>(initialLayout);

  // Calculate statistics for each server
  const calculateServerStats = (server: Server): ServerStats => {
    const totalWebsites = server.websites.length;
    const runningWebsites = server.websites.filter(w => w.status.isRunning).length;
    const offlineWebsites = totalWebsites - runningWebsites;
    const respondingWebsites = server.websites.filter(
      w => w.status.isRunning && w.status.lastStatusCode === 200
    ).length;

    return {
      totalWebsites,
      runningWebsites,
      offlineWebsites,
      respondingWebsites,
    };
  };

  const handleLayoutChange = (newLayout: GridLayoutType[]) => {
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  const handleServerClick = (serverId: string) => {
    navigate(`/server/${serverId}`);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <Grid container spacing={2}>
        {servers.map((server, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={server.id}>
            <ServerGridItem
              server={server}
              stats={calculateServerStats(server)}
              onClick={() => handleServerClick(server.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServerGrid;