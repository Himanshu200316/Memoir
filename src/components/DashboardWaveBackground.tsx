const WAVE_PATHS = [
  {
    d: "M0,192L60,197.3C120,203,240,213,360,202.7C480,192,600,160,720,154.7C840,149,960,171,1080,181.3C1200,192,1320,192,1380,192L1440,192L1440,320L0,320Z",
    color: "var(--memoir-primary)",
    opacity: 0.08,
    height: "40vh",
    animationClass: "animate-wave-drift-slow",
  },
  {
    d: "M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,229.3C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z",
    color: "var(--memoir-secondary)",
    opacity: 0.06,
    height: "32vh",
    animationClass: "animate-wave-drift",
  },
  {
    d: "M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,229.3C1120,235,1280,213,1360,202.7L1440,192L1440,320L0,320Z",
    color: "var(--memoir-accent)",
    opacity: 0.05,
    height: "24vh",
    animationClass: "animate-wave-drift-slow",
  },
];

export default function DashboardWaveBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {WAVE_PATHS.map((wave, i) => (
        <svg
          key={i}
          className={`absolute bottom-0 left-0 w-[200%] max-w-none ${wave.animationClass}`}
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          style={{ height: wave.height }}
        >
          <path d={wave.d} fill={wave.color} fillOpacity={wave.opacity} />
          <path d={wave.d} fill={wave.color} fillOpacity={wave.opacity} transform="translate(1440, 0)" />
        </svg>
      ))}
    </div>
  );
}
