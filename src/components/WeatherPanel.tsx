interface WeatherPanelProps {
  accentColor?: string;
}

const HOURLY = [
  { time: "00:00", temp: 13, wind:  7, gusts: 10, vis: 9.0, flyable: true  },
  { time: "01:00", temp: 13, wind:  6, gusts:  9, vis: 8.5, flyable: true  },
  { time: "02:00", temp: 12, wind:  6, gusts:  8, vis: 8.0, flyable: true  },
  { time: "03:00", temp: 12, wind:  5, gusts:  7, vis: 7.5, flyable: true  },
  { time: "04:00", temp: 11, wind:  5, gusts:  7, vis: 7.0, flyable: true  },
  { time: "05:00", temp: 11, wind:  6, gusts:  8, vis: 7.5, flyable: true  },
  { time: "06:00", temp: 12, wind:  7, gusts:  9, vis: 8.5, flyable: true  },
  { time: "07:00", temp: 14, wind:  9, gusts: 13, vis: 9.0, flyable: true  },
  { time: "08:00", temp: 17, wind: 12, gusts: 18, vis: 9.5, flyable: true  },
  { time: "09:00", temp: 18, wind: 14, gusts: 22, vis: 10,  flyable: true  },
  { time: "10:00", temp: 19, wind: 11, gusts: 16, vis: 10,  flyable: true  },
  { time: "11:00", temp: 20, wind: 10, gusts: 14, vis: 10,  flyable: true  },
  { time: "12:00", temp: 21, wind: 13, gusts: 19, vis: 9,   flyable: true  },
  { time: "13:00", temp: 21, wind: 18, gusts: 28, vis: 8,   flyable: false },
  { time: "14:00", temp: 20, wind: 22, gusts: 34, vis: 7,   flyable: false },
  { time: "15:00", temp: 19, wind: 19, gusts: 29, vis: 7,   flyable: false },
  { time: "16:00", temp: 18, wind: 15, gusts: 21, vis: 8.5, flyable: true  },
  { time: "17:00", temp: 17, wind: 12, gusts: 17, vis: 9,   flyable: true  },
  { time: "18:00", temp: 16, wind: 10, gusts: 14, vis: 9.5, flyable: true  },
  { time: "19:00", temp: 15, wind:  9, gusts: 12, vis: 9.5, flyable: true  },
  { time: "20:00", temp: 15, wind:  8, gusts: 11, vis: 9.0, flyable: true  },
  { time: "21:00", temp: 14, wind:  7, gusts: 10, vis: 8.5, flyable: true  },
  { time: "22:00", temp: 14, wind:  7, gusts:  9, vis: 8.0, flyable: true  },
  { time: "23:00", temp: 13, wind:  6, gusts:  8, vis: 8.0, flyable: true  },
];

export default function WeatherPanel({ accentColor = "#00d4ff" }: WeatherPanelProps) {
  const currentHour = new Date().getHours();
  const currentTimeStr = `${String(currentHour).padStart(2, "0")}:00`;
  const now = HOURLY.find((h) => h.time === currentTimeStr) ?? HOURLY[HOURLY.length - 1];

  return (
    <div className="space-y-4">
      {/* Current conditions */}
      <div className="border rounded-xl p-6" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
        <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--g-tx2)" }}>Current Conditions — Amsterdam Delivery Zone</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Temperature", value: `${now.temp}°C`,      sub: `Feels ${now.temp - 2}°C`,       icon: "🌤", ok: true },
            { label: "Wind Speed",  value: `${now.wind} km/h`,   sub: `Gusts ${now.gusts} km/h`,       icon: "💨", ok: now.gusts <= 25 },
            { label: "Visibility",  value: `${now.vis} km`,      sub: now.vis >= 9 ? "Clear" : now.vis >= 7 ? "Moderate" : "Poor", icon: "👁", ok: now.vis >= 7 },
            { label: "Drone Ops",   value: now.flyable ? "GO" : "NO-GO", sub: now.flyable ? "Conditions nominal" : "High winds / low vis", icon: now.flyable ? "✅" : "🚫", ok: now.flyable },
          ].map((c) => (
            <div key={c.label} className="text-center">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--g-tx2)" }}>{c.label}</div>
              <div className="font-mono text-lg font-bold" style={{ color: c.ok ? accentColor : "#ef4444" }}>{c.value}</div>
              <div className="font-mono text-[10px]" style={{ color: "var(--g-tx2)" }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly flyability */}
      <div className="border rounded-xl p-5" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
        <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--g-tx2)" }}>Hourly Flyability Forecast</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--g-bd)" }}>
                {["Time", "Temp", "Wind", "Gusts", "Visibility", "Status"].map((h) => (
                  <th key={h} className="pb-2 px-3 text-left font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURLY.map((h) => {
                const isCurrent = h.time === currentTimeStr;
                return (
                  <tr
                    key={h.time}
                    className="border-b last:border-0 transition-colors"
                    style={{ borderColor: "var(--g-s2)", backgroundColor: isCurrent ? "var(--g-s2)" : "transparent" }}
                  >
                    <td className="py-2 px-3 font-mono text-[11px]" style={{ color: isCurrent ? accentColor : "var(--g-tx2)" }}>
                      {h.time}{isCurrent && " ◄"}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "var(--g-tx)" }}>{h.temp}°C</td>
                    <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "var(--g-tx)" }}>{h.wind} km/h</td>
                    <td className="py-2 px-3 font-mono text-[11px]" style={{ color: h.gusts > 25 ? "#ef4444" : "var(--g-tx)" }}>{h.gusts} km/h</td>
                    <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "var(--g-tx)" }}>{h.vis} km</td>
                    <td className="py-2 px-3">
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                        style={{
                          color: h.flyable ? "#22c55e" : "#ef4444",
                          borderColor: (h.flyable ? "#22c55e" : "#ef4444") + "44",
                          backgroundColor: (h.flyable ? "#22c55e" : "#ef4444") + "11",
                        }}
                      >
                        {h.flyable ? "FLY" : "NO-FLY"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-4 border-t font-mono text-[10px]" style={{ borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}>
          ⚠ No-fly window: 13:00–15:00 due to elevated wind gusts (&gt;25 km/h). Schedule deliveries accordingly.
        </div>
      </div>
    </div>
  );
}
