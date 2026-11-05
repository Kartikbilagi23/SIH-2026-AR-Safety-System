
import { useMemo, useState } from "react";
import { RotateCw, ZoomIn, ZoomOut, Layers3, Maximize2 } from "lucide-react";
import ZoneLayer from "./ZoneLayer";
import WorkerMarker from "./WorkerMarker";

export type ZoneType = "safe" | "restricted" | "hazard" | "assembly";

export interface FloorZone {
  id: string;
  name: string;
  type: ZoneType;
  polygon: [number, number][];
  riskLevel?: string;
}

export interface FloorWorker {
  id: string;
  name: string;
  x: number;
  y: number;
  status: string;
  stale: boolean;
  zoneId?: string | null;
  zoneName?: string | null;
  lastSeen?: string;
}

interface SiteFloorMapProps {
  siteName: string;
  zones: FloorZone[];
  workers: FloorWorker[];
}

const FILTERS: { key: ZoneType; label: string }[] = [
  { key: "safe", label: "Safe" },
  { key: "restricted", label: "Restricted" },
  { key: "hazard", label: "Hazard" },
  { key: "assembly", label: "Assembly" },
];

export default function SiteFloorMap({
  siteName,
  zones,
  workers,
}: SiteFloorMapProps) {
  const [zoom, setZoom] = useState(1);
  const [rotated, setRotated] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState<string[]>(
    FILTERS.map((item) => item.key),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedZone, setSelectedZone] = useState<FloorZone | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<FloorWorker | null>(null);

  const transform = useMemo(() => {
    const angle = rotated ? 90 : 0;
    return `translate(500 280) rotate(${angle}) scale(${zoom}) translate(-500 -280)`;
  }, [zoom, rotated]);

  function toggleFilter(type: string) {
    setVisibleTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  return (
    <section className="dt-card dt-floor-card">
      <div className="dt-floor-heading">
        <div>
          <div className="dt-eyebrow">DIGITAL TWIN / LIVE MONITORING</div>
          <h2>{siteName}</h2>
          <p>Industrial floor layout · normalized site coordinates</p>
        </div>
        <div className="dt-live-status">
          <span className="dt-live-dot" />
          LIVE VIEW
        </div>
      </div>

      <div className="dt-map-toolbar">
        <button
          type="button"
          className="dt-tool-button"
          onClick={() => setRotated((value) => !value)}
          title="Rotate floor"
        >
          <RotateCw size={15} /> Rotate
        </button>
        <button
          type="button"
          className="dt-tool-button"
          onClick={() => setZoom((value) => Math.min(1.65, value + 0.1))}
          title="Zoom in"
        >
          <ZoomIn size={15} /> Zoom
        </button>
        <button
          type="button"
          className="dt-tool-button"
          onClick={() => setShowFilters((value) => !value)}
          title="Filter zone types"
        >
          <Layers3 size={15} /> Filter
        </button>
        <button
          type="button"
          className="dt-tool-button dt-reset-button"
          onClick={() => {
            setZoom(1);
            setRotated(false);
          }}
          title="Reset floor view"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {showFilters && (
        <div className="dt-filter-panel">
          {FILTERS.map((filter) => (
            <label key={filter.key}>
              <input
                type="checkbox"
                checked={visibleTypes.includes(filter.key)}
                onChange={() => toggleFilter(filter.key)}
              />
              {filter.label}
            </label>
          ))}
        </div>
      )}

      <div className="dt-floor-viewport">
        <svg
          className="dt-floor-svg"
          viewBox="0 0 1000 560"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Digital floor map for ${siteName}`}
        >
          <defs>
            <pattern
              id="floor-grid"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="#f0d9c4"
                strokeWidth="0.7"
                opacity="0.9"
              />
            </pattern>

            <linearGradient id="floor-base" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fff3e6" />
            </linearGradient>

            <radialGradient id="heat-safe">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.08" />
            </radialGradient>
            <radialGradient id="heat-restricted">
              <stop offset="0%" stopColor="#f0a500" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f0a500" stopOpacity="0.10" />
            </radialGradient>
            <radialGradient id="heat-hazard">
              <stop offset="0%" stopColor="#e5383b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#e5383b" stopOpacity="0.12" />
            </radialGradient>
            <radialGradient id="heat-assembly">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.08" />
            </radialGradient>

            <filter id="zone-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" />
            </filter>

            <filter id="floor-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1000" height="560" fill="#fffaf5" />

          <g transform={transform}>
            {/* Outer facility shell */}
            <polygon
              points="58,28 944,28 976,500 26,500"
              fill="url(#floor-base)"
              stroke="#ff7a00"
              strokeWidth="2"
              filter="url(#floor-glow)"
            />

            <polygon
              points="58,28 944,28 976,500 26,500"
              fill="url(#floor-grid)"
              opacity="0.95"
            />

            {/* Local floor guide lines */}
            {Array.from({ length: 13 }, (_, i) => (
              <line
                key={`v-${i}`}
                x1={100 + i * 65}
                y1="30"
                x2={80 + i * 70}
                y2="500"
                stroke="#f3dcc6"
                strokeWidth="0.7"
                opacity="0.8"
              />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={`h-${i}`}
                x1="32"
                y1={65 + i * 52}
                x2="970"
                y2={65 + i * 52}
                stroke="#f3dcc6"
                strokeWidth="0.7"
                opacity="0.8"
              />
            ))}

            {/* Subtle facility partitions */}
            <path
              d="M 80 215 L 920 215 M 365 40 L 365 475 M 690 40 L 690 475"
              stroke="#e0b992"
              strokeDasharray="5 8"
              fill="none"
              opacity="0.8"
            />

            <ZoneLayer
              zones={zones}
              visibleTypes={visibleTypes}
              onSelectZone={setSelectedZone}
            />

            {workers.map((worker) => (
              <WorkerMarker
                key={worker.id}
                worker={worker}
                selected={selectedWorker?.id === worker.id}
                onSelect={setSelectedWorker}
              />
            ))}
          </g>

          <text x="76" y="535" fill="#a08b78" fontSize="11" letterSpacing="2">
            FLOOR GRID / LOCAL COORDINATES
          </text>
          <text
            x="925"
            y="535"
            textAnchor="end"
            fill="#e56a00"
            fontSize="11"
            letterSpacing="2"
          >
            {workers.length.toString().padStart(2, "0")} PERSONNEL
          </text>
        </svg>

        {/* zoom control block unchanged */}
      </div>

      {(selectedZone || selectedWorker) && (
        <div className="dt-selection-details">
          {selectedZone && (
            <div>
              <span>SELECTED ZONE</span>
              <strong>{selectedZone.name}</strong>
              <small>{selectedZone.type.toUpperCase()} · {selectedZone.riskLevel ?? "Risk level not specified"}</small>
            </div>
          )}
          {selectedWorker && (
            <div>
              <span>SELECTED PERSONNEL</span>
              <strong>{selectedWorker.name}</strong>
              <small>
                {selectedWorker.id} · {selectedWorker.zoneName ?? "Zone unknown"} ·{" "}
                {selectedWorker.stale ? "STALE LOCATION" : "LIVE"}
              </small>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedZone(null);
              setSelectedWorker(null);
            }}
          >
            Clear selection
          </button>
        </div>
      )}
    </section>
  );
}
