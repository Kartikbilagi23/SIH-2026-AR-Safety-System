
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export type ZoneType =
  | "SAFE"
  | "RESTRICTED"
  | "HAZARD"
  | "ASSEMBLY";

export type HazardStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "RESOLVED";

export interface SitePoint {
  lat: number;
  lng: number;
}

export interface SiteZone {
  id: string;
  name: string;
  site: string;
  description: string | null;
  type: ZoneType;
  boundary: SitePoint[];
}

export interface WorkerOnMap {
  worker: {
    id: string;
    name: string;
    employeeId: string;
    sector: string | null;
    site: string | null;
  };
  location: {
    id: string;
    latitude: number;
    longitude: number;
    accuracyM: number | null;
    reportedAt: string;
    zone: {
      id: string;
      name: string;
      type: ZoneType;
    } | null;
  };
  stale: boolean;
}

export interface SiteHazard {
  id: string;
  site: string;
  zoneId: string | null;
  title: string;
  description: string | null;
  status: HazardStatus;
  latitude: number | null;
  longitude: number | null;
  reportedAt: string;
}

export interface SiteMapData {
  site: string;
  generatedAt: string;
  staleAfterSeconds: number;
  zones: SiteZone[];
  hazards: SiteHazard[];
  workers: WorkerOnMap[];
  summary: {
    zoneCount: number;
    unresolvedHazards: number;
    workersReporting: number;
    staleWorkers: number;
  };
}

export async function fetchSiteMap(
  site: string,
): Promise<SiteMapData> {
  const response = await fetch(
    `${API_BASE_URL}/site-safety/map?site=${encodeURIComponent(site)}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load site map (${response.status})`,
    );
  }

  const result: {
    success: boolean;
    data: SiteMapData;
  } = await response.json();

  if (!result.success) {
    throw new Error("Unable to load site safety data");
  }

  return result.data;
}
