import type { FloorWorker } from "./SiteFloorMap";

interface WorkerMarkerProps {
  worker: FloorWorker;
  selected?: boolean;
  onSelect?: (worker: FloorWorker) => void;
}

export default function WorkerMarker({
  worker,
  selected = false,
  onSelect,
}: WorkerMarkerProps) {
  const x = 80 + worker.x * 840;
  const y = 45 + worker.y * 445;
  const stale = worker.stale || worker.status === "stale";

  const color = stale ? "#8a94a0" : "#ff7a00";      // marker ring and dot
  const labelText = stale ? "#5f6b78" : "#c2570a";  // darker so it reads on white

  return (
    <g
      className={`worker-marker ${stale ? "worker-marker--stale" : ""}`}
      transform={`translate(${x}, ${y})`}
      onClick={() => onSelect?.(worker)}
      role="button"
      tabIndex={0}
      aria-label={`Worker ${worker.name}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect?.(worker);
        }
      }}
    >
      <title>
        {worker.name}
        {" · ID: "}
        {worker.id}
        {" · Zone: "}
        {worker.zoneName ?? "Unassigned"}
        {" · Last seen: "}
        {worker.lastSeen ?? "Unknown"}
        {" · Status: "}
        {stale ? "STALE LOCATION" : "LIVE"}
      </title>

      {stale && (
        <circle
          className="worker-pulse"
          r="17"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      )}

      <circle
        r={selected ? 12 : 9}
        fill="#ffffff"
        stroke={color}
        strokeWidth="2"
      />
      <circle r="3.5" fill={color} />

      {selected && (
        <circle
          r="15"
          fill="none"
          stroke={color}
          strokeDasharray="3 4"
          opacity="0.9"
        />
      )}

      <g transform="translate(14, -14)">
        <rect
          x="0"
          y="0"
          width={Math.min(120, Math.max(65, worker.name.length * 6 + 16))}
          height="21"
          rx="4"
          fill="#ffffff"
          stroke={color}
          strokeOpacity="0.8"
        />
        <text x="7" y="14" fill={labelText} className="worker-name-label">
          {worker.name.slice(0, 16)}
        </text>
      </g>
    </g>
  );
}