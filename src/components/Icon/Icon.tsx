export default function Icon({ name, size = 32 }: { name: string; size?: number }) {
  const common = { width: size, height: size, flexShrink: 0 }
  const sp = { viewBox: "0 0 24 24", style: common, fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const }
  switch (name) {
    case "arrow-right":
      return (
        <svg {...sp}>
          <path d="M5 12l14 0" /> <path d="M13 18l6 -6" /> <path d="M13 6l6 6" />
        </svg>
      )
    case "book":
      return (
        <svg {...sp}>
          <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /> <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /> <path d="M3 6l0 13" /> <path d="M12 6l0 13" /> <path d="M21 6l0 13" />
        </svg>
      )
    case "bookmark":
      return (
        <svg {...sp}>
          <path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4" />
        </svg>
      )
    case "briefcase":
      return (
        <svg {...sp}>
          <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" /> <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" /> <path d="M12 12l0 .01" /> <path d="M3 13a20 20 0 0 0 18 0" />
        </svg>
      )
    case "camera":
      return (
        <svg {...sp}>
          <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" /> <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        </svg>
      )
    case "check":
      return (
        <svg {...sp}>
          <path d="M5 12l5 5l10 -10" />
        </svg>
      )
    case "checklist":
      return (
        <svg {...sp}>
          <path d="M9.615 20h-2.615a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8" /> <path d="M14 19l2 2l4 -4" /> <path d="M9 8h4" /> <path d="M9 12h2" />
        </svg>
      )
    case "columns-2":
      return (
        <svg {...sp}>
          <path d="M3 4a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-16" /> <path d="M12 3v18" />
        </svg>
      )
    case "compare":
      return (
        <svg {...sp}>
          <path d="M4 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M16 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M11 6h5a2 2 0 0 1 2 2v8" /> <path d="M14 9l-3 -3l3 -3" /> <path d="M13 18h-5a2 2 0 0 1 -2 -2v-8" /> <path d="M10 15l3 3l-3 3" />
        </svg>
      )
    case "compress":
      return (
        <svg {...sp}>
          <path d="M6 20.735a2 2 0 0 1 -1 -1.735v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-1" /> <path d="M11 17a2 2 0 0 1 2 2v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2a2 2 0 0 1 2 -2" /> <path d="M11 5l-1 0" /> <path d="M13 7l-1 0" /> <path d="M11 9l-1 0" /> <path d="M13 11l-1 0" /> <path d="M11 13l-1 0" /> <path d="M13 15l-1 0" />
        </svg>
      )
    case "convert":
      return (
        <svg {...sp}>
          <path d="M3 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M17 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M19 8v5a5 5 0 0 1 -5 5h-3l3 -3m0 6l-3 -3" /> <path d="M5 16v-5a5 5 0 0 1 5 -5h3l-3 -3m0 6l3 -3" />
        </svg>
      )
    case "chat":
      return (
        <svg {...sp}>
          <path d="M8 9h8" /> <path d="M8 13h6" /> <path d="M12 21l-3 -3h-3a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-3l-3 3" />
        </svg>
      )
    case "crop":
      return (
        <svg {...sp}>
          <path d="M8 5v10a1 1 0 0 0 1 1h10" /> <path d="M5 8h10a1 1 0 0 1 1 1v10" />
        </svg>
      )
    case "delete":
      return (
        <svg {...sp}>
          <path d="M4 7l16 0" /> <path d="M10 11l0 6" /> <path d="M14 11l0 6" /> <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /> <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
        </svg>
      )
    case "edit":
      return (
        <svg {...sp}>
          <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /> <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /> <path d="M16 5l3 3" />
        </svg>
      )
    case "eraser":
      return (
        <svg {...sp}>
          <path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3" /> <path d="M18 13.3l-6.3 -6.3" />
        </svg>
      )
    case "excel-to-pdf":
      return (
        <svg {...sp}>
          <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14" /> <path d="M3 10h18" /> <path d="M10 3v18" />
        </svg>
      )
    case "extract":
      return (
        <svg {...sp}>
          <path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v5m-5 6h7m-3 -3l3 3l-3 3" />
        </svg>
      )
    case "eye":
      return (
        <svg {...sp}>
          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /> <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
        </svg>
      )
    case "file-plus":
      return (
        <svg {...sp}>
          <path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /> <path d="M12 11l0 6" /> <path d="M9 14l6 0" />
        </svg>
      )
    case "forms":
      return (
        <svg {...sp}>
          <path d="M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3" /> <path d="M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3" /> <path d="M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7" /> <path d="M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1" /> <path d="M17 12h.01" /> <path d="M13 12h.01" />
        </svg>
      )
    case "insights":
      return (
        <svg {...sp}>
          <path d="M12 3c.132 0 .263 0 .5 0a8 8 0 0 1 7.5 7.5c0 .237 0 .368 0 .5a8 8 0 0 1 -8 8c-.132 0 -.263 0 -.5 0a8 8 0 0 1 -7.5 -7.5c0 -.237 0 -.368 0 -.5a8 8 0 0 1 8 -8" /> <path d="M12 7v5l3 3" />
        </svg>
      )
    case "html-to-pdf":
      return (
        <svg {...sp}>
          <path d="M7 8l-4 4l4 4" /> <path d="M17 8l4 4l-4 4" /> <path d="M14 4l-4 16" />
        </svg>
      )
    case "info-circle":
      return (
        <svg {...sp}>
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /> <path d="M12 9h.01" /> <path d="M11 12h1v4h1" />
        </svg>
      )
    case "language":
      return (
        <svg {...sp}>
          <path d="M4 5h7" /> <path d="M9 3v2c0 4.418 -2.239 8.895 -6 11" /> <path d="M5 19l4 -8" /> <path d="M21 15l-4 -4l4 -4" /> <path d="M17 7l-4 4l4 4" />
        </svg>
      )
    case "jpg":
      return (
        <svg {...sp}>
          <path d="M15 8h.01" /> <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12" /> <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" /> <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
        </svg>
      )
    case "layers-subtract":
      return (
        <svg {...sp}>
          <path d="M8 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -8" /> <path d="M16 16v2a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h2" />
        </svg>
      )
    case "markdown":
      return (
        <svg {...sp}>
          <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" /> <path d="M7 15v-6l2 2l2 -2v6" /> <path d="M14 13l2 2l2 -2m-2 2v-6" />
        </svg>
      )
    case "merge":
      return (
        <svg {...sp}>
          <path d="M5 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M5 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M15 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M7 8l0 8" /> <path d="M7 8a4 4 0 0 0 4 4h4" />
        </svg>
      )
    case "message-circle":
      return (
        <svg {...sp}>
          <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
        </svg>
      )
    case "ocr":
      return (
        <svg {...sp}>
          <path d="M5 12h14" /> <path d="M3 7v-2a2 2 0 0 1 2 -2h2" /> <path d="M3 17v2a2 2 0 0 0 2 2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M17 21h2a2 2 0 0 0 2 -2v-2" />
        </svg>
      )
    case "organize":
      return (
        <svg {...sp}>
          <path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
        </svg>
      )
    case "page-numbers":
      return (
        <svg {...sp}>
          <path d="M5 9l14 0" /> <path d="M5 15l14 0" /> <path d="M11 4l-4 16" /> <path d="M17 4l-4 16" />
        </svg>
      )
    case "pdf-overlay":
      return (
        <svg {...sp}>
          <path d="M8 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -8" /> <path d="M4 10a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -8" />
        </svg>
      )
    case "pdf-to-excel":
      return (
        <svg {...sp}>
          <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14" /> <path d="M3 10h18" /> <path d="M10 3v18" />
        </svg>
      )
    case "pdf-to-jpg":
      return (
        <svg {...sp}>
          <path d="M15 8h.01" /> <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12" /> <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" /> <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
        </svg>
      )
    case "pdf-to-pdfa":
      return (
        <svg {...sp}>
          <path d="M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2" /> <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10" /> <path d="M10 12l4 0" />
        </svg>
      )
    case "pdf-to-powerpoint":
      return (
        <svg {...sp}>
          <path d="M3 4l18 0" /> <path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10" /> <path d="M12 16l0 4" /> <path d="M9 20l6 0" /> <path d="M8 12l3 -3l2 2l3 -3" />
        </svg>
      )
    case "pdf-to-word":
      return (
        <svg {...sp}>
          <path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /> <path d="M9 9l1 0" /> <path d="M9 13l6 0" /> <path d="M9 17l6 0" />
        </svg>
      )
    case "photo-scan":
      return (
        <svg {...sp}>
          <path d="M15 8h.01" /> <path d="M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644" /> <path d="M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644" /> <path d="M3 7v-2a2 2 0 0 1 2 -2h2" /> <path d="M3 17v2a2 2 0 0 0 2 2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M17 21h2a2 2 0 0 0 2 -2v-2" />
        </svg>
      )
    case "powerpoint-to-pdf":
      return (
        <svg {...sp}>
          <path d="M3 4l18 0" /> <path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10" /> <path d="M12 16l0 4" /> <path d="M9 20l6 0" /> <path d="M8 12l3 -3l2 2l3 -3" />
        </svg>
      )
    case "protect":
      return (
        <svg {...sp}>
          <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" /> <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /> <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
        </svg>
      )
    case "redact":
      return (
        <svg {...sp}>
          <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /> <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /> <path d="M3 3l18 18" />
        </svg>
      )
    case "repair":
      return (
        <svg {...sp}>
          <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" />
        </svg>
      )
    case "resize":
      return (
        <svg {...sp}>
          <path d="M4 11v8a1 1 0 0 0 1 1h8m-9 -14v-1a1 1 0 0 1 1 -1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2m0 5v1a1 1 0 0 1 -1 1h-1" /> <path d="M4 12h7a1 1 0 0 1 1 1v7" />
        </svg>
      )
    case "rocket":
      return (
        <svg {...sp}>
          <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" /> <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" /> <path d="M14 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        </svg>
      )
    case "rotate":
      return (
        <svg {...sp}>
          <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
        </svg>
      )
    case "scan":
      return (
        <svg {...sp}>
          <path d="M5 12h14" /> <path d="M3 7v-2a2 2 0 0 1 2 -2h2" /> <path d="M3 17v2a2 2 0 0 0 2 2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M17 21h2a2 2 0 0 0 2 -2v-2" />
        </svg>
      )
    case "security":
      return (
        <svg {...sp}>
          <path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06" /> <path d="M15 19l2 2l4 -4" />
        </svg>
      )
    case "sparkles":
      return (
        <svg {...sp}>
          <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2" /> <path d="M6 14a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2" /> <path d="M12 4a3 3 0 0 1 3 3a3 3 0 0 1 3 -3a3 3 0 0 1 -3 -3a3 3 0 0 1 -3 3" />
        </svg>
      )
    case "settings":
      return (
        <svg {...sp}>
          <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" /> <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        </svg>
      )
    case "shield-lock":
      return (
        <svg {...sp}>
          <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" /> <path d="M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M12 12l0 2.5" />
        </svg>
      )
    case "sign":
      return (
        <svg {...sp}>
          <path d="M3 17c3.333 -3.333 5 -6 5 -8c0 -3 -1 -3 -2 -3s-2.032 1.085 -2 3c.034 2.048 1.658 4.877 2.5 6c1.5 2 2.5 2.5 3.5 1l2 -3c.333 2.667 1.333 4 3 4c.53 0 2.639 -2 3 -2c.517 0 1.517 .667 3 2" />
        </svg>
      )
    case "split":
      return (
        <svg {...sp}>
          <path d="M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /> <path d="M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /> <path d="M9.15 14.85l8.85 -10.85" /> <path d="M6 4l8.85 10.85" />
        </svg>
      )
    case "star":
      return (
        <svg {...sp}>
          <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />
        </svg>
      )
    case "text-size":
      return (
        <svg {...sp}>
          <path d="M3 7v-2h13v2" /> <path d="M10 5v14" /> <path d="M12 19h-4" /> <path d="M15 13v-1h6v1" /> <path d="M18 12v7" /> <path d="M17 19h2" />
        </svg>
      )
    case "typography":
      return (
        <svg {...sp}>
          <path d="M4 20l3 0" /> <path d="M14 20l7 0" /> <path d="M6.9 15l6.9 0" /> <path d="M10.2 6.3l5.8 13.7" /> <path d="M5 20l6 -16l2 0l7 16" />
        </svg>
      )
    case "unlock":
      return (
        <svg {...sp}>
          <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -6" /> <path d="M11 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M8 11v-5a4 4 0 0 1 8 0" />
        </svg>
      )
    case "vector":
      return (
        <svg {...sp}>
          <path d="M3 4a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -2" /> <path d="M17 4a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -2" /> <path d="M17 18a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -2" /> <path d="M3 18a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -2" /> <path d="M5 7l0 10" /> <path d="M19 7l0 10" /> <path d="M7 5l10 0" /> <path d="M7 19l10 0" />
        </svg>
      )
    case "watermark":
      return (
        <svg {...sp}>
          <path d="M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546" />
        </svg>
      )
    case "word-to-pdf":
      return (
        <svg {...sp}>
          <path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /> <path d="M9 9l1 0" /> <path d="M9 13l6 0" /> <path d="M9 17l6 0" />
        </svg>
      )
    case "world-www":
      return (
        <svg {...sp}>
          <path d="M19.5 7a9 9 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4" /> <path d="M11.5 3a16.989 16.989 0 0 0 -1.826 4" /> <path d="M12.5 3a16.989 16.989 0 0 1 1.828 4" /> <path d="M19.5 17a9 9 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4" /> <path d="M11.5 21a16.989 16.989 0 0 1 -1.826 -4" /> <path d="M12.5 21a16.989 16.989 0 0 0 1.828 -4" /> <path d="M2 10l1 4l1.5 -4l1.5 4l1 -4" /> <path d="M17 10l1 4l1.5 -4l1.5 4l1 -4" /> <path d="M9.5 10l1 4l1.5 -4l1.5 4l1 -4" />
        </svg>
      )
    default:
      return (
        <svg {...sp}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}