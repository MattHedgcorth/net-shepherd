export type WebsiteType = 'website' | 'api' | 'website-redirect';
export type TechnologyType = '.Net' | '.Net Core' | 'React' | 'WordPress' | 'HTML' | 'PHP' | 'Other';

export interface WebsiteStatus {
  isRunning: boolean;
  lastStatusCode: number;
  lastChecked: string;
  responseTime: number;
}

export interface Website {
  id: string;
  name: string;
  type: WebsiteType;
  technology: TechnologyType;
  primaryUrl: string;
  additionalUrls: string[];
  status: WebsiteStatus;
  screenshot: string | null;
}

export interface Server {
  id: string;
  commonName: string;
  machineName: string;
  ipAddresses: string[];
  icon: string;
  websites: Website[];
}

export interface ServerStats {
  totalWebsites: number;
  runningWebsites: number;
  offlineWebsites: number;
  respondingWebsites: number;
}

export interface GridLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UserLayouts {
  [username: string]: {
    layout: GridLayout[];
  };
}

export interface ServerData {
  servers: Server[];
  userLayouts: UserLayouts;
}

export interface ServerGridItemProps {
  server: Server;
  stats: ServerStats;
  onServerClick: (serverId: string) => void;
}

export interface WebsiteListItemProps {
  website: Website;
  onScreenshotClick: (screenshot: string) => void;
}