import React, { useState } from 'react';
import {
  List,
  ListItem,
  Box,
  Typography,
  IconButton,
  Modal,
  Card,
  CardMedia,
  Link,
} from '@mui/material';
import {
  Language as WebsiteIcon,
  Api as ApiIcon,
  Share as RedirectIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Website, WebsiteType, TechnologyType } from '../types/types';

interface Props {
  websites: Website[];
}

const WebsiteList: React.FC<Props> = ({ websites }) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const getWebsiteTypeIcon = (type: WebsiteType) => {
    switch (type) {
      case 'website':
        return <WebsiteIcon sx={{ color: 'primary.main' }} />;
      case 'api':
        return <ApiIcon sx={{ color: 'secondary.main' }} />;
      case 'website-redirect':
        return <RedirectIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getTechnologyIcon = (technology: TechnologyType) => {
    return (
      <Box
        component="span"
        sx={{
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: 'background.paper',
          fontSize: '0.75rem',
          fontWeight: 'medium',
        }}
      >
        {technology}
      </Box>
    );
  };

  const getStatusIcon = (website: Website) => {
    if (!website.status.isRunning) {
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    }
    if (website.status.lastStatusCode === 200) {
      return <CheckIcon sx={{ color: 'success.main' }} />;
    }
    if (website.status.lastStatusCode === 500 || website.status.responseTime === 0) {
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    }
    return <WarningIcon sx={{ color: 'warning.main' }} />;
  };

  return (
    <>
      <List sx={{ width: '100%', bgcolor: 'transparent' }}>
        {websites.map((website) => (
          <ListItem
            key={website.id}
            sx={{
              mb: 2,
              borderRadius: 1,
              bgcolor: 'rgba(10, 25, 41, 0.7)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(10, 25, 41, 0.8)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          >
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '40%' }}>
                {getWebsiteTypeIcon(website.type)}
                <Box sx={{ ml: 2 }}>
                  <Link
                    href={website.primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    underline="hover"
                  >
                    <Typography variant="subtitle1">{website.name}</Typography>
                  </Link>
                  {website.additionalUrls.map((url, index) => (
                    <Link
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      display="block"
                      sx={{ 
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        ml: 2,
                        '&:hover': {
                          color: 'primary.main',
                        },
                      }}
                    >
                      {url}
                    </Link>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', width: '20%' }}>
                {getTechnologyIcon(website.technology)}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', width: '20%' }}>
                {getStatusIcon(website)}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {website.status.lastStatusCode}
                </Typography>
              </Box>

              {website.screenshot && (
                <Box sx={{ width: '20%' }}>
                  <IconButton
                    onClick={() => setSelectedScreenshot(website.screenshot)}
                  >
                    <img
                      src={website.screenshot}
                      alt={`${website.name} screenshot`}
                      style={{
                        width: 100,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                  </IconButton>
                </Box>
              )}
            </Box>
          </ListItem>
        ))}
      </List>

      <Modal
        open={!!selectedScreenshot}
        onClose={() => setSelectedScreenshot(null)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ maxWidth: '90%', maxHeight: '90%' }}>
          <CardMedia
            component="img"
            image={selectedScreenshot || ''}
            alt="Website screenshot"
            sx={{
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
        </Card>
      </Modal>
    </>
  );
};

export default WebsiteList;