import type { FloorZone } from "./SiteFloorMap";

interface LegendProps {
  zones: FloorZone[];
}

const items = [
  { key: "safe", label: "Safe zone", color: "#16a34a" },
  { key: "restricted", label: "Moderate / Restricted", color: "#f0a500" },
  { key: "hazard", label: "High hazard", color: "#e5383b" },
  { key: "assembly", label: "Assembly point", color: "#0ea5e9" },
] as const;

// Shoelace formula on the normalized (0..1) polygon points
function polygonArea(points: [number, number][]) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

export default function Legend({ zones }: LegendProps) {
  const areaByType: Record<string, number> = {
    safe: 0,
    restricted: 0,
    hazard: 0,
    assembly: 0,
  };

  for (const zone of zones) {
    areaByType[zone.type] += polygonArea(zone.polygon);
  }

  const totalArea = Object.values(areaByType).reduce((a, b) => a + b, 0);

  const percentFor = (key: string) =>
    totalArea > 0 ? Math.round((areaByType[key] / totalArea) * 100) : null;

  return (
    <section className="dt-card dt-legend">
      <div className="dt-card-heading">
        <span>ZONE LEGEND</span>
        <span className="dt-live-dot" />
      </div>

      {items.map((item) => {
        const percent = percentFor(item.key);
        return (
          <div className="legend-row" key={item.key}>
            <span
              className="legend-swatch"
              style={{ background: item.color }}
            />
            <span className="legend-label">{item.label}</span>
            <strong>{percent === null ? "–" : `${percent}%`}</strong>
          </div>
        );
      })}

      <div className="legend-note">
        <span className="legend-swatch legend-swatch--stale" />
        <span>Stale worker location</span>
      </div>
    </section>
  );
}