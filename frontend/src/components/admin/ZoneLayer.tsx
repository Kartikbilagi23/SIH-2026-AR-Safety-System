import type { FloorZone } from "./SiteFloorMap";

interface ZoneLayerProps {
  zones: FloorZone[];
  visibleTypes: string[];
  onSelectZone?: (zone: FloorZone) => void;
}

const COLORS: Record<string, string> = {
  safe: "#16a34a",
  restricted: "#f0a500",
  hazard: "#e5383b",
  assembly: "#0ea5e9",
};

export default function ZoneLayer({
  zones,
  visibleTypes,
  onSelectZone,
}: ZoneLayerProps) {
  return (
    <g className="zone-layer">
      {zones
        .filter((zone) => visibleTypes.includes(zone.type))
        .map((zone) => {
          const color = COLORS[zone.type] ?? COLORS.safe;
          const points = zone.polygon
            .map(([x, y]) => `${80 + x * 840},${45 + y * 445}`)
            .join(" ");

          const center = zone.polygon.reduce(
            (acc, point) => ({
              x: acc.x + point[0] / zone.polygon.length,
              y: acc.y + point[1] / zone.polygon.length,
            }),
            { x: 0, y: 0 },
          );

          const cx = 80 + center.x * 840;
          const cy = 45 + center.y * 445;

          return (
            <g
              key={zone.id}
              className={`floor-zone floor-zone--${zone.type}`}
              onClick={() => onSelectZone?.(zone)}
              role="button"
              tabIndex={0}
              aria-label={zone.name}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onSelectZone?.(zone);
                }
              }}
            >
              <title>
                {zone.name}
                {" — "}
                {zone.type.toUpperCase()}
                {zone.riskLevel ? ` — ${zone.riskLevel} risk` : ""}
              </title>

              <polygon
                points={points}
                fill={`url(#heat-${zone.type})`}
                stroke={color}
                strokeWidth={zone.type === "hazard" ? 1.8 : 1.2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />

              <polygon
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="5"
                opacity={zone.type === "hazard" ? 0.3 : 0.15}
                filter="url(#zone-blur)"
                className={
                  zone.type === "hazard" ? "hazard-glow" : undefined
                }
                pointerEvents="none"
              />

              <g
                transform={`translate(${cx}, ${cy})`}
                className="zone-label"
                pointerEvents="none"
              >
                <rect
                  x="-75"
                  y="-13"
                  width="150"
                  height="26"
                  rx="5"
                  fill="#ffffff"
                  fillOpacity="0.96"
                  stroke={color}
                  strokeOpacity="0.9"
                />
                <circle cx="-64" cy="0" r="3" fill={color} />
                <text x="-55" y="4" fill="#1f2933">
                  {zone.name.toUpperCase().slice(0, 22)}
                </text>
              </g>
            </g>
          );
        })}
    </g>
  );
}