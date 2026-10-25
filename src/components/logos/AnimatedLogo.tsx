"use client";

import { useState, useEffect } from "react";
import SuperPDFIcon from "./SuperPDFIcon";
import SuperPDFNameLogo from "./SuperPDFLogo";

export default function AnimatedLogo({
  height = 36,
  autoHide = true,
}: {
  height?: number;
  autoHide?: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!autoHide) return;
    const timer = setTimeout(() => setHidden(true), 5000);
    return () => clearTimeout(timer);
  }, [autoHide]);

  const nameVisible = hovered || !hidden;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        width: "fit-content",
        height,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          height: "100%",
        }}
      >
        <SuperPDFIcon style={{ height: "100%", width: "auto" }} />
      </div>
      <div style={{ height: "100%", overflow: "hidden", width: 150 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            transition:
              "opacity 500ms ease-in-out, transform 500ms ease-in-out",
            opacity: nameVisible ? 1 : 0,
            transform: nameVisible ? "translateX(0)" : "translateX(-10px)",
            visibility: nameVisible ? "visible" : "hidden",
          }}
        >
          <SuperPDFNameLogo style={{ height: "100%", width: "auto" }} />
        </div>
      </div>
    </div>
  );
}
