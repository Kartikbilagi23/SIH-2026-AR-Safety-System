import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  AlertTriangle,
  Activity,
  Users,
  ShieldAlert,
  Clock3,
  RefreshCw,
} from "lucide-react";

import {
  fetchSiteMap,
  type SiteMapData,
  type SiteZone,
  type WorkerOnMap,
} from "../../services/siteSafetyService";

import SiteFloorMap, {
  type FloorZone,
  type FloorWorker,
} from "./SiteFloorMap";
import Legend from "./Legend";
import AlertFeed, { type FloorAlert } from "./AlertFeed";
import "./SiteSafetyMap.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const DEFAULT_SITE = "Dhanbad Mine A";
const REFRESH_INTERVAL = 60_000;

// Demo data is all-or-nothing. Set VITE_DEMO_MODE=true in .env to use it.
// It is never mixed with real data.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const MOCK_ZONES: FloorZone[] = [
  {
    id: "mock-safe",
    name: "Main Safety Zone",
    type: "safe",
    polygon: [[0.05, 0.08], [0.48, 0.08], [0.48, 0.56], [0.05, 0.56]],
    riskLevel: "Low",
  },
  {
    id: "mock-hazard",
    name: "Hazard Zone A1",
    type: "hazard",
    polygon: [[0.56, 0.08], [0.94, 0.08], [0.94, 0.38], [0.56, 0.38]],
    riskLevel: "High",
  },
  {
    id: "mock-restricted",
    name: "Welding Station",
    type: "restricted",
    polygon: [[0.56, 0.46], [0.94, 0.46], [0.94, 0.76], [0.56, 0.76]],
    riskLevel: "Moderate",
  },
  {
    id: "mock-assembly",
    name: "Assembly Point",
    type: "assembly",
    polygon: [[0.05, 0.66], [0.40, 0.66], [0.40, 0.91], [0.05, 0.91]],
    riskLevel: "Low",
  },
];

const DEMO_WORKERS: FloorWorker[] = [
  {
    id: "DEMO-001",
    name: "Demo Worker 01",
    x: 0.3,
    y: 0.3,
    status: "stale",
    stale: true,
    zoneId: "mock-safe",
    zoneName: "Main Safety Zone",
    lastSeen: "Demo data",
  },
  {
    id: "DEMO-002",
    name: "Demo Worker 02",
    x: 0.68,
    y: 0.22,
    status: "live",
    stale: false,
    zoneId: "mock-hazard",
    zoneName: "Hazard Zone A1",
    lastSeen: "Demo data",
  },
  {
    id: "DEMO-003",
    name: "Demo Worker 03",
    x: 0.75,
    y: 0.59,
    status: "live",
    stale: false,
    zoneId: "mock-restricted",
    zoneName: "Welding Station",
    lastSeen: "Demo data",
  },
  {
    id: "DEMO-004",
    name: "Demo Worker 04",
    x: 0.22,
    y: 0.76,
    status: "stale",
    stale: true,
    zoneId: "mock-assembly",
    zoneName: "Assembly Point",
    lastSeen: "Demo data",
  },
  {
    id: "DEMO-005",
    name: "Demo Worker 05",
    x: 0.42,
    y: 0.42,
    status: "live",
    stale: false,
    zoneId: "mock-safe",
    zoneName: "Main Safety Zone",
    lastSeen: "Demo data",
  },
];

const zoneType = (type: SiteZone["type"]): FloorZone["type"] => {
  switch (type) {
    case "HAZARD":
      return "hazard";
    case "RESTRICTED":
      return "restricted";
    case "ASSEMBLY":
      return "assembly";
    default:
      return "safe";
  }
};

function clamp(value: number) {
  return Math.min(0.97, Math.max(0.03, value));
}

function getBounds(data: SiteMapData) {
  // Include worker positions too, so a worker outside every zone
  // is not squashed against the edge of the floor.
  const points = [
    ...data.zones.flatMap((zone) => zone.boundary ?? []).map((point) => ({
      lat: point.lat,
      lng: point.lng,
    })),
    ...data.workers.map((item) => ({
      lat: item.location.latitude,
      lng: item.location.longitude,
    })),
  ];

  if (points.length < 3) return null;

  const minLat = Math.min(...points.map((point) => point.lat));
  const maxLat = Math.max(...points.map((point) => point.lat));
  const minLng = Math.min(...points.map((point) => point.lng));
  const maxLng = Math.max(...points.map((point) => point.lng));

  // Avoid division by zero and add a little breathing room around the floor.
  const latPadding = Math.max((maxLat - minLat) * 0.05, 0.00001);
  const lngPadding = Math.max((maxLng - minLng) * 0.05, 0.00001);

  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding,
  };
}

function toFloorPoint(
  latitude: number,
  longitude: number,
  bounds: ReturnType<typeof getBounds>,
): [number, number] {
  if (!bounds) return [0.5, 0.5];

  const x = (longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng);
  const y = 1 - (latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat);

  return [clamp(x), clamp(y)];
}

function makeFloorZones(data: SiteMapData): FloorZone[] {
  const bounds = getBounds(data);

  const zones = data.zones
    .filter((zone) => Array.isArray(zone.boundary) && zone.boundary.length >= 3)
    .map((zone) => ({
      id: zone.id,
      name: zone.name,
      type: zoneType(zone.type),
      polygon: zone.boundary.map((point) =>
        toFloorPoint(point.lat, point.lng, bounds),
      ),
      riskLevel:
        zone.type === "HAZARD"
          ? "High"
          : zone.type === "RESTRICTED"
            ? "Moderate"
            : "Low",
    }));

  return zones;
}

function makeFloorWorkers(data: SiteMapData): FloorWorker[] {
  const bounds = getBounds(data);

  // Keep only the most recent location per worker.
  const latest = new Map<string, WorkerOnMap>();
  for (const item of data.workers) {
    const key = item.worker.employeeId || item.worker.id;
    const prev = latest.get(key);
    if (
      !prev ||
      new Date(item.location.reportedAt).getTime() >
        new Date(prev.location.reportedAt).getTime()
    ) {
      latest.set(key, item);
    }
  }

  return [...latest.values()].map((item: WorkerOnMap, index) => {
    const zone = item.location.zone;
    const [x, y] = bounds
      ? toFloorPoint(item.location.latitude, item.location.longitude, bounds)
      : [0.2 + (index % 5) * 0.14, 0.25 + (index % 3) * 0.2];

    return {
      id: item.worker.employeeId || item.worker.id,
      name: item.worker.name,
      x,
      y,
      status: item.stale ? "stale" : "live",
      stale: item.stale,
      zoneId: zone?.id,
      zoneName: zone?.name ?? "Unassigned",
      lastSeen: new Date(item.location.reportedAt).toLocaleString(),
    };
  });
}

function getAlerts(data: SiteMapData): FloorAlert[] {
  return data.hazards
    .slice()
    .sort(
      (a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime(),
    )
    .map((hazard) => ({
      id: hazard.id,
      title: hazard.title,
      description: hazard.description,
      status: hazard.status,
      reportedAt: hazard.reportedAt,
      site: hazard.site,
    }));
}

export default function SiteSafetyMap() {
  const [site, setSite] = useState(DEFAULT_SITE);
  const [data, setData] = useState<SiteMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMap = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      else setRefreshing(true);

      try {
        const result = await fetchSiteMap(site);
        setData(result);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load site safety data",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [site],
  );

  useEffect(() => {
    void loadMap();
    const interval = window.setInterval(
      () => void loadMap(true),
      REFRESH_INTERVAL,
    );

    return () => window.clearInterval(interval);
  }, [loadMap]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("[socket] init", { hasToken: !!token, url: SOCKET_URL });

    if (!token) {
      setSocketConnected(false);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
    });

    const onConnect = () => {
      console.log("[socket] connected", socket.id);
      setSocketConnected(true);
      socket.emit("site:join", site);
    };

    const onDisconnect = (reason: string) => {
      console.log("[socket] disconnected:", reason);
      setSocketConnected(false);
    };

    const onConnectError = (err: Error) => {
      console.error("[socket] connect_error:", err.message);
      setSocketConnected(false);
    };

    const refreshEvents = [
      "worker:location_updated",
      "worker:location_stale",
      "worker:hazard_zone_entered",
      "hazard:created",
      "hazard:updated",
      "zone:updated",
    ];

    const refresh = () => void loadMap(true);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    refreshEvents.forEach((event) => socket.on(event, refresh));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      refreshEvents.forEach((event) => socket.off(event, refresh));
      socket.disconnect();
    };
  }, [site, loadMap]);

  const zones = useMemo(() => {
    if (DEMO_MODE) return MOCK_ZONES;
    if (!data) return [];
    return makeFloorZones(data);
  }, [data]);

  const workers = useMemo(() => {
    if (DEMO_MODE) return DEMO_WORKERS;
    return data ? makeFloorWorkers(data) : [];
  }, [data]);

  const alerts = useMemo(() => (data ? getAlerts(data) : []), [data]);

  const highRiskWorkerCount = workers.filter((worker) => {
    const matchingZone = zones.find((zone) => zone.id === worker.zoneId);
    return matchingZone?.type === "hazard";
  }).length;

  const hazardZoneCount = zones.filter((zone) => zone.type === "hazard").length;
  const criticalAlerts =
    data?.hazards.filter((hazard) => hazard.status === "OPEN").length ?? 0;
  const staleCount = workers.filter((worker) => worker.stale).length;

  const trendValues = [2, 4, 3, 6, 4, 7];
  const trendDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <section className="site-safety-dashboard">
      <header className="dt-dashboard-header">
        <div>
          <div className="dt-eyebrow">INDUSTRIAL SAFETY OPERATIONS</div>
          <h2>Digital Site Safety Map</h2>
          <p>Personnel tracking, site hazards and live safety monitoring</p>
        </div>

        <div className="dt-header-actions">
          <label className="dt-site-selector">
            <span>SITE</span>
            <select
              value={site}
              onChange={(event) => setSite(event.target.value)}
            >
              <option value="Dhanbad Mine A">Dhanbad Mine A</option>
            </select>
          </label>

          <button
            type="button"
            className="dt-tool-button"
            onClick={() => void loadMap(true)}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? "dt-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      <div className="dt-status-line">
        <span
          className={socketConnected ? "dt-live-dot" : "dt-status-dot--offline"}
        />
        {socketConnected
          ? "REAL-TIME CONNECTION ACTIVE"
          : "POLLING MODE / SOCKET OFFLINE"}
        <span className="dt-status-divider">·</span>
        {lastUpdated
          ? `Updated ${lastUpdated.toLocaleTimeString()}`
          : "Waiting for site data"}
        {DEMO_MODE && (
          <>
            <span className="dt-status-divider">·</span>
            <span className="dt-loading-text">DEMO DATA</span>
          </>
        )}
        {loading && <span className="dt-loading-text">Loading…</span>}
      </div>

      {error && (
        <div className="dt-error" role="alert">
          <AlertTriangle size={17} />
          <span>{error}</span>
          <button type="button" onClick={() => void loadMap()}>
            Retry
          </button>
        </div>
      )}

      <div className="dt-top-metrics">
        <Metric
          label="TOTAL HAZARD AREAS"
          value={String(hazardZoneCount)}
          sublabel="Mapped high-risk zones"
          icon={<ShieldAlert size={18} />}
          color="red"
        />
        <Metric
          label="CRITICAL ALERTS"
          value={String(criticalAlerts)}
          sublabel="Open hazard reports"
          icon={<AlertTriangle size={18} />}
          color="amber"
        />
        <Metric
          label="PERSONNEL IN HIGH RISK"
          value={String(highRiskWorkerCount)}
          sublabel="Inside mapped hazard zones"
          icon={<Users size={18} />}
          color="cyan"
        />
        <Metric
          label="STALE LOCATIONS"
          value={String(staleCount)}
          sublabel="No update within 15 minutes"
          icon={<Clock3 size={18} />}
          color="slate"
        />
      </div>

      <div className="dt-main-grid">
        <aside className="dt-left-column">
          <Legend zones={zones} />
          <section className="dt-card dt-worker-list">
            <div className="dt-card-heading">
              <span>WORKER LOCATIONS</span>
              <span className="dt-count">{workers.length} TRACKED</span>
            </div>

            <div className="dt-worker-list-body">
              {workers.length === 0 ? (
                <div className="dt-empty">
                  {loading
                    ? "Loading personnel…"
                    : "No worker locations reported."}
                </div>
              ) : (
                workers.map((worker) => (
                  <div className="dt-worker-row" key={worker.id}>
                    <span
                      className={`dt-worker-avatar ${
                        worker.stale ? "dt-worker-avatar--stale" : ""
                      }`}
                    >
                      {worker.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="dt-worker-copy">
                      <strong>{worker.name}</strong>
                      <small>{worker.id}</small>
                      <small>{worker.zoneName ?? "Zone unknown"}</small>
                    </div>
                    <span
                      className={`dt-worker-status ${
                        worker.stale ? "is-stale" : "is-live"
                      }`}
                    >
                      {worker.stale ? "STALE" : "LIVE"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>

        <div className="dt-center-column">
          <SiteFloorMap siteName={site} zones={zones} workers={workers} />
        </div>

        <aside className="dt-right-column">
          <section className="dt-card dt-trend-card">
            <div className="dt-card-heading">
              <span>INCIDENT TRENDS</span>
              <Activity size={16} />
            </div>
            <p className="dt-panel-subtitle">Reported incidents · Mon–Sat</p>

            <div className="dt-bar-chart">
              {trendValues.map((value, index) => (
                <div className="dt-bar-column" key={trendDays[index]}>
                  <span>{value}</span>
                  <div className="dt-bar-track">
                    <div
                      className="dt-bar"
                      style={{ height: `${(value / 7) * 100}%` }}
                    />
                  </div>
                  <small>{trendDays[index]}</small>
                </div>
              ))}
            </div>
            <p className="dt-chart-note">
              Illustrative trend until incident-history aggregation is
              connected.
            </p>
          </section>

          <AlertFeed alerts={alerts} />

          <section className="dt-card dt-system-card">
            <div className="dt-card-heading">
              <span>SYSTEM HEALTH</span>
              <span
                className={socketConnected ? "dt-health-good" : "dt-health-warn"}
              >
                {socketConnected ? "CONNECTED" : "POLLING"}
              </span>
            </div>
            <div className="dt-system-row">
              <span>Map data API</span>
              <strong>
                {data ? "Available" : loading ? "Loading" : "Unavailable"}
              </strong>
            </div>
            <div className="dt-system-row">
              <span>Refresh interval</span>
              <strong>60 seconds</strong>
            </div>
            <div className="dt-system-row">
              <span>Location stale threshold</span>
              <strong>15 minutes</strong>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

interface MetricProps {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  color: "red" | "amber" | "cyan" | "slate";
}

function Metric({ label, value, sublabel, icon, color }: MetricProps) {
  return (
    <article className={`dt-metric dt-metric--${color}`}>
      <div className="dt-metric-top">
        <span>{label}</span>
        {icon}
      </div>
      <strong className="dt-metric-value">{value}</strong>
      <span className="dt-metric-subtitle">{sublabel}</span>
    </article>
  );
}