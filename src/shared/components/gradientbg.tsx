export function gradientbg() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "oklch(0.75 0.15 195)",
          opacity: 0.12,
          filter: "blur(90px)",
          top: -150,
          left: -150,
          animation: "gradientDrift1 14s ease-in-out infinite alternate",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "oklch(0.65 0.18 280)",
          opacity: 0.1,
          filter: "blur(100px)",
          bottom: -100,
          right: -100,
          animation: "gradientDrift2 18s ease-in-out infinite alternate",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "oklch(0.7 0.15 145)",
          opacity: 0.07,
          filter: "blur(110px)",
          top: "40%",
          left: "45%",
          animation: "gradientDrift3 22s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
