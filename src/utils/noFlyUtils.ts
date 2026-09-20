export const HOURLY_FLYABILITY: { time: string; flyable: boolean }[] = [
  { time: "00:00", flyable: true  },
  { time: "01:00", flyable: true  },
  { time: "02:00", flyable: true  },
  { time: "03:00", flyable: true  },
  { time: "04:00", flyable: true  },
  { time: "05:00", flyable: true  },
  { time: "06:00", flyable: true  },
  { time: "07:00", flyable: true  },
  { time: "08:00", flyable: true  },
  { time: "09:00", flyable: true  },
  { time: "10:00", flyable: true  },
  { time: "11:00", flyable: true  },
  { time: "12:00", flyable: true  },
  { time: "13:00", flyable: false },
  { time: "14:00", flyable: false },
  { time: "15:00", flyable: false },
  { time: "16:00", flyable: true  },
  { time: "17:00", flyable: true  },
  { time: "18:00", flyable: true  },
  { time: "19:00", flyable: true  },
  { time: "20:00", flyable: true  },
  { time: "21:00", flyable: true  },
  { time: "22:00", flyable: true  },
  { time: "23:00", flyable: true  },
];

// Returns the no-fly block(s) as human-readable strings, e.g. ["13:00–16:00"]
export function noFlyWindows(): string[] {
  const blocked: string[] = [];
  let start: string | null = null;
  for (let i = 0; i < HOURLY_FLYABILITY.length; i++) {
    const h = HOURLY_FLYABILITY[i];
    if (!h.flyable && start === null) start = h.time;
    if ((h.flyable || i === HOURLY_FLYABILITY.length - 1) && start !== null) {
      const endHour = parseInt(h.flyable ? h.time : h.time) + (h.flyable ? 0 : 1);
      const endStr = `${String(endHour).padStart(2, "0")}:00`;
      blocked.push(`${start}–${endStr}`);
      start = null;
    }
  }
  return blocked;
}

// Check if a delivery arriving at now + etaMinutes would land in a no-fly hour
export function deliveryConflictsNoFly(etaMinutes: number): boolean {
  const arrival = new Date(Date.now() + etaMinutes * 60 * 1000);
  const arrivalHour = arrival.getHours();
  const entry = HOURLY_FLYABILITY.find(
    (h) => parseInt(h.time) === arrivalHour
  );
  return entry ? !entry.flyable : false;
}

// Check if the current hour itself is a no-fly hour (for dispatch)
export function currentHourIsNoFly(): boolean {
  const h = new Date().getHours();
  const entry = HOURLY_FLYABILITY.find((e) => parseInt(e.time) === h);
  return entry ? !entry.flyable : false;
}

// Returns flyable hours as formatted strings, e.g. ["12:00", "16:00", ...]
export function availableFlyHours(): string[] {
  return HOURLY_FLYABILITY.filter((h) => h.flyable).map((h) => h.time);
}

// Format an hour string as 12h, e.g. "13:00" → "1:00 PM"
export function fmt12(time: string): string {
  const h = parseInt(time);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${suffix}`;
}
