import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServerData, Server, Website, WebsiteType, TechnologyType } from '../types/types';
import rawServerData from '../data/servers.json';
import axios from 'axios';

// Type assertion function to ensure data matches our types
const parseServerData = (data: any): ServerData => {
  const servers: Server[] = data.servers.map((server: any) => ({
    id: server.id,
    commonName: server.commonName,
    machineName: server.machineName,
    ipAddresses: server.ipAddresses,
    icon: server.icon,
    websites: server.websites.map((website: any) => ({
      id: website.id,
      name: website.name,
      type: website.type as WebsiteType,
      technology: website.technology as TechnologyType,
      primaryUrl: website.primaryUrl,
      additionalUrls: website.additionalUrls,
      status: {
        isRunning: website.status.isRunning,
        lastStatusCode: website.status.lastStatusCode,
        lastChecked: website.status.lastChecked,
        responseTime: website.status.responseTime
      },
      screenshot: website.screenshot
    }))
  }));

  return {
    servers,
    userLayouts: data.userLayouts
  };
};

interface ServerContextType {
  data: ServerData;
  updateLayout: (username: string, layout: any[]) => void;
  pollWebsites: (serverId: string) => void;
  isPolling: boolean;
  pollingServerId: string | null;
  isPaused: boolean;
  togglePause: () => void;
  stopPolling: () => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ServerData>(parseServerData(rawServerData));
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollingServerId, setPollingServerId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [shouldStop, setShouldStop] = useState<boolean>(false);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const stopPolling = () => {
    setShouldStop(true);
    setIsPolling(false);
    setPollingServerId(null);
  };

  const updateLayout = (username: string, layout: any[]) => {
    setData(prevData => ({
      ...prevData,
      userLayouts: {
        ...prevData.userLayouts,
        [username]: {
          layout
        }
      }
    }));
  };

  const pollWebsites = async (serverId: string) => {
    if (isPolling) {
      return; // Prevent concurrent polling
    }

    // Reset stop flag when starting new polling
    setShouldStop(false);

    // If no serverId is provided, poll all servers
    const serversToPoll = serverId ? [data.servers.find(s => s.id === serverId)].filter(Boolean) : data.servers;

    setIsPolling(true);
    setPollingServerId(serverId);

    try {
      const updatedServers = await Promise.all(data.servers.map(async server => {
        if (serverId && server.id !== serverId) {
          return server; // Skip polling for other servers if specific serverId provided
        }

        const throttledWebsites = [];
        const maxConcurrentRequests = 3; // Limit concurrent requests
        let runningRequests = 0;
        let websiteIndex = 0;

        return {
          ...server,
          websites: await Promise.all(server.websites.map(async website => {
            return new Promise(resolve => {
              const poll = async () => {
                // Check if polling should be stopped
                if (shouldStop) {
                  resolve(website);
                  return;
                }

                // If paused, wait and check again
                if (isPaused) {
                  setTimeout(() => poll(), 1000);
                  return;
                }

                try {
                  const corsProxyUrl = 'https://api.allorigins.win/get?url='; // Use a CORS proxy
                  const response = await axios.get(corsProxyUrl + encodeURIComponent(website.primaryUrl), {
                    timeout: 5000,
                    headers: {
                      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                      'Accept-Language': 'en-US,en;q=0.5',
                      'Referer': 'http://localhost:3000/',
                      'Cache-Control': 'no-cache',
                      'Connection': 'keep-alive'
                    }
                  });
                  resolve({
                    ...website,
                    status: {
                      ...website.status,
                      lastChecked: new Date().toISOString(),
                      lastStatusCode: response.status,
                      responseTime: response.headers['request-duration'] ? parseInt(response.headers['request-duration'], 10) : 0,
                      isRunning: true
                    }
                  });
                } catch (error: any) {
                  console.error(`Error polling ${website.primaryUrl}:`, error);
                  resolve({
                    ...website,
                    status: {
                      ...website.status,
                      lastChecked: new Date().toISOString(),
                      lastStatusCode: error.response?.status || error.code === 'ECONNABORTED' ? 408 : 500,
                      responseTime: 0,
                      isRunning: false
                    }
                  });
                } finally {
                  runningRequests--;
                  if (websiteIndex < server.websites.length && runningRequests < maxConcurrentRequests) {
                    poll();
                  }
                }
              };

              if (runningRequests < maxConcurrentRequests) {
                runningRequests++;
                websiteIndex++;
                poll();
              } else {
                throttledWebsites.push(website);
              }
            });
          })) as Website[]
        };
      }));

      setData(prevData => ({
        ...prevData,
        servers: updatedServers
      }));
    } finally {
      setIsPolling(false);
      setPollingServerId(null);
    }
  };

  return (
    <ServerContext.Provider value={{ data, updateLayout, pollWebsites, isPolling, pollingServerId, isPaused, togglePause, stopPolling }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServerContext = () => {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error('useServerContext must be used within a ServerProvider');
  }
  return { ...context, isPolling: context.isPolling };
};