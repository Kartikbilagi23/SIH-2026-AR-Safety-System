
export interface FloorAlert {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  reportedAt: string;
  site?: string;
}

interface AlertFeedProps {
  alerts: FloorAlert[];
}

function severity(status: string) {
  if (status === "OPEN") return "critical";
  if (status === "INVESTIGATING") return "warning";
  return "resolved";
}

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertFeed({ alerts }: AlertFeedProps) {
  return (
    <section className="dt-card dt-alert-feed">
      <div className="dt-card-heading">
        <span>ALERT FEED</span>
        <span className="dt-count">{alerts.length} EVENTS</span>
      </div>

      <div className="alert-feed-list">
        {alerts.length === 0 ? (
          <div className="dt-empty">No hazard reports for this site.</div>
        ) : (
          alerts.map((alert) => {
            const level = severity(alert.status);

            return (
              <article className="alert-item" key={alert.id}>
                <div className={`alert-indicator alert-indicator--${level}`} />
                <div className="alert-copy">
                  <strong>{alert.title}</strong>
                  <p>{alert.description || alert.site || "Site hazard report"}</p>
                  <time>{timeLabel(alert.reportedAt)}</time>
                </div>
                <span className={`severity-badge severity-badge--${level}`}>
                  {level}
                </span>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
