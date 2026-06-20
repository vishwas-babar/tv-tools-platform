const CANDLES = [
  { x: 40, h: 30, y: 90, bull: true },
  { x: 58, h: 45, y: 75, bull: true },
  { x: 76, h: 25, y: 95, bull: false },
  { x: 94, h: 50, y: 70, bull: true },
  { x: 112, h: 35, y: 85, bull: true },
  { x: 130, h: 40, y: 80, bull: false },
  { x: 148, h: 55, y: 65, bull: true },
  { x: 166, h: 30, y: 90, bull: false },
  { x: 184, h: 60, y: 60, bull: true },
  { x: 202, h: 35, y: 85, bull: true },
  { x: 220, h: 45, y: 75, bull: true },
  { x: 238, h: 25, y: 95, bull: false },
  { x: 256, h: 50, y: 70, bull: true },
  { x: 274, h: 40, y: 80, bull: true },
  { x: 292, h: 55, y: 65, bull: true },
];

export function HeroChart() {
  return (
    <div className="relative animate-fade-in-up" style={{ animationDelay: "300ms" }}>
      <div className="absolute -inset-4 rounded-2xl bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="absolute -inset-2 rounded-2xl bg-success/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface/80 shadow-2xl shadow-primary/10 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
          </div>
          <span className="text-xs font-medium text-foreground-muted">NIFTY 50 · 1H</span>
          <span className="text-sm font-semibold text-success">+1.24%</span>
        </div>

        <div className="relative aspect-[16/10] w-full">
          <svg viewBox="0 0 340 160" className="h-full w-full" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="20"
                y1={30 + i * 28}
                x2="320"
                y2={30 + i * 28}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            <path
              d="M 30 120 Q 80 100, 120 90 T 200 60 T 310 35"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-draw-line"
            />

            {CANDLES.map((c, i) => (
              <g
                key={i}
                className="animate-fade-in-candle"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <line
                  x1={c.x}
                  y1={c.y - 8}
                  x2={c.x}
                  y2={c.y + c.h + 8}
                  stroke={c.bull ? "#10b981" : "#ef4444"}
                  strokeWidth="1.5"
                  opacity="0.7"
                />
                <rect
                  x={c.x - 6}
                  y={c.y}
                  width="12"
                  height={c.h}
                  rx="1"
                  fill={c.bull ? "#10b981" : "#ef4444"}
                  opacity="0.9"
                />
              </g>
            ))}

            <g className="animate-fade-in-up" style={{ animationDelay: "1200ms" }}>
              <rect x="88" y="108" width="36" height="18" rx="4" fill="#10b981" />
              <text x="106" y="120" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                BUY
              </text>
            </g>

            <g className="animate-fade-in-up" style={{ animationDelay: "1600ms" }}>
              <rect x="168" y="48" width="36" height="18" rx="4" fill="#ef4444" />
              <text x="186" y="60" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                SELL
              </text>
            </g>
          </svg>
        </div>

        <div className="absolute bottom-4 left-4 animate-float rounded-lg border border-success/30 bg-surface/90 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs text-foreground-muted">Live</span>
          <span className="ml-2 text-sm font-bold text-success">22,847.50</span>
        </div>
      </div>
    </div>
  );
}
