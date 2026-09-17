import { useEffect, useMemo, useState } from "react";

export interface MapDrone {
  id: string;
  x: number;   // 0-100 % initial position
  y: number;
  altitude: number;
  speed: number;
  battery: number;
  status: "in_flight" | "standby" | "loading" | "maintenance";
}

interface DroneMapProps {
  drones: MapDrone[];
  accentColor?: string;
  onDroneSelect?: (id: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  in_flight:   "#00d4ff",
  standby:     "#22c55e",
  loading:     "#f59e0b",
  maintenance: "#ef4444",
};

export default function DroneMap({ drones, accentColor = "#00d4ff", onDroneSelect }: DroneMapProps) {
  const patternId = useMemo(() => `grid-${Math.random().toString(36).slice(2)}`, []);

  // Live positions — each drone drifts independently when in_flight
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(drones.map((d) => [d.id, { x: d.x, y: d.y }]))
  );
  const [selectedId, setSelectedId] = useState<string>(drones[0]?.id ?? "");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setPositions((prev) => {
        const next = { ...prev };
        drones.forEach((d) => {
          if (d.status === "in_flight") {
            const cur = prev[d.id] ?? { x: d.x, y: d.y };
            next[d.id] = {
              x: Math.max(10, Math.min(88, cur.x + (Math.random() - 0.5) * 1.6)),
              y: Math.max(10, Math.min(82, cur.y + (Math.random() - 0.5) * 1.6)),
            };
          }
        });
        return next;
      });
    }, 1100);
    return () => clearInterval(id);
  }, [drones]);

  function handleDroneClick(id: string) {
    setSelectedId(id);
    onDroneSelect?.(id);
  }

  const selected = drones.find((d) => d.id === selectedId) ?? drones[0];
  const selPos   = positions[selected?.id] ?? { x: 55, y: 42 };
  const selColor = STATUS_COLOR[selected?.status] ?? accentColor;

  return (
    <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>

      {/* ── Map area ── */}
      <div className="relative select-none" style={{ height: 300, background: "linear-gradient(135deg,#060a0f 0%,#0a1018 60%,#060a0f 100%)" }}>

        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-15" aria-hidden="true">
          <defs>
            <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={accentColor} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>

        {/* Topo rings */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
          {[50, 80, 110, 140, 170].map((r, i) => (
            <ellipse key={i} cx="50%" cy="52%" rx={r} ry={r * 0.48} fill="none" stroke={accentColor} strokeWidth="0.5" />
          ))}
        </svg>

        {/* Flight paths — selected drone only */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          {selected?.status === "in_flight" && (
            <>
              <line x1="14%" y1="76%" x2={`${selPos.x}%`} y2={`${selPos.y}%`} stroke={selColor} strokeWidth="1" strokeDasharray="5 4" opacity="0.3" />
              <line x1={`${selPos.x}%`} y1={`${selPos.y}%`} x2="79%" y2="27%" stroke={selColor} strokeWidth="1" strokeDasharray="5 4" opacity="0.18" />
            </>
          )}
        </svg>

        {/* Markers */}
        <MapMarker x="79%" y="27%" color="#22c55e" label="Drop Zone" />
        <MapMarker x="14%" y="76%" color="#4a6080"  label="Depot"     small />

        {/* Drone dots */}
        {drones.map((d) => {
          const pos   = positions[d.id] ?? { x: d.x, y: d.y };
          const color = STATUS_COLOR[d.status];
          const isSel = d.id === selectedId;
          return (
            <button
              key={d.id}
              onClick={() => handleDroneClick(d.id)}
              className="absolute transition-all duration-1000 focus:outline-none group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)" }}
              title={`${d.id} — ${d.status.replace("_", " ")}`}
            >
              {/* Ping — selected only */}
              {isSel && d.status === "in_flight" && (
                <div
                  className="absolute rounded-full"
                  style={{ width: 36, height: 36, top: -10, left: -10, border: `1.5px solid ${color}`, opacity: 0.35, animation: "ping 2s ease-out infinite" }}
                />
              )}
              {/* Main dot */}
              <div
                className="flex items-center justify-center rounded-full border-2 transition-all duration-200"
                style={{
                  width:  isSel ? 36 : 22,
                  height: isSel ? 36 : 22,
                  borderColor:     color,
                  backgroundColor: color + (isSel ? "25" : "18"),
                  boxShadow:       isSel ? `0 0 12px ${color}66` : "none",
                }}
              >
                <DroneIcon color={color} size={isSel ? 16 : 10} />
              </div>
              {/* Label */}
              <div
                className="absolute font-mono whitespace-nowrap pointer-events-none transition-all"
                style={{
                  top:       isSel ? -18 : -14,
                  left:      "50%",
                  transform: "translateX(-50%)",
                  fontSize:  isSel ? 9 : 7,
                  color,
                  fontWeight: isSel ? 700 : 400,
                }}
              >
                {d.id}
              </div>
            </button>
          );
        })}

        {/* Corner coords */}
        <div className="absolute top-3 left-3 font-mono text-[9px] text-[#3a5070] leading-tight pointer-events-none">
          <div>52.3721°N</div>
          <div>4.8952°E</div>
        </div>

        {/* Live badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
          <span className="live-dot w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
          <span className="font-mono text-[9px]" style={{ color: accentColor }}>LIVE</span>
        </div>

        {/* Selected drone info card */}
        {selected && (
          <div
            className="absolute bottom-3 right-3 rounded-xl px-3 py-2 border backdrop-blur-sm"
            style={{ backgroundColor: "rgba(7,11,16,0.92)", borderColor: selColor + "44", minWidth: 130 }}
          >
            <div className="font-mono text-[9px] mb-1.5" style={{ color: selColor }}>{selected.id}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {[
                { l: "Alt", v: `${selected.altitude} m` },
                { l: "Spd", v: `${selected.speed} m/s` },
                { l: "Bat", v: `${selected.battery}%` },
                { l: "Sig", v: selected.status === "maintenance" ? "LOST" : "95%" },
              ].map((s) => (
                <div key={s.l}>
                  <span className="font-mono text-[8px] text-[#4a6080]">{s.l} </span>
                  <span className="font-mono text-[9px]" style={{ color: selColor }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Telemetry bar ── */}
      <div className="border-t px-4 py-2.5 flex items-center gap-1 overflow-x-auto" style={{ borderColor: "var(--g-bd)", backgroundColor: "var(--g-bg)" }}>
        {/* Drone selector pills */}
        {drones.map((d) => (
          <button
            key={d.id}
            onClick={() => handleDroneClick(d.id)}
            className="shrink-0 font-mono text-[10px] px-2.5 py-1 rounded-lg border transition-all"
            style={
              d.id === selectedId
                ? { borderColor: STATUS_COLOR[d.status], backgroundColor: STATUS_COLOR[d.status] + "18", color: STATUS_COLOR[d.status] }
                : { borderColor: "var(--g-bd)", backgroundColor: "transparent", color: "var(--g-tx2)" }
            }
          >
            {d.id}
          </button>
        ))}
        <div className="w-px h-4 mx-2 shrink-0" style={{ backgroundColor: "var(--g-bd)" }} />
        {/* Live coords */}
        {[
          { label: "Lat", value: `52.${String(3721 + (tick % 99)).padStart(4, "0")}°N` },
          { label: "Lon", value: `4.${String(8952 + (tick % 99)).padStart(4, "0")}°E` },
        ].map((s) => (
          <div key={s.label} className="shrink-0">
            <span className="font-mono text-[9px] text-[#4a6080]">{s.label} </span>
            <span className="font-mono text-[10px] tabular-nums" style={{ color: accentColor }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapMarker({ x, y, color, label, small }: { x: string; y: string; color: string; label: string; small?: boolean }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}>
      <div className={`rounded-full border-2 flex items-center justify-center ${small ? "w-3 h-3" : "w-4 h-4"}`} style={{ borderColor: color + "99", backgroundColor: color + "18" }}>
        <div className={`rounded-full ${small ? "w-1 h-1" : "w-1.5 h-1.5"}`} style={{ backgroundColor: color }} />
      </div>
      <div className="font-mono text-[8px] mt-0.5 whitespace-nowrap text-center" style={{ color }}>{label}</div>
    </div>
  );
}

function DroneIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" fill={color} />
      <path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="5"  cy="5"  r="2" fill={color} opacity="0.5" />
      <circle cx="19" cy="5"  r="2" fill={color} opacity="0.5" />
      <circle cx="5"  cy="19" r="2" fill={color} opacity="0.5" />
      <circle cx="19" cy="19" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}
