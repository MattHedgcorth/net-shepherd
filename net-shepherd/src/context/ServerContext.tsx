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
  pollWebsites: () => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ServerData>(parseServerData(rawServerData));

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

  const pollWebsites = async () => {
    // Simulate polling websites
    const updatedServers = data.servers.map(server => ({
      ...server,
      websites: server.websites.map(website => ({
        ...website,
        status: {
          ...website.status,
          lastChecked: new Date().toISOString(),
          lastStatusCode: Math.random() > 0.2 ? 200 : [404, 500][Math.floor(Math.random() * 2)],
          responseTime: Math.random() > 0.2 ? Math.floor(Math.random() * 500) : 0,
          isRunning: Math.random() > 0.1
        }
      }))
    }));

    setData(prevData => ({
      ...prevData,
      servers: updatedServers
    }));
  };

  return (
    <ServerContext.Provider value={{ data, updateLayout, pollWebsites }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServerContext = () => {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error('useServerContext must be used within a ServerProvider');
  }
  return context;
};