import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServerData, Server, Website, WebsiteType, TechnologyType } from '../types/types';
import rawServerData from '../data/servers.json';
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
  pollingWebsiteIds: string[];
  isPaused: boolean;
  togglePause: () => void;
  stopPolling: () => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ServerData>(parseServerData(rawServerData));
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollingServerId, setPollingServerId] = useState<string | null>(null);
  const [pollingWebsiteIds, setPollingWebsiteIds] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [shouldStop, setShouldStop] = useState<boolean>(false);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const stopPolling = () => {
    setShouldStop(true);
    setIsPolling(false);
    setPollingServerId(null);
    setPollingWebsiteIds([]);
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
    setIsPolling(true);
    setPollingServerId(serverId);
    setPollingWebsiteIds([]);

    try {
      // Collect all websites that need to be polled
      type WebsiteToPoll = { server: Server; website: Website };
      const websitesToPoll: WebsiteToPoll[] = [];
      
      data.servers.forEach(server => {
        if (serverId && server.id !== serverId) {
          return; // Skip polling for other servers if specific serverId provided
        }
        
        server.websites.forEach(website => {
          websitesToPoll.push({ server, website });
        });
      });
      
      // Create a copy of the servers to update
      const serversCopy = [...data.servers];
      
      // Set up polling with limited concurrency
      const maxConcurrentRequests = 10; // Limit to 10 concurrent requests
      let activeRequests = 0;
      let websiteIndex = 0;
      
      // Function to poll a single website
      const pollWebsite = async (server: Server, website: Website): Promise<void> => {
        // Add 1 second delay before polling
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If paused, wait until resumed
        while (isPaused && !shouldStop) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // If stopped, return immediately
        if (shouldStop) {
          return;
        }
        
        try {
          // Use our .NET API to check the website status
          console.log(`Checking website status for ${website.primaryUrl} via API`);
          
          // Add this website to the list of currently polling websites
          setPollingWebsiteIds(prev => [...prev, website.id]);
          
          // Call the API endpoint using fetch
          const response = await fetch(`http://localhost:5085/api/WebsiteStatus/check?url=${encodeURIComponent(website.primaryUrl)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          // The API response contains the status information
          const statusData = await response.json();
          
          // Find the server and website in our copy and update it
          const serverIndex = serversCopy.findIndex(s => s.id === server.id);
          if (serverIndex !== -1) {
            const websiteIndex = serversCopy[serverIndex].websites.findIndex(w => w.id === website.id);
            if (websiteIndex !== -1) {
              serversCopy[serverIndex].websites[websiteIndex] = {
                ...website,
                status: {
                  ...website.status,
                  lastChecked: new Date().toISOString(),
                  lastStatusCode: statusData.statusCode,
                  responseTime: statusData.responseTime,
                  isRunning: statusData.isRunning
                }
              };
              
              // Update the state with the latest changes
              setData(prevData => ({
                ...prevData,
                servers: [...serversCopy]
              }));
            }
          }
          
          // Remove this website from the list of currently polling websites
          setPollingWebsiteIds(prev => prev.filter(id => id !== website.id));
        } catch (error: any) {
          console.error(`Error polling ${website.primaryUrl}:`, error);
          
          // Find the server and website in our copy and update it
          const serverIndex = serversCopy.findIndex(s => s.id === server.id);
          if (serverIndex !== -1) {
            const websiteIndex = serversCopy[serverIndex].websites.findIndex(w => w.id === website.id);
            if (websiteIndex !== -1) {
              let statusCode = 500;
              
              if (error.name === 'AbortError' || error.message.includes('timeout')) {
                statusCode = 408; // Request Timeout
              } else if (error instanceof TypeError || error.message.includes('network') || error.message.includes('fetch')) {
                statusCode = 503; // Service Unavailable - for network errors
              } else if (error.message.includes('API error:')) {
                // Extract status code from API error message if possible
                const match = error.message.match(/API error: (\d+)/);
                if (match && match[1]) {
                  statusCode = parseInt(match[1], 10);
                }
              }
              
              serversCopy[serverIndex].websites[websiteIndex] = {
                ...website,
                status: {
                  ...website.status,
                  lastChecked: new Date().toISOString(),
                  lastStatusCode: statusCode,
                  responseTime: 0,
                  isRunning: false
                }
              };
              
              // Update the state with the latest changes
              setData(prevData => ({
                ...prevData,
                servers: [...serversCopy]
              }));
            }
          }
          
          // Remove this website from the list of currently polling websites
          setPollingWebsiteIds(prev => prev.filter(id => id !== website.id));
        }
      };
      
      // Process websites in batches
      const processWebsites = async () => {
        while (websiteIndex < websitesToPoll.length && activeRequests < maxConcurrentRequests) {
          if (shouldStop) {
            break;
          }
          
          const { server, website } = websitesToPoll[websiteIndex];
          websiteIndex++;
          activeRequests++;
          
          // Start polling this website
         pollWebsite(server, website).then(() => {
            activeRequests--;
            // When a request completes, try to start more
            if (!shouldStop) {
              processWebsites();
            }
          });
        }
      };
      
      // Start the initial batch of requests
      await processWebsites();
      
      // Wait for all requests to complete
      while (activeRequests > 0 && !shouldStop) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      setIsPolling(false);
      setPollingServerId(null);
    }
  };

  return (
    <ServerContext.Provider value={{ data, updateLayout, pollWebsites, isPolling, pollingServerId, pollingWebsiteIds, isPaused, togglePause, stopPolling }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServerContext = () => {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error('useServerContext must be used within a ServerProvider');
  }
  return { ...context, isPolling: context.isPolling, pollingWebsiteIds: context.pollingWebsiteIds };
};