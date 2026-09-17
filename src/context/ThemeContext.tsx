import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ isDark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("light");
    } else {
      html.classList.add("light");
    }
  }, [isDark]);

  return (
    <Ctx.Provider value={{ isDark, toggle: () => setIsDark((d) => !d) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
