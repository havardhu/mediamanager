/* eslint-disable */
// GENERATED from the Claude Design "Workbench" design system bundle by
// scripts/import-design-system.py. Do not edit by hand; re-run the script instead.
import * as React from 'react';

const __ds_scope = {};

// components/core/Badge.jsx
(() => {
function Badge({
  children,
  tone = 'default',
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: tone === 'error' ? 'var(--error)' : tone === 'accent' ? 'var(--accent)' : 'var(--muted)',
      background: 'var(--surface-3)',
      padding: '2px 5px',
      borderRadius: 3,
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})();

// components/core/Eyebrow.jsx
(() => {
function Eyebrow({
  children,
  as: Tag = 'span',
  style
}) {
  return /*#__PURE__*/React.createElement(Tag, {
    style: {
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: '.8px',
      color: 'var(--muted)',
      textTransform: 'uppercase',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Eyebrow });
})();

// components/core/Hint.jsx
(() => {
function Hint({
  children,
  strong = false,
  style
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      color: 'var(--muted)',
      lineHeight: 1.65,
      textWrap: 'pretty',
      fontWeight: strong ? 600 : 400,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Hint });
})();

// components/core/Icon.jsx
(() => {
// Lucide v0.468.0 icon nodes (ISC licence), copied programmatically.
// The 26 glyphs used by Area Database Designer plus a curated set for tool apps.
const ICONS = {
  "File": [["path", {
    "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
  }], ["path", {
    "d": "M14 2v4a2 2 0 0 0 2 2h4"
  }]],
  "FileText": [["path", {
    "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
  }], ["path", {
    "d": "M14 2v4a2 2 0 0 0 2 2h4"
  }], ["path", {
    "d": "M10 9H8"
  }], ["path", {
    "d": "M16 13H8"
  }], ["path", {
    "d": "M16 17H8"
  }]],
  "FileCode": [["path", {
    "d": "M10 12.5 8 15l2 2.5"
  }], ["path", {
    "d": "m14 12.5 2 2.5-2 2.5"
  }], ["path", {
    "d": "M14 2v4a2 2 0 0 0 2 2h4"
  }], ["path", {
    "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"
  }]],
  "FilePlus2": [["path", {
    "d": "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"
  }], ["path", {
    "d": "M14 2v4a2 2 0 0 0 2 2h4"
  }], ["path", {
    "d": "M3 15h6"
  }], ["path", {
    "d": "M6 12v6"
  }]],
  "FileJson": [["path", {
    "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
  }], ["path", {
    "d": "M14 2v4a2 2 0 0 0 2 2h4"
  }], ["path", {
    "d": "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"
  }], ["path", {
    "d": "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"
  }]],
  "Folder": [["path", {
    "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
  }]],
  "FolderOpen": [["path", {
    "d": "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
  }]],
  "FolderPlus": [["path", {
    "d": "M12 10v6"
  }], ["path", {
    "d": "M9 13h6"
  }], ["path", {
    "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
  }]],
  "FolderTree": [["path", {
    "d": "M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"
  }], ["path", {
    "d": "M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"
  }], ["path", {
    "d": "M3 5a2 2 0 0 0 2 2h3"
  }], ["path", {
    "d": "M3 3v13a2 2 0 0 0 2 2h3"
  }]],
  "Save": [["path", {
    "d": "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
  }], ["path", {
    "d": "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"
  }], ["path", {
    "d": "M7 3v4a1 1 0 0 0 1 1h7"
  }]],
  "Download": [["path", {
    "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }], ["polyline", {
    "points": "7 10 12 15 17 10"
  }], ["line", {
    "x1": "12",
    "x2": "12",
    "y1": "15",
    "y2": "3"
  }]],
  "Upload": [["path", {
    "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }], ["polyline", {
    "points": "17 8 12 3 7 8"
  }], ["line", {
    "x1": "12",
    "x2": "12",
    "y1": "3",
    "y2": "15"
  }]],
  "Import": [["path", {
    "d": "M12 3v12"
  }], ["path", {
    "d": "m8 11 4 4 4-4"
  }], ["path", {
    "d": "M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"
  }]],
  "Archive": [["rect", {
    "width": "20",
    "height": "5",
    "x": "2",
    "y": "3",
    "rx": "1"
  }], ["path", {
    "d": "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"
  }], ["path", {
    "d": "M10 12h4"
  }]],
  "Trash2": [["path", {
    "d": "M3 6h18"
  }], ["path", {
    "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
  }], ["path", {
    "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
  }], ["line", {
    "x1": "10",
    "x2": "10",
    "y1": "11",
    "y2": "17"
  }], ["line", {
    "x1": "14",
    "x2": "14",
    "y1": "11",
    "y2": "17"
  }]],
  "Pencil": [["path", {
    "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
  }], ["path", {
    "d": "m15 5 4 4"
  }]],
  "Undo2": [["path", {
    "d": "M9 14 4 9l5-5"
  }], ["path", {
    "d": "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"
  }]],
  "Redo2": [["path", {
    "d": "m15 14 5-5-5-5"
  }], ["path", {
    "d": "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"
  }]],
  "Scissors": [["circle", {
    "cx": "6",
    "cy": "6",
    "r": "3"
  }], ["path", {
    "d": "M8.12 8.12 12 12"
  }], ["path", {
    "d": "M20 4 8.12 15.88"
  }], ["circle", {
    "cx": "6",
    "cy": "18",
    "r": "3"
  }], ["path", {
    "d": "M14.8 14.8 20 20"
  }]],
  "Copy": [["rect", {
    "width": "14",
    "height": "14",
    "x": "8",
    "y": "8",
    "rx": "2",
    "ry": "2"
  }], ["path", {
    "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
  }]],
  "ClipboardPaste": [["path", {
    "d": "M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z"
  }], ["path", {
    "d": "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10"
  }], ["path", {
    "d": "m17 10 4 4-4 4"
  }]],
  "Eraser": [["path", {
    "d": "m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"
  }], ["path", {
    "d": "M22 21H7"
  }], ["path", {
    "d": "m5 11 9 9"
  }]],
  "Type": [["polyline", {
    "points": "4 7 4 4 20 4 20 7"
  }], ["line", {
    "x1": "9",
    "x2": "15",
    "y1": "20",
    "y2": "20"
  }], ["line", {
    "x1": "12",
    "x2": "12",
    "y1": "4",
    "y2": "20"
  }]],
  "Replace": [["path", {
    "d": "M14 4a2 2 0 0 1 2-2"
  }], ["path", {
    "d": "M16 10a2 2 0 0 1-2-2"
  }], ["path", {
    "d": "M20 2a2 2 0 0 1 2 2"
  }], ["path", {
    "d": "M22 8a2 2 0 0 1-2 2"
  }], ["path", {
    "d": "m3 7 3 3 3-3"
  }], ["path", {
    "d": "M6 10V5a3 3 0 0 1 3-3h1"
  }], ["rect", {
    "x": "2",
    "y": "14",
    "width": "8",
    "height": "8",
    "rx": "2"
  }]],
  "WrapText": [["line", {
    "x1": "3",
    "x2": "21",
    "y1": "6",
    "y2": "6"
  }], ["path", {
    "d": "M3 12h15a3 3 0 1 1 0 6h-4"
  }], ["polyline", {
    "points": "16 16 14 18 16 20"
  }], ["line", {
    "x1": "3",
    "x2": "10",
    "y1": "18",
    "y2": "18"
  }]],
  "Plus": [["path", {
    "d": "M5 12h14"
  }], ["path", {
    "d": "M12 5v14"
  }]],
  "Minus": [["path", {
    "d": "M5 12h14"
  }]],
  "X": [["path", {
    "d": "M18 6 6 18"
  }], ["path", {
    "d": "m6 6 12 12"
  }]],
  "Check": [["path", {
    "d": "M20 6 9 17l-5-5"
  }]],
  "PanelLeft": [["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }], ["path", {
    "d": "M9 3v18"
  }]],
  "PanelRight": [["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }], ["path", {
    "d": "M15 3v18"
  }]],
  "PanelBottom": [["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }], ["path", {
    "d": "M3 15h18"
  }]],
  "PanelLeftClose": [["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }], ["path", {
    "d": "M9 3v18"
  }], ["path", {
    "d": "m16 15-3-3 3-3"
  }]],
  "PanelRightClose": [["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }], ["path", {
    "d": "M15 3v18"
  }], ["path", {
    "d": "m8 9 3 3-3 3"
  }]],
  "Columns2": [["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }], ["path", {
    "d": "M12 3v18"
  }]],
  "Rows2": [["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }], ["path", {
    "d": "M3 12h18"
  }]],
  "LayoutGrid": [["rect", {
    "width": "7",
    "height": "7",
    "x": "3",
    "y": "3",
    "rx": "1"
  }], ["rect", {
    "width": "7",
    "height": "7",
    "x": "14",
    "y": "3",
    "rx": "1"
  }], ["rect", {
    "width": "7",
    "height": "7",
    "x": "14",
    "y": "14",
    "rx": "1"
  }], ["rect", {
    "width": "7",
    "height": "7",
    "x": "3",
    "y": "14",
    "rx": "1"
  }]],
  "LayoutPanelLeft": [["rect", {
    "width": "7",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "1"
  }], ["rect", {
    "width": "7",
    "height": "7",
    "x": "14",
    "y": "3",
    "rx": "1"
  }], ["rect", {
    "width": "7",
    "height": "7",
    "x": "14",
    "y": "14",
    "rx": "1"
  }]],
  "Maximize2": [["polyline", {
    "points": "15 3 21 3 21 9"
  }], ["polyline", {
    "points": "9 21 3 21 3 15"
  }], ["line", {
    "x1": "21",
    "x2": "14",
    "y1": "3",
    "y2": "10"
  }], ["line", {
    "x1": "3",
    "x2": "10",
    "y1": "21",
    "y2": "14"
  }]],
  "Minimize2": [["polyline", {
    "points": "4 14 10 14 10 20"
  }], ["polyline", {
    "points": "20 10 14 10 14 4"
  }], ["line", {
    "x1": "14",
    "x2": "21",
    "y1": "10",
    "y2": "3"
  }], ["line", {
    "x1": "3",
    "x2": "10",
    "y1": "21",
    "y2": "14"
  }]],
  "Eye": [["path", {
    "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
  }], ["circle", {
    "cx": "12",
    "cy": "12",
    "r": "3"
  }]],
  "EyeOff": [["path", {
    "d": "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
  }], ["path", {
    "d": "M14.084 14.158a3 3 0 0 1-4.242-4.242"
  }], ["path", {
    "d": "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
  }], ["path", {
    "d": "m2 2 20 20"
  }]],
  "ZoomIn": [["circle", {
    "cx": "11",
    "cy": "11",
    "r": "8"
  }], ["line", {
    "x1": "21",
    "x2": "16.65",
    "y1": "21",
    "y2": "16.65"
  }], ["line", {
    "x1": "11",
    "x2": "11",
    "y1": "8",
    "y2": "14"
  }], ["line", {
    "x1": "8",
    "x2": "14",
    "y1": "11",
    "y2": "11"
  }]],
  "ZoomOut": [["circle", {
    "cx": "11",
    "cy": "11",
    "r": "8"
  }], ["line", {
    "x1": "21",
    "x2": "16.65",
    "y1": "21",
    "y2": "16.65"
  }], ["line", {
    "x1": "8",
    "x2": "14",
    "y1": "11",
    "y2": "11"
  }]],
  "Moon": [["path", {
    "d": "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
  }]],
  "Sun": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "4"
  }], ["path", {
    "d": "M12 2v2"
  }], ["path", {
    "d": "M12 20v2"
  }], ["path", {
    "d": "m4.93 4.93 1.41 1.41"
  }], ["path", {
    "d": "m17.66 17.66 1.41 1.41"
  }], ["path", {
    "d": "M2 12h2"
  }], ["path", {
    "d": "M20 12h2"
  }], ["path", {
    "d": "m6.34 17.66-1.41 1.41"
  }], ["path", {
    "d": "m19.07 4.93-1.41 1.41"
  }]],
  "Monitor": [["rect", {
    "width": "20",
    "height": "14",
    "x": "2",
    "y": "3",
    "rx": "2"
  }], ["line", {
    "x1": "8",
    "x2": "16",
    "y1": "21",
    "y2": "21"
  }], ["line", {
    "x1": "12",
    "x2": "12",
    "y1": "17",
    "y2": "21"
  }]],
  "ChevronDown": [["path", {
    "d": "m6 9 6 6 6-6"
  }]],
  "ChevronRight": [["path", {
    "d": "m9 18 6-6-6-6"
  }]],
  "ChevronLeft": [["path", {
    "d": "m15 18-6-6 6-6"
  }]],
  "ChevronUp": [["path", {
    "d": "m18 15-6-6-6 6"
  }]],
  "ChevronsUpDown": [["path", {
    "d": "m7 15 5 5 5-5"
  }], ["path", {
    "d": "m7 9 5-5 5 5"
  }]],
  "ArrowLeft": [["path", {
    "d": "m12 19-7-7 7-7"
  }], ["path", {
    "d": "M19 12H5"
  }]],
  "ArrowRight": [["path", {
    "d": "M5 12h14"
  }], ["path", {
    "d": "m12 5 7 7-7 7"
  }]],
  "ArrowUp": [["path", {
    "d": "m5 12 7-7 7 7"
  }], ["path", {
    "d": "M12 19V5"
  }]],
  "ArrowDown": [["path", {
    "d": "M12 5v14"
  }], ["path", {
    "d": "m19 12-7 7-7-7"
  }]],
  "ExternalLink": [["path", {
    "d": "M15 3h6v6"
  }], ["path", {
    "d": "M10 14 21 3"
  }], ["path", {
    "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
  }]],
  "Menu": [["line", {
    "x1": "4",
    "x2": "20",
    "y1": "12",
    "y2": "12"
  }], ["line", {
    "x1": "4",
    "x2": "20",
    "y1": "6",
    "y2": "6"
  }], ["line", {
    "x1": "4",
    "x2": "20",
    "y1": "18",
    "y2": "18"
  }]],
  "Ellipsis": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "1"
  }], ["circle", {
    "cx": "19",
    "cy": "12",
    "r": "1"
  }], ["circle", {
    "cx": "5",
    "cy": "12",
    "r": "1"
  }]],
  "EllipsisVertical": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "1"
  }], ["circle", {
    "cx": "12",
    "cy": "5",
    "r": "1"
  }], ["circle", {
    "cx": "12",
    "cy": "19",
    "r": "1"
  }]],
  "GripVertical": [["circle", {
    "cx": "9",
    "cy": "12",
    "r": "1"
  }], ["circle", {
    "cx": "9",
    "cy": "5",
    "r": "1"
  }], ["circle", {
    "cx": "9",
    "cy": "19",
    "r": "1"
  }], ["circle", {
    "cx": "15",
    "cy": "12",
    "r": "1"
  }], ["circle", {
    "cx": "15",
    "cy": "5",
    "r": "1"
  }], ["circle", {
    "cx": "15",
    "cy": "19",
    "r": "1"
  }]],
  "Play": [["polygon", {
    "points": "6 3 20 12 6 21 6 3"
  }]],
  "Pause": [["rect", {
    "x": "14",
    "y": "4",
    "width": "4",
    "height": "16",
    "rx": "1"
  }], ["rect", {
    "x": "6",
    "y": "4",
    "width": "4",
    "height": "16",
    "rx": "1"
  }]],
  "Square": [["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }]],
  "StepForward": [["line", {
    "x1": "6",
    "x2": "6",
    "y1": "4",
    "y2": "20"
  }], ["polygon", {
    "points": "10,4 20,12 10,20"
  }]],
  "RotateCw": [["path", {
    "d": "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"
  }], ["path", {
    "d": "M21 3v5h-5"
  }]],
  "RefreshCw": [["path", {
    "d": "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
  }], ["path", {
    "d": "M21 3v5h-5"
  }], ["path", {
    "d": "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
  }], ["path", {
    "d": "M8 16H3v5"
  }]],
  "Bug": [["path", {
    "d": "m8 2 1.88 1.88"
  }], ["path", {
    "d": "M14.12 3.88 16 2"
  }], ["path", {
    "d": "M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"
  }], ["path", {
    "d": "M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"
  }], ["path", {
    "d": "M12 20v-9"
  }], ["path", {
    "d": "M6.53 9C4.6 8.8 3 7.1 3 5"
  }], ["path", {
    "d": "M6 13H2"
  }], ["path", {
    "d": "M3 21c0-2.1 1.7-3.9 3.8-4"
  }], ["path", {
    "d": "M20.97 5c0 2.1-1.6 3.8-3.5 4"
  }], ["path", {
    "d": "M22 13h-4"
  }], ["path", {
    "d": "M17.2 17c2.1.1 3.8 1.9 3.8 4"
  }]],
  "Terminal": [["polyline", {
    "points": "4 17 10 11 4 5"
  }], ["line", {
    "x1": "12",
    "x2": "20",
    "y1": "19",
    "y2": "19"
  }]],
  "SquareTerminal": [["path", {
    "d": "m7 11 2-2-2-2"
  }], ["path", {
    "d": "M11 13h4"
  }], ["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2",
    "ry": "2"
  }]],
  "Code": [["polyline", {
    "points": "16 18 22 12 16 6"
  }], ["polyline", {
    "points": "8 6 2 12 8 18"
  }]],
  "Braces": [["path", {
    "d": "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"
  }], ["path", {
    "d": "M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"
  }]],
  "Variable": [["path", {
    "d": "M8 21s-4-3-4-9 4-9 4-9"
  }], ["path", {
    "d": "M16 3s4 3 4 9-4 9-4 9"
  }], ["line", {
    "x1": "15",
    "x2": "9",
    "y1": "9",
    "y2": "15"
  }], ["line", {
    "x1": "9",
    "x2": "15",
    "y1": "9",
    "y2": "15"
  }]],
  "Zap": [["path", {
    "d": "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
  }]],
  "Hammer": [["path", {
    "d": "m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"
  }], ["path", {
    "d": "m18 15 4-4"
  }], ["path", {
    "d": "m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"
  }]],
  "Rocket": [["path", {
    "d": "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
  }], ["path", {
    "d": "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
  }], ["path", {
    "d": "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
  }], ["path", {
    "d": "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
  }]],
  "Sparkles": [["path", {
    "d": "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
  }], ["path", {
    "d": "M20 3v4"
  }], ["path", {
    "d": "M22 5h-4"
  }], ["path", {
    "d": "M4 17v2"
  }], ["path", {
    "d": "M5 18H3"
  }]],
  "WandSparkles": [["path", {
    "d": "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"
  }], ["path", {
    "d": "m14 7 3 3"
  }], ["path", {
    "d": "M5 6v4"
  }], ["path", {
    "d": "M19 14v4"
  }], ["path", {
    "d": "M10 2v2"
  }], ["path", {
    "d": "M7 8H3"
  }], ["path", {
    "d": "M21 16h-4"
  }], ["path", {
    "d": "M11 3H9"
  }]],
  "Bot": [["path", {
    "d": "M12 8V4H8"
  }], ["rect", {
    "width": "16",
    "height": "12",
    "x": "4",
    "y": "8",
    "rx": "2"
  }], ["path", {
    "d": "M2 14h2"
  }], ["path", {
    "d": "M20 14h2"
  }], ["path", {
    "d": "M15 13v2"
  }], ["path", {
    "d": "M9 13v2"
  }]],
  "MessageSquare": [["path", {
    "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
  }]],
  "Send": [["path", {
    "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
  }], ["path", {
    "d": "m21.854 2.147-10.94 10.939"
  }]],
  "Lightbulb": [["path", {
    "d": "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
  }], ["path", {
    "d": "M9 18h6"
  }], ["path", {
    "d": "M10 22h4"
  }]],
  "Shuffle": [["path", {
    "d": "m18 14 4 4-4 4"
  }], ["path", {
    "d": "m18 2 4 4-4 4"
  }], ["path", {
    "d": "M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"
  }], ["path", {
    "d": "M2 6h1.972a4 4 0 0 1 3.6 2.2"
  }], ["path", {
    "d": "M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"
  }]],
  "Dices": [["rect", {
    "width": "12",
    "height": "12",
    "x": "2",
    "y": "10",
    "rx": "2",
    "ry": "2"
  }], ["path", {
    "d": "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"
  }], ["path", {
    "d": "M6 18h.01"
  }], ["path", {
    "d": "M10 14h.01"
  }], ["path", {
    "d": "M15 6h.01"
  }], ["path", {
    "d": "M18 9h.01"
  }]],
  "GitBranch": [["line", {
    "x1": "6",
    "x2": "6",
    "y1": "3",
    "y2": "15"
  }], ["circle", {
    "cx": "18",
    "cy": "6",
    "r": "3"
  }], ["circle", {
    "cx": "6",
    "cy": "18",
    "r": "3"
  }], ["path", {
    "d": "M18 9a9 9 0 0 1-9 9"
  }]],
  "GitCommitHorizontal": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "3"
  }], ["line", {
    "x1": "3",
    "x2": "9",
    "y1": "12",
    "y2": "12"
  }], ["line", {
    "x1": "15",
    "x2": "21",
    "y1": "12",
    "y2": "12"
  }]],
  "GitMerge": [["circle", {
    "cx": "18",
    "cy": "18",
    "r": "3"
  }], ["circle", {
    "cx": "6",
    "cy": "6",
    "r": "3"
  }], ["path", {
    "d": "M6 21V9a9 9 0 0 0 9 9"
  }]],
  "GitPullRequest": [["circle", {
    "cx": "18",
    "cy": "18",
    "r": "3"
  }], ["circle", {
    "cx": "6",
    "cy": "6",
    "r": "3"
  }], ["path", {
    "d": "M13 6h3a2 2 0 0 1 2 2v7"
  }], ["line", {
    "x1": "6",
    "x2": "6",
    "y1": "9",
    "y2": "21"
  }]],
  "GitCompare": [["circle", {
    "cx": "18",
    "cy": "18",
    "r": "3"
  }], ["circle", {
    "cx": "6",
    "cy": "6",
    "r": "3"
  }], ["path", {
    "d": "M13 6h3a2 2 0 0 1 2 2v7"
  }], ["path", {
    "d": "M11 18H8a2 2 0 0 1-2-2V9"
  }]],
  "History": [["path", {
    "d": "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
  }], ["path", {
    "d": "M3 3v5h5"
  }], ["path", {
    "d": "M12 7v5l4 2"
  }]],
  "CircleCheck": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["path", {
    "d": "m9 12 2 2 4-4"
  }]],
  "CircleAlert": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["line", {
    "x1": "12",
    "x2": "12",
    "y1": "8",
    "y2": "12"
  }], ["line", {
    "x1": "12",
    "x2": "12.01",
    "y1": "16",
    "y2": "16"
  }]],
  "TriangleAlert": [["path", {
    "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
  }], ["path", {
    "d": "M12 9v4"
  }], ["path", {
    "d": "M12 17h.01"
  }]],
  "Info": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["path", {
    "d": "M12 16v-4"
  }], ["path", {
    "d": "M12 8h.01"
  }]],
  "CircleX": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["path", {
    "d": "m15 9-6 6"
  }], ["path", {
    "d": "m9 9 6 6"
  }]],
  "LoaderCircle": [["path", {
    "d": "M21 12a9 9 0 1 1-6.219-8.56"
  }]],
  "Bell": [["path", {
    "d": "M10.268 21a2 2 0 0 0 3.464 0"
  }], ["path", {
    "d": "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
  }]],
  "CircleHelp": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["path", {
    "d": "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
  }], ["path", {
    "d": "M12 17h.01"
  }]],
  "Ban": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["path", {
    "d": "m4.9 4.9 14.2 14.2"
  }]],
  "ShieldCheck": [["path", {
    "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
  }], ["path", {
    "d": "m9 12 2 2 4-4"
  }]],
  "Search": [["circle", {
    "cx": "11",
    "cy": "11",
    "r": "8"
  }], ["path", {
    "d": "m21 21-4.3-4.3"
  }]],
  "Filter": [["polygon", {
    "points": "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
  }]],
  "ListFilter": [["path", {
    "d": "M3 6h18"
  }], ["path", {
    "d": "M7 12h10"
  }], ["path", {
    "d": "M10 18h4"
  }]],
  "SlidersHorizontal": [["line", {
    "x1": "21",
    "x2": "14",
    "y1": "4",
    "y2": "4"
  }], ["line", {
    "x1": "10",
    "x2": "3",
    "y1": "4",
    "y2": "4"
  }], ["line", {
    "x1": "21",
    "x2": "12",
    "y1": "12",
    "y2": "12"
  }], ["line", {
    "x1": "8",
    "x2": "3",
    "y1": "12",
    "y2": "12"
  }], ["line", {
    "x1": "21",
    "x2": "16",
    "y1": "20",
    "y2": "20"
  }], ["line", {
    "x1": "12",
    "x2": "3",
    "y1": "20",
    "y2": "20"
  }], ["line", {
    "x1": "14",
    "x2": "14",
    "y1": "2",
    "y2": "6"
  }], ["line", {
    "x1": "8",
    "x2": "8",
    "y1": "10",
    "y2": "14"
  }], ["line", {
    "x1": "16",
    "x2": "16",
    "y1": "18",
    "y2": "22"
  }]],
  "ArrowUpDown": [["path", {
    "d": "m21 16-4 4-4-4"
  }], ["path", {
    "d": "M17 20V4"
  }], ["path", {
    "d": "m3 8 4-4 4 4"
  }], ["path", {
    "d": "M7 4v16"
  }]],
  "Table": [["path", {
    "d": "M12 3v18"
  }], ["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "3",
    "rx": "2"
  }], ["path", {
    "d": "M3 9h18"
  }], ["path", {
    "d": "M3 15h18"
  }]],
  "List": [["path", {
    "d": "M3 12h.01"
  }], ["path", {
    "d": "M3 18h.01"
  }], ["path", {
    "d": "M3 6h.01"
  }], ["path", {
    "d": "M8 12h13"
  }], ["path", {
    "d": "M8 18h13"
  }], ["path", {
    "d": "M8 6h13"
  }]],
  "ListTree": [["path", {
    "d": "M21 12h-8"
  }], ["path", {
    "d": "M21 6H8"
  }], ["path", {
    "d": "M21 18h-8"
  }], ["path", {
    "d": "M3 6v4c0 1.1.9 2 2 2h3"
  }], ["path", {
    "d": "M3 10v6c0 1.1.9 2 2 2h3"
  }]],
  "Hash": [["line", {
    "x1": "4",
    "x2": "20",
    "y1": "9",
    "y2": "9"
  }], ["line", {
    "x1": "4",
    "x2": "20",
    "y1": "15",
    "y2": "15"
  }], ["line", {
    "x1": "10",
    "x2": "8",
    "y1": "3",
    "y2": "21"
  }], ["line", {
    "x1": "16",
    "x2": "14",
    "y1": "3",
    "y2": "21"
  }]],
  "Database": [["ellipse", {
    "cx": "12",
    "cy": "5",
    "rx": "9",
    "ry": "3"
  }], ["path", {
    "d": "M3 5V19A9 3 0 0 0 21 19V5"
  }], ["path", {
    "d": "M3 12A9 3 0 0 0 21 12"
  }]],
  "Server": [["rect", {
    "width": "20",
    "height": "8",
    "x": "2",
    "y": "2",
    "rx": "2",
    "ry": "2"
  }], ["rect", {
    "width": "20",
    "height": "8",
    "x": "2",
    "y": "14",
    "rx": "2",
    "ry": "2"
  }], ["line", {
    "x1": "6",
    "x2": "6.01",
    "y1": "6",
    "y2": "6"
  }], ["line", {
    "x1": "6",
    "x2": "6.01",
    "y1": "18",
    "y2": "18"
  }]],
  "Link": [["path", {
    "d": "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
  }], ["path", {
    "d": "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
  }]],
  "Tag": [["path", {
    "d": "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"
  }], ["circle", {
    "cx": "7.5",
    "cy": "7.5",
    "r": ".5",
    "fill": "currentColor"
  }]],
  "Star": [["path", {
    "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
  }]],
  "Pin": [["path", {
    "d": "M12 17v5"
  }], ["path", {
    "d": "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"
  }]],
  "Calendar": [["path", {
    "d": "M8 2v4"
  }], ["path", {
    "d": "M16 2v4"
  }], ["rect", {
    "width": "18",
    "height": "18",
    "x": "3",
    "y": "4",
    "rx": "2"
  }], ["path", {
    "d": "M3 10h18"
  }]],
  "Clock": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["polyline", {
    "points": "12 6 12 12 16 14"
  }]],
  "Settings": [["path", {
    "d": "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
  }], ["circle", {
    "cx": "12",
    "cy": "12",
    "r": "3"
  }]],
  "Settings2": [["path", {
    "d": "M20 7h-9"
  }], ["path", {
    "d": "M14 17H5"
  }], ["circle", {
    "cx": "17",
    "cy": "17",
    "r": "3"
  }], ["circle", {
    "cx": "7",
    "cy": "7",
    "r": "3"
  }]],
  "User": [["path", {
    "d": "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
  }], ["circle", {
    "cx": "12",
    "cy": "7",
    "r": "4"
  }]],
  "Users": [["path", {
    "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }], ["circle", {
    "cx": "9",
    "cy": "7",
    "r": "4"
  }], ["path", {
    "d": "M22 21v-2a4 4 0 0 0-3-3.87"
  }], ["path", {
    "d": "M16 3.13a4 4 0 0 1 0 7.75"
  }]],
  "Key": [["path", {
    "d": "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"
  }], ["path", {
    "d": "m21 2-9.6 9.6"
  }], ["circle", {
    "cx": "7.5",
    "cy": "15.5",
    "r": "5.5"
  }]],
  "Lock": [["rect", {
    "width": "18",
    "height": "11",
    "x": "3",
    "y": "11",
    "rx": "2",
    "ry": "2"
  }], ["path", {
    "d": "M7 11V7a5 5 0 0 1 10 0v4"
  }]],
  "LockOpen": [["rect", {
    "width": "18",
    "height": "11",
    "x": "3",
    "y": "11",
    "rx": "2",
    "ry": "2"
  }], ["path", {
    "d": "M7 11V7a5 5 0 0 1 9.9-1"
  }]],
  "Plug": [["path", {
    "d": "M12 22v-5"
  }], ["path", {
    "d": "M9 8V2"
  }], ["path", {
    "d": "M15 8V2"
  }], ["path", {
    "d": "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"
  }]],
  "Cloud": [["path", {
    "d": "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
  }]],
  "CloudOff": [["path", {
    "d": "m2 2 20 20"
  }], ["path", {
    "d": "M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"
  }], ["path", {
    "d": "M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"
  }]],
  "HardDrive": [["line", {
    "x1": "22",
    "x2": "2",
    "y1": "12",
    "y2": "12"
  }], ["path", {
    "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
  }], ["line", {
    "x1": "6",
    "x2": "6.01",
    "y1": "16",
    "y2": "16"
  }], ["line", {
    "x1": "10",
    "x2": "10.01",
    "y1": "16",
    "y2": "16"
  }]],
  "Package": [["path", {
    "d": "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"
  }], ["path", {
    "d": "M12 22V12"
  }], ["path", {
    "d": "m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"
  }], ["path", {
    "d": "m7.5 4.27 9 5.15"
  }]],
  "Puzzle": [["path", {
    "d": "M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"
  }]],
  "Globe": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["path", {
    "d": "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
  }], ["path", {
    "d": "M2 12h20"
  }]],
  "MousePointer2": [["path", {
    "d": "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"
  }]],
  "SquareDashedMousePointer": [["path", {
    "d": "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"
  }], ["path", {
    "d": "M5 3a2 2 0 0 0-2 2"
  }], ["path", {
    "d": "M19 3a2 2 0 0 1 2 2"
  }], ["path", {
    "d": "M5 21a2 2 0 0 1-2-2"
  }], ["path", {
    "d": "M9 3h1"
  }], ["path", {
    "d": "M9 21h2"
  }], ["path", {
    "d": "M14 3h1"
  }], ["path", {
    "d": "M3 9v1"
  }], ["path", {
    "d": "M21 9v2"
  }], ["path", {
    "d": "M3 14v1"
  }]],
  "Hand": [["path", {
    "d": "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"
  }], ["path", {
    "d": "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"
  }], ["path", {
    "d": "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"
  }], ["path", {
    "d": "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"
  }]],
  "Move": [["path", {
    "d": "M12 2v20"
  }], ["path", {
    "d": "m15 19-3 3-3-3"
  }], ["path", {
    "d": "m19 9 3 3-3 3"
  }], ["path", {
    "d": "M2 12h20"
  }], ["path", {
    "d": "m5 9-3 3 3 3"
  }], ["path", {
    "d": "m9 5 3-3 3 3"
  }]],
  "Pentagon": [["path", {
    "d": "M10.83 2.38a2 2 0 0 1 2.34 0l8 5.74a2 2 0 0 1 .73 2.25l-3.04 9.26a2 2 0 0 1-1.9 1.37H7.04a2 2 0 0 1-1.9-1.37L2.1 10.37a2 2 0 0 1 .73-2.25z"
  }]],
  "Route": [["circle", {
    "cx": "6",
    "cy": "19",
    "r": "3"
  }], ["path", {
    "d": "M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"
  }], ["circle", {
    "cx": "18",
    "cy": "5",
    "r": "3"
  }]],
  "Spline": [["circle", {
    "cx": "19",
    "cy": "5",
    "r": "2"
  }], ["circle", {
    "cx": "5",
    "cy": "19",
    "r": "2"
  }], ["path", {
    "d": "M5 17A12 12 0 0 1 17 5"
  }]],
  "Shapes": [["path", {
    "d": "M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"
  }], ["rect", {
    "x": "3",
    "y": "14",
    "width": "7",
    "height": "7",
    "rx": "1"
  }], ["circle", {
    "cx": "17.5",
    "cy": "17.5",
    "r": "3.5"
  }]],
  "Ruler": [["path", {
    "d": "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"
  }], ["path", {
    "d": "m14.5 12.5 2-2"
  }], ["path", {
    "d": "m11.5 9.5 2-2"
  }], ["path", {
    "d": "m8.5 6.5 2-2"
  }], ["path", {
    "d": "m17.5 15.5 2-2"
  }]],
  "Crosshair": [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }], ["line", {
    "x1": "22",
    "x2": "18",
    "y1": "12",
    "y2": "12"
  }], ["line", {
    "x1": "6",
    "x2": "2",
    "y1": "12",
    "y2": "12"
  }], ["line", {
    "x1": "12",
    "x2": "12",
    "y1": "6",
    "y2": "2"
  }], ["line", {
    "x1": "12",
    "x2": "12",
    "y1": "22",
    "y2": "18"
  }]],
  "Magnet": [["path", {
    "d": "m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"
  }], ["path", {
    "d": "m5 8 4 4"
  }], ["path", {
    "d": "m12 15 4 4"
  }]],
  "Scan": [["path", {
    "d": "M3 7V5a2 2 0 0 1 2-2h2"
  }], ["path", {
    "d": "M17 3h2a2 2 0 0 1 2 2v2"
  }], ["path", {
    "d": "M21 17v2a2 2 0 0 1-2 2h-2"
  }], ["path", {
    "d": "M7 21H5a2 2 0 0 1-2-2v-2"
  }]],
  "Grid2X2": [["path", {
    "d": "M12 3v18"
  }], ["path", {
    "d": "M3 12h18"
  }], ["rect", {
    "x": "3",
    "y": "3",
    "width": "18",
    "height": "18",
    "rx": "2"
  }]],
  "Layers": [["path", {
    "d": "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"
  }], ["path", {
    "d": "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"
  }], ["path", {
    "d": "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"
  }]],
  "MapPin": [["path", {
    "d": "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
  }], ["circle", {
    "cx": "12",
    "cy": "10",
    "r": "3"
  }]],
  "Anchor": [["path", {
    "d": "M12 22V8"
  }], ["path", {
    "d": "M5 12H2a10 10 0 0 0 20 0h-3"
  }], ["circle", {
    "cx": "12",
    "cy": "5",
    "r": "3"
  }]],
  "Map": [["path", {
    "d": "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"
  }], ["path", {
    "d": "M15 5.764v15"
  }], ["path", {
    "d": "M9 3.236v15"
  }]],
  "Compass": [["path", {
    "d": "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"
  }], ["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10"
  }]]
};
const iconNames = Object.keys(ICONS);
const sourceIconNames = ["Anchor", "Check", "ChevronDown", "ChevronRight", "Download", "FilePlus2", "FolderOpen", "Grid2X2", "Layers", "Lock", "LockOpen", "MapPin", "Moon", "MousePointer2", "Pentagon", "Pencil", "Redo2", "Route", "Save", "Search", "SquareDashedMousePointer", "Sun", "Undo2", "Upload", "X", "Trash2"];
const iconCategories = {
  "File & project": ["File", "FileText", "FileCode", "FilePlus2", "FileJson", "Folder", "FolderOpen", "FolderPlus", "FolderTree", "Save", "Download", "Upload", "Import", "Archive", "Trash2"],
  "Edit": ["Pencil", "Undo2", "Redo2", "Scissors", "Copy", "ClipboardPaste", "Eraser", "Type", "Replace", "WrapText", "Plus", "Minus", "X", "Check"],
  "Layout & view": ["PanelLeft", "PanelRight", "PanelBottom", "PanelLeftClose", "PanelRightClose", "Columns2", "Rows2", "LayoutGrid", "LayoutPanelLeft", "Maximize2", "Minimize2", "Eye", "EyeOff", "ZoomIn", "ZoomOut", "Moon", "Sun", "Monitor"],
  "Navigation": ["ChevronDown", "ChevronRight", "ChevronLeft", "ChevronUp", "ChevronsUpDown", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "ExternalLink", "Menu", "Ellipsis", "EllipsisVertical", "GripVertical"],
  "Run & build": ["Play", "Pause", "Square", "StepForward", "RotateCw", "RefreshCw", "Bug", "Terminal", "SquareTerminal", "Code", "Braces", "Variable", "Zap", "Hammer", "Rocket"],
  "AI & generate": ["Sparkles", "WandSparkles", "Bot", "MessageSquare", "Send", "Lightbulb", "Shuffle", "Dices"],
  "Source control": ["GitBranch", "GitCommitHorizontal", "GitMerge", "GitPullRequest", "GitCompare", "History"],
  "Status": ["CircleCheck", "CircleAlert", "TriangleAlert", "Info", "CircleX", "LoaderCircle", "Bell", "CircleHelp", "Ban", "ShieldCheck"],
  "Search & data": ["Search", "Filter", "ListFilter", "SlidersHorizontal", "ArrowUpDown", "Table", "List", "ListTree", "Hash", "Database", "Server", "Link", "Tag", "Star", "Pin", "Calendar", "Clock"],
  "System": ["Settings", "Settings2", "User", "Users", "Key", "Lock", "LockOpen", "Plug", "Cloud", "CloudOff", "HardDrive", "Package", "Puzzle", "Globe"],
  "Canvas & geometry": ["MousePointer2", "SquareDashedMousePointer", "Hand", "Move", "Pentagon", "Route", "Spline", "Shapes", "Ruler", "Crosshair", "Magnet", "Scan", "Grid2X2", "Layers", "MapPin", "Anchor", "Map", "Compass"]
};
function Icon({
  name,
  size = 16,
  strokeWidth = 2,
  color = 'currentColor',
  style,
  ...rest
}) {
  const nodes = ICONS[name];
  if (!nodes) return null;
  return React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    style: {
      flexShrink: 0,
      display: 'block',
      ...style
    },
    ...rest
  }, nodes.map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...attrs
  })));
}
Object.assign(__ds_scope, { iconNames, sourceIconNames, iconCategories, Icon });
})();

// components/core/SectionHeading.jsx
(() => {
function SectionHeading({
  children,
  trailing,
  flush = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '.7px',
      color: 'var(--muted)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      marginBottom: flush ? 0 : 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      textTransform: 'uppercase'
    }
  }, children), trailing);
}
Object.assign(__ds_scope, { SectionHeading });
})();

// components/core/Separator.jsx
(() => {
function Separator({
  size = 'command',
  style
}) {
  const h = size === 'title' ? 17 : 22;
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      height: h,
      width: 1,
      background: 'var(--border)',
      margin: '0 6px',
      flexShrink: 0,
      display: 'inline-block',
      ...style
    }
  });
}
Object.assign(__ds_scope, { Separator });
})();

// components/core/StatusDot.jsx
(() => {
const colors = {
  ready: '#83c7a5',
  pending: '#dbb569',
  error: 'var(--error)',
  live: '#88c3ed'
};
function StatusDot({
  status = 'ready',
  label,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    role: label ? 'img' : undefined,
    "aria-label": label,
    style: {
      display: 'inline-block',
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: colors[status],
      flexShrink: 0,
      ...style
    }
  });
}
Object.assign(__ds_scope, { StatusDot });
})();

// components/core/useInteractive.js
(() => {
// Hover / press / focus-visible state for inline-styled controls.
function useInteractive(disabled) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: e => setFocus(!!(e.currentTarget.matches && e.currentTarget.matches(':focus-visible'))),
    onBlur: () => setFocus(false)
  };
  return {
    hover: hover && !disabled,
    focus,
    handlers
  };
}
const focusRing = {
  outline: '2px solid var(--accent)',
  outlineOffset: '-2px'
};
Object.assign(__ds_scope, { useInteractive, focusRing });
})();

// components/core/Button.jsx
(() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  md: {
    minHeight: 29,
    padding: '5px 9px',
    fontSize: 12
  },
  sm: {
    minHeight: 25,
    padding: '4px 8px',
    fontSize: 11
  },
  xs: {
    minHeight: 23,
    padding: '2px 7px',
    fontSize: 10
  }
};
function Button({
  variant = 'default',
  active = false,
  size = 'md',
  icon,
  iconSize = 15,
  wide = false,
  disabled = false,
  type = 'button',
  children,
  style,
  onClick,
  ...rest
}) {
  const {
    hover,
    focus,
    handlers
  } = __ds_scope.useInteractive(disabled);
  const ghost = variant === 'ghost';
  let s = {
    cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: ghost ? 'transparent' : 'var(--surface-2)',
    color: 'var(--text)',
    border: '1px solid ' + (ghost ? 'transparent' : 'var(--border)'),
    borderRadius: 4,
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    fontWeight: 400,
    lineHeight: 1.2,
    ...sizes[size]
  };
  if (hover) s = {
    ...s,
    background: 'var(--surface-3)',
    borderColor: 'var(--muted)'
  };
  if (variant === 'primary') s = {
    ...s,
    background: 'var(--accent)',
    color: 'var(--accent-fg)',
    borderColor: 'transparent',
    fontWeight: 600,
    filter: hover ? 'brightness(1.1)' : undefined
  };
  if (variant === 'danger') s = {
    ...s,
    color: 'var(--error)'
  };
  if (active) s = {
    ...s,
    color: 'var(--accent)',
    background: 'var(--accent-soft)',
    borderColor: 'var(--accent)'
  };
  if (wide) s.width = '100%';
  if (disabled) s.opacity = 0.42;
  if (focus) s = {
    ...s,
    ...__ds_scope.focusRing
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    "aria-pressed": active || undefined,
    onClick: onClick,
    style: {
      ...s,
      ...style
    }
  }, handlers, rest), typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: iconSize
  }) : icon, children);
}
Object.assign(__ds_scope, { Button });
})();

// components/core/IconButton.jsx
(() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  icon,
  label,
  size = 'md',
  variant = 'default',
  iconSize,
  style,
  ...rest
}) {
  const d = size === 'sm' ? 27 : 29;
  return /*#__PURE__*/React.createElement(__ds_scope.Button, _extends({
    variant: variant,
    icon: icon,
    iconSize: iconSize ?? (size === 'sm' ? 14 : 16),
    "aria-label": label,
    title: label,
    style: {
      padding: 4,
      width: d,
      height: d,
      minHeight: d,
      flexShrink: 0,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { IconButton });
})();

// components/explorer/LayerPanel.jsx
(() => {
function LayerPanel({
  title = 'Map layers',
  icon = 'Layers',
  open = true,
  children,
  footer
}) {
  return /*#__PURE__*/React.createElement("details", {
    open: open,
    style: {
      borderTop: '1px solid var(--border)',
      flexShrink: 0,
      padding: '10px 12px',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      cursor: 'pointer',
      fontSize: 11,
      color: 'var(--muted)',
      listStyle: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14
  }), title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '9px 12px',
      margin: '13px 0'
    }
  }, children), footer);
}
Object.assign(__ds_scope, { LayerPanel });
})();

// components/explorer/ProjectHeading.jsx
(() => {
function ProjectHeading({
  icon = 'FolderOpen',
  name,
  count
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '15px 12px 12px',
      color: 'var(--accent)'
    }
  }, typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }) : icon, /*#__PURE__*/React.createElement("strong", {
    title: name,
    style: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      color: 'var(--text)',
      flex: 1,
      fontSize: 12,
      fontWeight: 600
    }
  }, name), count !== undefined && /*#__PURE__*/React.createElement(__ds_scope.Badge, null, count));
}
Object.assign(__ds_scope, { ProjectHeading });
})();

// components/explorer/SidebarTabs.jsx
(() => {
function Tab({
  tab,
  active,
  onSelect
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "tab",
    "aria-selected": active,
    onClick: () => onSelect(tab.id),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      flex: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      border: 0,
      borderRadius: 0,
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 11,
      padding: '5px 9px',
      whiteSpace: 'nowrap',
      background: active ? 'var(--surface-2)' : hover ? 'var(--surface-3)' : 'var(--surface)',
      color: active ? 'var(--accent)' : 'var(--text)',
      borderBottom: '2px solid ' + (active ? 'var(--accent)' : 'transparent')
    }
  }, tab.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: tab.icon,
    size: 14
  }), tab.label);
}
function SidebarTabs({
  tabs = [],
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'flex',
      borderBottom: '1px solid var(--border)',
      height: 38,
      flexShrink: 0
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement(Tab, {
    key: t.id,
    tab: t,
    active: t.id === value,
    onSelect: id => onChange && onChange(id)
  })));
}
Object.assign(__ds_scope, { SidebarTabs });
})();

// components/explorer/TreeItem.jsx
(() => {
const base = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: 30,
  minHeight: 30,
  border: 0,
  borderRadius: 0,
  justifyContent: 'flex-start',
  gap: 7,
  fontFamily: 'inherit',
  fontSize: 12,
  cursor: 'pointer',
  textAlign: 'left'
};
function TreeGroup({
  icon,
  label,
  count,
  expanded = true,
  onToggle
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-expanded": expanded,
    onClick: onToggle,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      padding: '0 12px',
      color: 'var(--text)',
      background: hover ? 'var(--surface-3)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: expanded ? 'ChevronDown' : 'ChevronRight',
    size: 13
  })), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14
  })), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 600
    }
  }, label), count !== undefined && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    style: {
      marginLeft: 'auto'
    }
  }, count));
}
function TreeItem({
  icon,
  label,
  selected = false,
  error = false,
  onClick,
  onDoubleClick,
  title
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-pressed": selected,
    title: title || label,
    onClick: onClick,
    onDoubleClick: onDoubleClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      padding: '0 16px 0 38px',
      color: selected ? 'var(--text)' : 'var(--muted)',
      background: selected ? 'var(--accent-soft)' : hover ? 'var(--surface-3)' : 'transparent'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 13
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    }
  }, label || '(unnamed)'), error && /*#__PURE__*/React.createElement("span", {
    "aria-label": "Validation error",
    style: {
      width: 5,
      height: 5,
      background: 'var(--error)',
      borderRadius: '50%',
      flexShrink: 0,
      marginLeft: 'auto'
    }
  }));
}
Object.assign(__ds_scope, { TreeGroup, TreeItem });
})();

// components/feedback/EmptyState.jsx
(() => {
function EmptyState({
  icon = 'Pentagon',
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      padding: '24px 28px',
      textAlign: 'center',
      color: 'var(--muted)',
      lineHeight: 1.6,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 26
  }) : icon), title && /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text)',
      fontWeight: 600
    }
  }, title), children && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, children));
}
Object.assign(__ds_scope, { EmptyState });
})();

// components/feedback/InlineStatus.jsx
(() => {
function InlineStatus({
  children,
  icon = 'Check',
  actionLabel,
  onAction
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      color: 'var(--accent)',
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14
  }), children, actionLabel && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "xs",
    onClick: onAction,
    style: {
      marginLeft: 'auto'
    }
  }, actionLabel));
}
Object.assign(__ds_scope, { InlineStatus });
})();

// components/feedback/MapCaption.jsx
(() => {
function MapCaption({
  children,
  sub = 'SYNTHETIC EXERCISE DATA · NOT FOR NAVIGATION',
  live = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: 'none',
      position: 'absolute',
      left: 16,
      bottom: 48,
      background: '#1b2431ec',
      color: '#d6e1ef',
      border: '1px solid #49596e',
      borderRadius: 4,
      fontSize: 11,
      padding: '10px 12px',
      maxWidth: 'calc(100% - 32px)',
      lineHeight: 1.6,
      boxShadow: '0 3px 18px #0002',
      ...style
    }
  }, live && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      display: 'inline-block',
      background: '#88c3ed',
      borderRadius: '50%',
      margin: '0 7px 1px 0'
    }
  }), children, sub && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 8,
      letterSpacing: '1px',
      color: '#8ea2b9',
      paddingTop: 3
    }
  }, sub));
}
Object.assign(__ds_scope, { MapCaption });
})();

// components/feedback/MapNotice.jsx
(() => {
function MapNotice({
  title,
  children,
  actionLabel,
  onAction,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 16,
      left: 55,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 9,
      boxShadow: '0 5px 24px #0003',
      fontSize: 12,
      color: 'var(--text)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 600
    }
  }, title), children && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, children), actionLabel && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: onAction
  }, actionLabel));
}
Object.assign(__ds_scope, { MapNotice });
})();

// components/feedback/Notification.jsx
(() => {
function Notification({
  tone = 'info',
  children,
  onDismiss,
  style
}) {
  const error = tone === 'error';
  return /*#__PURE__*/React.createElement("div", {
    role: error ? 'alert' : 'status',
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 12px',
      borderBottom: '1px solid var(--border)',
      background: error ? 'color-mix(in srgb, var(--error) 8%, var(--surface))' : 'var(--accent-soft)',
      color: error ? 'var(--error)' : 'var(--text)',
      lineHeight: 1.5,
      fontSize: 12,
      flexShrink: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), onDismiss && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "X",
    iconSize: 15,
    label: "Dismiss notification",
    onClick: onDismiss
  }));
}
Object.assign(__ds_scope, { Notification });
})();

// components/feedback/Progress.jsx
(() => {
function Progress({
  value = 0,
  max = 1,
  label,
  onCancel,
  cancelLabel = 'Cancel',
  bare = false
}) {
  const bar = /*#__PURE__*/React.createElement("progress", {
    value: value,
    max: max || 1,
    style: {
      width: '100%',
      accentColor: 'var(--accent)',
      height: 6
    }
  });
  if (bare) return bar;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 12,
      border: '1px solid var(--border)',
      borderRadius: 4,
      color: 'var(--muted)',
      fontSize: 12
    }
  }, bar, label && /*#__PURE__*/React.createElement("span", null, label), onCancel && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: onCancel
  }, cancelLabel));
}
Object.assign(__ds_scope, { Progress });
})();

// components/feedback/SummaryCard.jsx
(() => {
function SummaryCard({
  title,
  lines = [],
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 12,
      border: '1px solid var(--border)',
      borderRadius: 4,
      color: 'var(--muted)',
      fontSize: 12,
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text)',
      fontWeight: 600
    }
  }, title), lines.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, l)), children);
}
Object.assign(__ds_scope, { SummaryCard });
})();

// components/forms/Checkbox.jsx
(() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked,
  indeterminate = false,
  onChange,
  disabled,
  count,
  color = 'var(--text)',
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      color,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.42 : 1,
      minWidth: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked, e),
    style: {
      width: 13,
      height: 13,
      margin: 0,
      accentColor: 'var(--accent)',
      flexShrink: 0
    }
  }, rest)), count === undefined ? label : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--muted)',
      background: 'var(--surface-3)',
      padding: '2px 5px',
      borderRadius: 3
    }
  }, count)));
}
Object.assign(__ds_scope, { Checkbox });
})();

// components/forms/Field.jsx
(() => {
function Field({
  label,
  children,
  size = 'md',
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontSize: size === 'sm' ? 10 : 12,
      color: 'var(--muted)',
      ...style
    }
  }, label, children);
}
function FieldPair({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Field, FieldPair });
})();

// components/forms/PositionRow.jsx
(() => {
function PositionRow({
  index,
  value,
  onChange,
  onRemove,
  removeDisabled = false,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      alignItems: 'center',
      gap: 6,
      padding: '5px 6px',
      border: '1px solid var(--border)',
      borderRadius: 4
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      flexShrink: 0
    }
  }, "Point ", index), /*#__PURE__*/React.createElement("input", {
    "aria-label": 'Point ' + index + ' position',
    spellCheck: false,
    disabled: disabled,
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      font: 'inherit',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      border: '1px solid var(--border)',
      color: 'var(--text)',
      background: 'var(--bg)',
      padding: '6px 8px',
      borderRadius: 3,
      minWidth: 0,
      width: '100%',
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "Trash2",
    label: 'Remove point ' + index,
    size: "sm",
    variant: "danger",
    disabled: removeDisabled || disabled,
    onClick: onRemove
  })));
}
Object.assign(__ds_scope, { PositionRow });
})();

// components/forms/SearchBox.jsx
(() => {
function SearchBox({
  value,
  onChange,
  placeholder = 'Search...',
  label = 'Search',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 7px',
      gap: 4,
      border: '1px solid var(--border)',
      background: 'var(--bg)',
      borderRadius: 3,
      color: 'var(--muted)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "Search",
    size: 14
  }), /*#__PURE__*/React.createElement("input", {
    "aria-label": label,
    placeholder: placeholder,
    value: value,
    onChange: e => onChange && onChange(e.target.value, e),
    style: {
      font: 'inherit',
      fontSize: 12,
      border: 0,
      background: 'transparent',
      color: 'var(--text)',
      padding: '6px 8px 6px 3px',
      width: '100%',
      minWidth: 0,
      outline: 'none'
    }
  }));
}
Object.assign(__ds_scope, { SearchBox });
})();

// components/forms/Select.jsx
(() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  options = [],
  size = 'md',
  style,
  children,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    onFocus: e => setFocus(e.currentTarget.matches(':focus-visible')),
    onBlur: () => setFocus(false),
    style: {
      font: 'inherit',
      fontSize: size === 'sm' ? 10 : 12,
      border: '1px solid var(--border)',
      color: 'var(--text)',
      background: 'var(--bg)',
      padding: size === 'sm' ? '4px 6px' : '6px 8px',
      borderRadius: 3,
      minWidth: 0,
      width: '100%',
      ...(focus ? __ds_scope.focusRing : {
        outline: 'none'
      }),
      ...style
    }
  }), options.map(o => typeof o === 'string' ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)), children);
}
Object.assign(__ds_scope, { Select });
})();

// components/forms/TextInput.jsx
(() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextInput({
  mono = false,
  invalid = false,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("input", _extends({
    spellCheck: mono ? false : undefined
  }, rest, {
    onFocus: e => {
      setFocus(e.currentTarget.matches(':focus-visible'));
      onFocus && onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      onBlur && onBlur(e);
    },
    style: {
      font: 'inherit',
      fontSize: 12,
      fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      border: '1px solid ' + (invalid ? 'var(--error)' : 'var(--border)'),
      color: 'var(--text)',
      background: 'var(--bg)',
      padding: '6px 8px',
      borderRadius: 3,
      minWidth: 0,
      width: '100%',
      opacity: rest.disabled ? 0.42 : 1,
      ...(focus ? __ds_scope.focusRing : {
        outline: 'none'
      }),
      ...style
    }
  }));
}
Object.assign(__ds_scope, { TextInput });
})();

// components/forms/FilterGroup.jsx
(() => {
function FilterGroup({
  label,
  options = [],
  value = [],
  onChange,
  searchable = false,
  height = 115
}) {
  const [q, setQ] = React.useState('');
  const visible = options.filter(o => o.label.toLowerCase().includes(q.trim().toLowerCase()));
  const set = v => onChange && onChange(v);
  return /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: 8,
      margin: 0,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      padding: '0 5px',
      color: 'var(--text)',
      fontSize: 12
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'var(--muted)',
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("span", null, value.length ? value.length + ' selected' : 'All values'), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "xs",
    disabled: !value.length,
    onClick: () => set([])
  }, "Clear")), searchable && /*#__PURE__*/React.createElement(__ds_scope.TextInput, {
    "aria-label": 'Search ' + label.toLowerCase(),
    placeholder: 'Search ' + label.toLowerCase() + '...',
    value: q,
    onChange: e => setQ(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, visible.map(o => /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
    key: o.value,
    label: o.label,
    count: o.count,
    checked: value.includes(o.value),
    onChange: c => set(c ? [...value, o.value] : value.filter(v => v !== o.value)),
    style: {
      fontSize: 12,
      gap: 7
    }
  })), !visible.length && /*#__PURE__*/React.createElement(__ds_scope.Hint, null, "No options match. Clear another filter or the search.")));
}
Object.assign(__ds_scope, { FilterGroup });
})();

// components/overlays/DataTable.jsx
(() => {
function DataTable({
  columns = [],
  rows = [],
  maxHeight = 340,
  minWidth,
  stickyHeader = true,
  caption,
  size = 'md'
}) {
  const pad = size === 'sm' ? 5 : 8;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight,
      overflow: 'auto',
      border: '1px solid var(--border)',
      padding: caption ? 10 : 0
    }
  }, caption && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 8px',
      color: 'var(--muted)',
      fontSize: 12
    }
  }, caption), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      minWidth,
      borderCollapse: 'collapse',
      tableLayout: size === 'sm' ? 'fixed' : 'auto',
      fontSize: size === 'sm' ? 12 : 11,
      color: 'var(--text)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: 'left',
      padding: pad,
      borderBottom: '1px solid var(--border)',
      fontWeight: 600,
      position: stickyHeader ? 'sticky' : undefined,
      top: 0,
      background: size === 'sm' ? 'transparent' : 'var(--surface-2)',
      width: c.width
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.key ?? i
  }, columns.map(c => {
    const v = r[c.key];
    const sub = c.sub ? r[c.sub] : null;
    return /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        textAlign: 'left',
        padding: pad,
        borderBottom: '1px solid var(--border)',
        verticalAlign: 'top',
        overflowWrap: 'anywhere'
      }
    }, v, sub != null && /*#__PURE__*/React.createElement("small", {
      style: {
        display: 'block',
        marginTop: 4,
        color: 'var(--muted)',
        fontSize: 'inherit'
      }
    }, sub));
  }))))));
}
Object.assign(__ds_scope, { DataTable });
})();

// components/overlays/Modal.jsx
(() => {
function Modal({
  title,
  eyebrow,
  children,
  onClose,
  width = 430,
  gap = 18,
  closeButton = true,
  inline = false,
  onSubmit
}) {
  React.useEffect(() => {
    if (!onClose || inline) return;
    const k = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose, inline]);
  const dialog = /*#__PURE__*/React.createElement("form", {
    role: "dialog",
    "aria-modal": "true",
    onSubmit: e => {
      e.preventDefault();
      onSubmit && onSubmit(e);
    },
    style: {
      width: typeof width === 'number' ? 'min(' + width + 'px, calc(100vw - 40px))' : width,
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      boxShadow: '0 20px 80px #0005',
      borderRadius: 6,
      padding: 22,
      display: 'flex',
      flexDirection: 'column',
      gap,
      color: 'var(--text)',
      fontSize: 12
    }
  }, (title || closeButton) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '.7px',
      color: 'var(--muted)',
      textTransform: 'uppercase'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: 0,
      color: 'var(--text)'
    }
  }, title)), closeButton && onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "X",
    label: "Close",
    onClick: onClose
  })), children);
  if (inline) return dialog;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: '#080d15aa',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(3px)'
    }
  }, dialog);
}
function ButtonRow({
  children,
  align = 'end',
  fill = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      justifyContent: align === 'between' ? 'space-between' : 'flex-end',
      ...style
    }
  }, React.Children.map(children, c => fill && React.isValidElement(c) && c.type !== 'span' ? React.cloneElement(c, {
    style: {
      flex: 1,
      ...(c.props.style || {})
    }
  }) : c));
}
Object.assign(__ds_scope, { Modal, ButtonRow });
})();

// components/overlays/Pagination.jsx
(() => {
function Pagination({
  page,
  pageCount,
  onChange,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'space-between',
      fontSize: 12,
      color: 'var(--text)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    disabled: page <= 0,
    onClick: () => onChange && onChange(page - 1)
  }, previousLabel), /*#__PURE__*/React.createElement("span", null, label ?? 'Page ' + (page + 1) + ' of ' + pageCount), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    disabled: page + 1 >= pageCount,
    onClick: () => onChange && onChange(page + 1)
  }, nextLabel));
}
Object.assign(__ds_scope, { Pagination });
})();

// components/shell/CommandBar.jsx
(() => {
function CommandBar({
  children,
  label = 'Commands',
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": label,
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '7px 10px',
      gap: 6,
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      flexShrink: 0,
      overflowX: 'auto',
      ...style
    }
  }, children);
}
function Spacer() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  });
}
Object.assign(__ds_scope, { CommandBar, Spacer });
})();

// components/shell/ProblemsBar.jsx
(() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProblemsBar({
  open = false,
  onToggle,
  errors = 0,
  warnings = 0,
  showErrors = true,
  showWarnings = true,
  onToggleErrors,
  onToggleWarnings,
  pending = false,
  hint
}) {
  const t = __ds_scope.useInteractive(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface-2)',
      justifyContent: 'space-between',
      gap: 10,
      padding: '0 9px',
      height: 33,
      flexShrink: 0,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-expanded": open,
    onClick: onToggle
  }, t.handlers, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      border: 0,
      background: t.hover ? 'var(--surface-3)' : 'transparent',
      color: 'var(--text)',
      fontSize: 11,
      fontFamily: 'inherit',
      padding: '5px 9px',
      minHeight: 29,
      borderRadius: 4,
      cursor: 'pointer'
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: open ? 'ChevronDown' : 'ChevronRight',
    size: 14
  }), "Problems"), /*#__PURE__*/React.createElement(ProblemFilter, {
    pressed: showErrors,
    tone: errors ? 'error' : 'default',
    onClick: onToggleErrors
  }, errors, " errors"), /*#__PURE__*/React.createElement(ProblemFilter, {
    pressed: showWarnings,
    onClick: onToggleWarnings
  }, warnings, " warnings"), pending && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      fontSize: 10
    }
  }, "Validating...")), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, hint));
}
function ProblemFilter({
  pressed = true,
  tone = 'default',
  onClick,
  children
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-pressed": pressed,
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 22,
      padding: '2px 5px',
      fontSize: 10,
      fontFamily: 'inherit',
      border: '1px solid var(--border)',
      borderRadius: 4,
      cursor: 'pointer',
      background: pressed ? 'var(--surface-3)' : 'transparent',
      opacity: pressed ? 1 : 0.6,
      textDecoration: pressed ? 'none' : 'line-through',
      color: tone === 'error' ? 'var(--error)' : 'var(--muted)'
    }
  }, children);
}
function ProblemRow({
  severity = 'error',
  feature,
  message,
  onClick
}) {
  const t = __ds_scope.useInteractive(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick
  }, t.handlers, {
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      background: t.hover ? 'var(--surface-3)' : 'transparent',
      border: 0,
      fontSize: 11,
      fontFamily: 'inherit',
      color: 'var(--text)',
      borderRadius: 0,
      gap: 10,
      textAlign: 'left',
      whiteSpace: 'normal',
      padding: '5px 9px',
      minHeight: 29,
      cursor: 'pointer'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      minWidth: 35,
      color: severity === 'error' ? 'var(--error)' : 'var(--warning)'
    }
  }, severity === 'error' ? 'ERROR' : 'WARN'), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 10,
      minWidth: 100,
      fontWeight: 500
    }
  }, feature), /*#__PURE__*/React.createElement("span", null, message));
}
Object.assign(__ds_scope, { ProblemsBar, ProblemFilter, ProblemRow });
})();

// components/shell/Splitter.jsx
(() => {
function Splitter({
  value,
  min = 260,
  max = 580,
  step = 20,
  onChange,
  label = 'Resize panel'
}) {
  const [hot, setHot] = React.useState(false);
  const drag = e => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const startX = e.clientX,
      start = value;
    const move = ev => onChange && onChange(Math.min(max, Math.max(min, start + ev.clientX - startX)));
    const stop = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', stop);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', stop);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "separator",
    "aria-label": label,
    "aria-orientation": "vertical",
    "aria-valuenow": value,
    "aria-valuemin": min,
    "aria-valuemax": max,
    tabIndex: 0,
    onPointerDown: drag,
    onMouseEnter: () => setHot(true),
    onMouseLeave: () => setHot(false),
    onFocus: () => setHot(true),
    onBlur: () => setHot(false),
    onKeyDown: e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        onChange && onChange(Math.min(max, Math.max(min, value + (e.key === 'ArrowRight' ? step : -step))));
      }
    },
    style: {
      width: 5,
      flexShrink: 0,
      background: hot ? 'var(--accent)' : 'var(--border)',
      cursor: 'col-resize',
      touchAction: 'none',
      outline: 'none'
    }
  });
}
Object.assign(__ds_scope, { Splitter });
})();

// components/shell/StatusBar.jsx
(() => {
function StatusBar({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      height: 25,
      flexShrink: 0,
      background: 'var(--accent-soft)',
      color: 'var(--text)',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: '0 12px',
      fontSize: 10,
      borderTop: '1px solid var(--border)',
      ...style
    }
  }, children);
}
function StatusItem({
  children,
  grow = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flex: grow ? 1 : undefined
    }
  }, children);
}
Object.assign(__ds_scope, { StatusBar, StatusItem });
})();

// components/shell/Titlebar.jsx
(() => {
function Titlebar({
  icon = 'Layers',
  title,
  context,
  dirty = false,
  tag,
  trailing,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 40,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 12px',
      background: 'var(--surface-2)',
      borderBottom: '1px solid var(--border)',
      fontSize: 12,
      color: 'var(--text)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      display: 'flex'
    }
  }, typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17
  }) : icon), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, title), context !== undefined && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Separator, {
    size: "title"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, context, dirty ? ' *' : '')), context === undefined && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), tag && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: 9,
      letterSpacing: '1.2px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }
  }, tag), trailing);
}
Object.assign(__ds_scope, { Titlebar });
})();

// components/shell/Toolbar.jsx
(() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Toolbar({
  children,
  label = 'Tools',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "toolbar",
    "aria-label": label,
    style: {
      height: 38,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 10px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
      overflowX: 'auto',
      fontSize: 12,
      color: 'var(--text)',
      ...style
    }
  }, children);
}
function ToolButton({
  icon,
  label,
  active = false,
  showLabel = true,
  disabled = false,
  onClick,
  title
}) {
  const {
    hover,
    focus,
    handlers
  } = __ds_scope.useInteractive(disabled);
  let s = {
    cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid transparent',
    borderRadius: 4,
    fontFamily: 'inherit',
    fontSize: 11,
    padding: '4px 7px',
    height: 28,
    minHeight: 28,
    whiteSpace: 'nowrap'
  };
  if (hover) s = {
    ...s,
    background: 'var(--surface-3)',
    borderColor: 'var(--muted)'
  };
  if (active) s = {
    ...s,
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    borderColor: 'var(--accent)'
  };
  if (disabled) s.opacity = 0.42;
  if (focus) s = {
    ...s,
    ...__ds_scope.focusRing
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    title: title || label,
    "aria-label": label,
    "aria-pressed": active,
    disabled: disabled,
    onClick: onClick,
    style: s
  }, handlers), typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }) : icon, showLabel && /*#__PURE__*/React.createElement("span", null, label));
}
function CoordinateBadge({
  children = 'WGS 84 / NM'
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      whiteSpace: 'nowrap'
    }
  }, children);
}
Object.assign(__ds_scope, { Toolbar, ToolButton, CoordinateBadge });
})();

export const {
  Badge,
  Eyebrow,
  Hint,
  iconNames,
  sourceIconNames,
  iconCategories,
  Icon,
  SectionHeading,
  Separator,
  StatusDot,
  useInteractive,
  focusRing,
  Button,
  IconButton,
  LayerPanel,
  ProjectHeading,
  SidebarTabs,
  TreeGroup,
  TreeItem,
  EmptyState,
  InlineStatus,
  MapCaption,
  MapNotice,
  Notification,
  Progress,
  SummaryCard,
  Checkbox,
  Field,
  FieldPair,
  PositionRow,
  SearchBox,
  Select,
  TextInput,
  FilterGroup,
  DataTable,
  Modal,
  ButtonRow,
  Pagination,
  CommandBar,
  Spacer,
  ProblemsBar,
  ProblemFilter,
  ProblemRow,
  Splitter,
  StatusBar,
  StatusItem,
  Titlebar,
  Toolbar,
  ToolButton,
  CoordinateBadge,
} = __ds_scope;
