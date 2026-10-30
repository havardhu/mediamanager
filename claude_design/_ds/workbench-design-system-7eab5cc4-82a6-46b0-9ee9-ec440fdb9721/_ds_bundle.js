/* @ds-bundle: {"format":4,"namespace":"WorkbenchDesignSystem_7eab5c","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"Hint","sourcePath":"components/core/Hint.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"SectionHeading","sourcePath":"components/core/SectionHeading.jsx"},{"name":"Separator","sourcePath":"components/core/Separator.jsx"},{"name":"StatusDot","sourcePath":"components/core/StatusDot.jsx"},{"name":"LayerPanel","sourcePath":"components/explorer/LayerPanel.jsx"},{"name":"ProjectHeading","sourcePath":"components/explorer/ProjectHeading.jsx"},{"name":"SidebarTabs","sourcePath":"components/explorer/SidebarTabs.jsx"},{"name":"TreeGroup","sourcePath":"components/explorer/TreeItem.jsx"},{"name":"TreeItem","sourcePath":"components/explorer/TreeItem.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"InlineStatus","sourcePath":"components/feedback/InlineStatus.jsx"},{"name":"MapCaption","sourcePath":"components/feedback/MapCaption.jsx"},{"name":"MapNotice","sourcePath":"components/feedback/MapNotice.jsx"},{"name":"Notification","sourcePath":"components/feedback/Notification.jsx"},{"name":"Progress","sourcePath":"components/feedback/Progress.jsx"},{"name":"SummaryCard","sourcePath":"components/feedback/SummaryCard.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"FieldPair","sourcePath":"components/forms/Field.jsx"},{"name":"FilterGroup","sourcePath":"components/forms/FilterGroup.jsx"},{"name":"PositionRow","sourcePath":"components/forms/PositionRow.jsx"},{"name":"SearchBox","sourcePath":"components/forms/SearchBox.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextInput","sourcePath":"components/forms/TextInput.jsx"},{"name":"DataTable","sourcePath":"components/overlays/DataTable.jsx"},{"name":"Modal","sourcePath":"components/overlays/Modal.jsx"},{"name":"ButtonRow","sourcePath":"components/overlays/Modal.jsx"},{"name":"Pagination","sourcePath":"components/overlays/Pagination.jsx"},{"name":"CommandBar","sourcePath":"components/shell/CommandBar.jsx"},{"name":"Spacer","sourcePath":"components/shell/CommandBar.jsx"},{"name":"ProblemsBar","sourcePath":"components/shell/ProblemsBar.jsx"},{"name":"ProblemFilter","sourcePath":"components/shell/ProblemsBar.jsx"},{"name":"ProblemRow","sourcePath":"components/shell/ProblemsBar.jsx"},{"name":"Splitter","sourcePath":"components/shell/Splitter.jsx"},{"name":"StatusBar","sourcePath":"components/shell/StatusBar.jsx"},{"name":"StatusItem","sourcePath":"components/shell/StatusBar.jsx"},{"name":"Titlebar","sourcePath":"components/shell/Titlebar.jsx"},{"name":"Toolbar","sourcePath":"components/shell/Toolbar.jsx"},{"name":"ToolButton","sourcePath":"components/shell/Toolbar.jsx"},{"name":"CoordinateBadge","sourcePath":"components/shell/Toolbar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"e81c800afa91","components/core/Button.jsx":"ed3d9ecedd03","components/core/Eyebrow.jsx":"41b71910bfcf","components/core/Hint.jsx":"29c2777451e8","components/core/Icon.jsx":"4f9ed508c185","components/core/IconButton.jsx":"5a4b5eda6fdc","components/core/SectionHeading.jsx":"76b5581ed672","components/core/Separator.jsx":"df4816337482","components/core/StatusDot.jsx":"a5d0b8240148","components/core/useInteractive.js":"8f8ee69f6f5c","components/explorer/LayerPanel.jsx":"64a6b2214e7f","components/explorer/ProjectHeading.jsx":"456540c2d5d5","components/explorer/SidebarTabs.jsx":"efd1a9040e35","components/explorer/TreeItem.jsx":"025d606c891c","components/feedback/EmptyState.jsx":"983e6ebe275c","components/feedback/InlineStatus.jsx":"804afbf295b2","components/feedback/MapCaption.jsx":"2d74288bfa1c","components/feedback/MapNotice.jsx":"005b5fe3d98f","components/feedback/Notification.jsx":"b222ae76cbdc","components/feedback/Progress.jsx":"68b13d36e2b1","components/feedback/SummaryCard.jsx":"16fb57308d27","components/forms/Checkbox.jsx":"afc02617c33f","components/forms/Field.jsx":"aeacf9b25b69","components/forms/FilterGroup.jsx":"3092ec758c9c","components/forms/PositionRow.jsx":"b01452512271","components/forms/SearchBox.jsx":"b5b0491a032b","components/forms/Select.jsx":"348fb4ee35c4","components/forms/TextInput.jsx":"f6e17af1084d","components/overlays/DataTable.jsx":"7efd9361045a","components/overlays/Modal.jsx":"be6618477657","components/overlays/Pagination.jsx":"b961c5638b20","components/shell/CommandBar.jsx":"03725bf72aec","components/shell/ProblemsBar.jsx":"689868c31646","components/shell/Splitter.jsx":"66c36d9bcf23","components/shell/StatusBar.jsx":"9e95bb1e7bdd","components/shell/Titlebar.jsx":"706183b1c442","components/shell/Toolbar.jsx":"c6ece6fd8010","ui_kits/area-database-designer/App.jsx":"e2e3ad03d98b","ui_kits/area-database-designer/Dialogs.jsx":"de0872b8367c","ui_kits/area-database-designer/Explorer.jsx":"e9709da7feb4","ui_kits/area-database-designer/GeneratePanel.jsx":"9276b68ff775","ui_kits/area-database-designer/MapCanvas.jsx":"37e9e25be4b6","ui_kits/area-database-designer/PropertiesDock.jsx":"3210dd0c4724","ui_kits/area-database-designer/model.js":"11f6411b858c"},"inlinedExternals":[],"unexposedExports":[{"name":"focusRing","sourcePath":"components/core/useInteractive.js"},{"name":"iconCategories","sourcePath":"components/core/Icon.jsx"},{"name":"iconNames","sourcePath":"components/core/Icon.jsx"},{"name":"sourceIconNames","sourcePath":"components/core/Icon.jsx"},{"name":"useInteractive","sourcePath":"components/core/useInteractive.js"}]} */

(() => {

const __ds_ns = (window.WorkbenchDesignSystem_7eab5c = window.WorkbenchDesignSystem_7eab5c || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Hint.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Hint.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeading.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/core/Separator.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Separator.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusDot.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusDot.jsx", error: String((e && e.message) || e) }); }

// components/core/useInteractive.js
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/useInteractive.js", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/explorer/LayerPanel.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/explorer/LayerPanel.jsx", error: String((e && e.message) || e) }); }

// components/explorer/ProjectHeading.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/explorer/ProjectHeading.jsx", error: String((e && e.message) || e) }); }

// components/explorer/SidebarTabs.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/explorer/SidebarTabs.jsx", error: String((e && e.message) || e) }); }

// components/explorer/TreeItem.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/explorer/TreeItem.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/InlineStatus.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/InlineStatus.jsx", error: String((e && e.message) || e) }); }

// components/feedback/MapCaption.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/MapCaption.jsx", error: String((e && e.message) || e) }); }

// components/feedback/MapNotice.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/MapNotice.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Notification.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Notification.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Progress.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Progress.jsx", error: String((e && e.message) || e) }); }

// components/feedback/SummaryCard.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/SummaryCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/PositionRow.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/PositionRow.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchBox.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchBox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextInput.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/FilterGroup.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FilterGroup.jsx", error: String((e && e.message) || e) }); }

// components/overlays/DataTable.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Modal.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Modal.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Pagination.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/shell/CommandBar.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/CommandBar.jsx", error: String((e && e.message) || e) }); }

// components/shell/ProblemsBar.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/ProblemsBar.jsx", error: String((e && e.message) || e) }); }

// components/shell/Splitter.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/Splitter.jsx", error: String((e && e.message) || e) }); }

// components/shell/StatusBar.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/StatusBar.jsx", error: String((e && e.message) || e) }); }

// components/shell/Titlebar.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/Titlebar.jsx", error: String((e && e.message) || e) }); }

// components/shell/Toolbar.jsx
try { (() => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shell/Toolbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/area-database-designer/App.jsx
try { (() => {
const A = window.WorkbenchDesignSystem_7eab5c;
const TOOLS = [{
  id: 'select',
  name: 'Select',
  icon: 'MousePointer2'
}, {
  id: 'box-select',
  name: 'Box select',
  icon: 'SquareDashedMousePointer'
}, {
  id: 'area',
  name: 'Draw area',
  icon: 'Pentagon'
}, {
  id: 'lane',
  name: 'Draw lane',
  icon: 'Route'
}, {
  id: 'port',
  name: 'Place port',
  icon: 'MapPin'
}];
const DEFAULT_GEN = {
  width: 10,
  height: 10,
  angle: 0,
  gridEdges: 'corners',
  coastline: 'detailed',
  island: 100,
  coastalMode: 'clip',
  clearance: 10,
  minimumArea: 25,
  removeIsolated: true,
  clipToLanes: true,
  simplify: 1000,
  naming: 'nato',
  alphabets: ['nato'],
  prefix: 'AREA'
};
const DEFAULT_LAYERS = {
  areas: true,
  lanes: true,
  ports: true,
  land: true,
  labels: true,
  basemap: false
};
function captionFor(tool, locked, selCount, tab, boundary, boundaryVisible) {
  if (tool === 'box-select') return 'Drag a box to select visible features. Ctrl-drag adds to selection. Escape returns to select.';
  if (tool === 'boundary') return 'Draw boundary: click vertices, double-click to finish';
  if (tool === 'area' || tool === 'lane') return 'Click vertices; double-click to finish. Escape returns to select.';
  if (tool === 'port') return 'Click to place a port';
  if (locked) return 'Geometry locked. Selection and properties remain available. Turn off Lock geometry to edit positions.';
  if (tool === 'edit') return selCount > 1 ? 'White: move shared points. Green: split shared edges. Points and edges used by unselected areas stay fixed. Escape finishes.' : 'Numbered white handles: move points. Green: add points. Alt-click white: remove. Click away or press Escape to finish.';
  if (tab === 'generate' && boundary && boundaryVisible) return 'Boundary: white handles move corners; green midpoints add points. Alt-click white to remove. Escape cancels a drag.';
  if (selCount) return 'Double-click a selected feature or use Edit geometry to show handles. Selecting another feature or clicking away finishes editing.';
  return 'Click to select; Ctrl-click to add or remove features. Use Box select to select a region.';
}
function App() {
  const [data, setData] = React.useState(null);
  const [project, setProject] = React.useState({
    name: 'Norwegian Sea training',
    items: [],
    layers: DEFAULT_LAYERS,
    widthDecimal: 'preserve',
    generator: DEFAULT_GEN
  });
  const [dirty, setDirty] = React.useState(false);
  const [theme, setTheme] = React.useState('dark');
  const [tool, setTool] = React.useState('select');
  const [selected, setSelected] = React.useState(new Set());
  const [tab, setTab] = React.useState('explorer');
  const [message, setMessage] = React.useState(null);
  const [problemsOpen, setProblemsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({
    error: true,
    warning: true
  });
  const [boundary, setBoundary] = React.useState(null);
  const [boundaryVisible, setBoundaryVisible] = React.useState(false);
  const [preview, setPreview] = React.useState(null);
  const [progress, setProgress] = React.useState(null);
  const [sidebarWidth, setSidebarWidth] = React.useState(330);
  const [dialog, setDialog] = React.useState(null);
  const [locked, setLocked] = React.useState(false);
  const [snap, setSnap] = React.useState(true);
  const [focus, setFocus] = React.useState(null);
  const [hist, setHist] = React.useState({
    undo: [],
    redo: []
  });
  const [winW, setWinW] = React.useState(window.innerWidth);
  const projectRef = React.useRef(project);
  projectRef.current = project;
  React.useEffect(() => {
    window.ADD.loadProject().then(d => {
      setData(d);
      setProject(p => ({
        ...p,
        items: d.items
      }));
      setSelected(new Set([d.items[0].key]));
    });
  }, []);
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  React.useEffect(() => {
    const r = () => setWinW(window.innerWidth);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const note = text => setMessage({
    text,
    error: false
  });
  const error = text => setMessage({
    text,
    error: true
  });
  const commit = next => {
    setHist(h => ({
      undo: [...h.undo.slice(-29), projectRef.current],
      redo: []
    }));
    setProject(next);
    setDirty(true);
    setPreview(null);
    setSelected(s => new Set([...s].filter(k => next.items.some(i => i.key === k))));
  };
  const undo = redo => setHist(h => {
    const from = redo ? h.redo : h.undo;
    if (!from.length) return h;
    const prev = from[from.length - 1];
    setProject(prev);
    setDirty(true);
    return redo ? {
      undo: [...h.undo, projectRef.current],
      redo: h.redo.slice(0, -1)
    } : {
      undo: h.undo.slice(0, -1),
      redo: [...h.redo, projectRef.current]
    };
  });
  React.useEffect(() => {
    const k = e => {
      if (e.target.matches && e.target.matches('input, select, textarea')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo(e.shiftKey);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        undo(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setDirty(false);
        note('Project saved to your downloads.');
      }
      if (e.key === 'Escape' && !dialog) setTool('select');
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [dialog]);
  const issues = React.useMemo(() => data ? window.ADD.validate(project.items, data.landIndex) : [], [project.items, data]);
  const errors = issues.filter(i => i.severity === 'error').length,
    warnings = issues.length - errors;
  const errorKeys = new Set(issues.filter(i => i.severity === 'error').map(i => i.key));
  const counts = {
    areas: 0,
    lanes: 0,
    ports: 0
  };
  project.items.forEach(i => counts[i.kind]++);
  const selectKey = (key, toggle) => {
    if (tool === 'edit' && !toggle && key !== [...selected][0]) setTool('select');
    setSelected(prev => {
      if (!toggle) return new Set(key ? [key] : []);
      if (!key) return prev;
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
    if (key) setTab('explorer');
  };
  const onDraw = (kind, pts) => {
    if (kind === 'boundary') {
      setBoundary(pts);
      setBoundaryVisible(true);
      setTool('select');
      setPreview(null);
      note('Boundary ready. Set cell size and orientation, then preview the grid.');
      return;
    }
    const k = kind === 'area' ? 'areas' : kind === 'lane' ? 'lanes' : 'ports';
    const name = window.ADD.nextName(project.items, kind === 'port' ? 'PORT' : kind === 'lane' ? 'LANE' : 'AREA');
    const item = {
      key: 'n' + Date.now(),
      kind: k,
      name,
      source: '',
      pts,
      ...(k === 'lanes' ? {
        width: 1.852,
        pointNames: pts.map((_, i) => String.fromCharCode(65 + i))
      } : {})
    };
    commit({
      ...project,
      items: [...project.items, item]
    });
    setSelected(new Set([item.key]));
    setTool('select');
  };
  const live = React.useRef(null);
  const onModify = (key, pts, dragging) => {
    if (dragging) {
      if (!live.current) live.current = projectRef.current;
      setProject(p => ({
        ...p,
        items: p.items.map(i => i.key === key ? {
          ...i,
          pts
        } : i)
      }));
      return;
    }
    if (live.current) {
      const before = live.current;
      live.current = null;
      setHist(h => ({
        undo: [...h.undo.slice(-29), before],
        redo: []
      }));
      setDirty(true);
    }
  };
  const deleteSelected = () => {
    commit({
      ...project,
      items: project.items.filter(i => !selected.has(i.key))
    });
    setSelected(new Set());
    setTool('select');
  };
  const previewGrid = () => {
    const g = project.generator,
      b = boundary;
    const bb = window.ADD.bbox(b);
    const lat = window.unprojLat((bb[1] + bb[3]) / 2),
      f = 1.852 / Math.cos(lat * Math.PI / 180);
    const cw = g.width * f,
      chh = g.height * f,
      cells = [];
    let candidates = 0,
      landCells = 0,
      existingCells = 0;
    const areas = project.items.filter(i => i.kind === 'areas');
    const next = window.ADD.nameSequence(g.alphabets, g.prefix, g.naming === 'grid' ? 'prefix' : g.naming);
    const used = new Set(project.items.map(i => i.name.toLowerCase()));
    for (let y = bb[1]; y < bb[3]; y += chh) for (let x = bb[0]; x < bb[2]; x += cw) {
      const c = [[x, y], [x + cw, y], [x + cw, y + chh], [x, y + chh]],
        mid = [x + cw / 2, y + chh / 2];
      if (!c.concat([mid]).some(p => window.ADD.inRing(p, b))) continue;
      candidates++;
      if ((g.coastalMode === 'clip' ? [mid] : c.concat([mid])).some(p => window.ADD.onLand(p, data.landIndex))) {
        landCells++;
        continue;
      }
      if (areas.some(a => window.ADD.inRing(mid, a.pts))) {
        existingCells++;
        continue;
      }
      cells.push(c);
    }
    const named = cells.map(c => {
      let n;
      do {
        n = next();
      } while (used.has(n.toLowerCase()));
      used.add(n.toLowerCase());
      return {
        pts: c,
        name: n
      };
    });
    const radius = Math.ceil(Math.hypot(bb[2] - bb[0], bb[3] - bb[1]) / 2 / f * 1.852);
    let done = 0;
    setProgress({
      done: 0,
      total: candidates
    });
    const timer = setInterval(() => {
      done = Math.min(candidates, done + Math.ceil(candidates / 8));
      setProgress({
        done,
        total: candidates
      });
      if (done >= candidates) {
        clearInterval(timer);
        setProgress(null);
        setBoundaryVisible(true);
        setPreview({
          cells: named.map(n => n.pts),
          named,
          candidates,
          landCells,
          existingCells,
          radius
        });
      }
    }, 90);
    live.cancel = () => {
      clearInterval(timer);
      setProgress(null);
    };
  };
  const selCount = selected.size;
  const narrow = winW < 1100;
  const selItem = selCount === 1 ? project.items.find(i => selected.has(i.key)) : null;
  const filtered = issues.filter(i => filters[i.severity]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      minWidth: 760,
      display: 'flex',
      flexDirection: 'column',
      fontSize: 12,
      background: 'var(--bg)',
      color: 'var(--text)'
    }
  }, /*#__PURE__*/React.createElement(A.Titlebar, {
    title: "Area Database Designer",
    context: project.name,
    dirty: dirty,
    tag: narrow ? undefined : 'Training workspace',
    trailing: /*#__PURE__*/React.createElement(A.IconButton, {
      icon: theme === 'dark' ? 'Sun' : 'Moon',
      label: 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme',
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark')
    })
  }), /*#__PURE__*/React.createElement(A.CommandBar, {
    label: "Project commands"
  }, /*#__PURE__*/React.createElement(A.Button, {
    variant: "ghost",
    icon: "FilePlus2",
    onClick: () => setDialog('new')
  }, "New project"), /*#__PURE__*/React.createElement(A.Button, {
    variant: "ghost",
    icon: "FolderOpen",
    onClick: () => note('Opened Norwegian Sea training.areaproject.json. Imported features are preserved; validation issues must be repaired before database export.')
  }, "Open"), /*#__PURE__*/React.createElement(A.Button, {
    variant: "ghost",
    icon: "Save",
    onClick: () => {
      setDirty(false);
      note('Project saved to your downloads.');
    }
  }, "Save"), /*#__PURE__*/React.createElement(A.Separator, null), /*#__PURE__*/React.createElement(A.Button, {
    variant: "ghost",
    icon: "Upload",
    onClick: () => {
      setProject(p => ({
        ...p,
        items: data.items
      }));
      setDirty(true);
      note('Opened areadb.json. Imported features are preserved; validation issues must be repaired before database export.');
    }
  }, "Import database"), /*#__PURE__*/React.createElement(A.Button, {
    variant: "ghost",
    icon: "Anchor",
    onClick: () => setDialog('ports')
  }, "Import ports"), /*#__PURE__*/React.createElement(A.Button, {
    variant: "primary",
    icon: "Download",
    disabled: !data,
    onClick: () => {
      if (errors) {
        setProblemsOpen(true);
        error('Database export blocked. Repair the errors listed in Problems, then export again.');
      } else note('Exported ' + project.items.length.toLocaleString() + ' features as areadb.json.' + (issues.length ? ' Land-overlap or lane warnings remain; review their suitability.' : ''));
    }
  }, "Export areadb.json"), /*#__PURE__*/React.createElement(A.Button, {
    variant: "ghost",
    icon: "Pencil",
    disabled: !project.items.length,
    onClick: () => setDialog('names')
  }, "Generate names"), /*#__PURE__*/React.createElement(A.Spacer, null), /*#__PURE__*/React.createElement(A.IconButton, {
    icon: "Undo2",
    label: "Undo",
    disabled: !hist.undo.length,
    onClick: () => undo(false)
  }), /*#__PURE__*/React.createElement(A.IconButton, {
    icon: "Redo2",
    label: "Redo",
    disabled: !hist.redo.length,
    onClick: () => undo(true)
  })), message && /*#__PURE__*/React.createElement(A.Notification, {
    tone: message.error ? 'error' : 'info',
    onDismiss: () => setMessage(null)
  }, message.text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(window.Sidebar, {
    width: sidebarWidth,
    tab: tab,
    onTab: t => {
      setTab(t);
      if (t === 'generate' && boundary) setBoundaryVisible(true);
    },
    layers: /*#__PURE__*/React.createElement(window.MapLayers, {
      layers: project.layers,
      onChange: layers => commit({
        ...project,
        layers
      }),
      widthDecimal: project.widthDecimal,
      onWidthDecimal: v => commit({
        ...project,
        widthDecimal: v
      })
    })
  }, tab === 'explorer' ? /*#__PURE__*/React.createElement(window.ExplorerTree, {
    project: project,
    selected: selected,
    errorKeys: errorKeys,
    onSelect: selectKey,
    onFocus: k => setFocus({
      key: k,
      tick: Date.now()
    })
  }) : /*#__PURE__*/React.createElement(window.GeneratePanel, {
    settings: project.generator,
    onChange: generator => {
      setProject({
        ...project,
        generator
      });
      setPreview(null);
      setDirty(true);
    },
    boundary: boundary,
    boundaryVisible: boundaryVisible,
    tool: tool,
    ready: !!data,
    onDrawBoundary: () => {
      setBoundaryVisible(false);
      setPreview(null);
      setTool('boundary');
    },
    onClearBoundary: () => {
      setBoundary(null);
      setBoundaryVisible(false);
      setPreview(null);
      setTool('select');
    },
    onPreview: previewGrid,
    preview: preview,
    progress: progress,
    onCancel: () => live.cancel && live.cancel(),
    onClearPreview: () => setPreview(null),
    onAccept: () => {
      const add = preview.named.map((n, i) => ({
        key: 'g' + Date.now() + i,
        kind: 'areas',
        name: n.name,
        source: '',
        pts: n.pts
      }));
      commit({
        ...project,
        items: [...project.items, ...add]
      });
      note('Generated areas added. The boundary is ready for another pass. Undo removes the whole batch.');
    }
  })), /*#__PURE__*/React.createElement(A.Splitter, {
    value: sidebarWidth,
    onChange: setSidebarWidth,
    label: "Resize solution explorer"
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(A.Toolbar, {
    label: "Map tools"
  }, TOOLS.map(t => /*#__PURE__*/React.createElement(A.ToolButton, {
    key: t.id,
    icon: t.icon,
    label: t.name,
    showLabel: !narrow,
    active: tool === t.id,
    disabled: !data && t.id !== 'select' && t.id !== 'box-select',
    onClick: () => setTool(t.id)
  })), /*#__PURE__*/React.createElement(A.ToolButton, {
    icon: "Pencil",
    label: "Edit geometry",
    showLabel: !narrow,
    active: tool === 'edit',
    title: tool === 'edit' ? 'Finish editing geometry' : 'Show editing handles for the selection',
    disabled: locked || !selCount,
    onClick: () => setTool(tool === 'edit' ? 'select' : 'edit')
  }), /*#__PURE__*/React.createElement(A.ToolButton, {
    icon: locked ? 'Lock' : 'LockOpen',
    label: "Lock geometry",
    showLabel: !narrow,
    active: locked,
    title: locked ? 'Unlock geometry editing' : 'Lock geometry editing',
    onClick: () => {
      setLocked(!locked);
      if (tool === 'edit') setTool('select');
    }
  }), /*#__PURE__*/React.createElement(A.Separator, null), /*#__PURE__*/React.createElement(A.Checkbox, {
    label: "Snap",
    checked: snap,
    onChange: setSnap
  }), /*#__PURE__*/React.createElement(A.Spacer, null), !narrow && /*#__PURE__*/React.createElement(A.CoordinateBadge, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      minHeight: 150,
      background: '#252f3c'
    }
  }, data && /*#__PURE__*/React.createElement(window.MapCanvas, {
    land: data.land,
    items: project.items,
    selected: selected,
    tool: tool,
    layers: project.layers,
    editable: !locked,
    focus: focus,
    boundary: boundary,
    boundaryVisible: boundaryVisible,
    preview: preview ? preview.cells : [],
    onSelect: selectKey,
    onSelectBox: (keys, add) => {
      setSelected(p => new Set(add ? [...p, ...keys] : keys));
      if (keys.length) setTab('explorer');
    },
    onDraw: onDraw,
    onModify: onModify,
    onEditSelected: () => setTool('edit')
  }), /*#__PURE__*/React.createElement(A.MapCaption, null, captionFor(tool, locked, selCount, tab, boundary, boundaryVisible)), !data && /*#__PURE__*/React.createElement(A.MapNotice, {
    title: "Land validation not ready",
    actionLabel: "Retry land data"
  }, "Drawing, generation, and export require NaturalEarth.")), /*#__PURE__*/React.createElement(A.ProblemsBar, {
    open: problemsOpen,
    onToggle: () => setProblemsOpen(!problemsOpen),
    errors: errors,
    warnings: warnings,
    showErrors: filters.error,
    showWarnings: filters.warning,
    onToggleErrors: () => setFilters({
      ...filters,
      error: !filters.error
    }),
    onToggleWarnings: () => setFilters({
      ...filters,
      warning: !filters.warning
    }),
    pending: !data,
    hint: narrow ? null : 'Land checks stay active when layers are hidden'
  }), problemsOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 180,
      overflowY: 'auto',
      padding: '6px 8px',
      background: 'var(--surface)'
    }
  }, !issues.length && /*#__PURE__*/React.createElement(A.Hint, {
    style: {
      padding: 8
    }
  }, "No validation problems."), issues.length > 0 && !filtered.length && /*#__PURE__*/React.createElement(A.Hint, {
    style: {
      padding: 8
    }
  }, "No problems match the selected filters."), filtered.slice(0, 100).map((iss, n) => /*#__PURE__*/React.createElement(A.ProblemRow, {
    key: iss.key + n,
    severity: iss.severity,
    feature: (project.items.find(i => i.key === iss.key) || {}).name,
    message: iss.message,
    onClick: () => {
      selectKey(iss.key);
      setFocus({
        key: iss.key,
        tick: Date.now()
      });
    }
  })))), /*#__PURE__*/React.createElement(window.PropertiesDock, {
    items: project.items,
    selected: selected,
    locked: locked,
    onApply: next => {
      commit({
        ...project,
        items: project.items.map(i => i.key === next.key ? next : i)
      });
      note('Feature properties updated.');
    },
    onDelete: deleteSelected,
    onClear: () => {
      setSelected(new Set());
      if (tool === 'edit') setTool('select');
    },
    onZoom: k => setFocus({
      key: k,
      tick: Date.now()
    }),
    onMerge: () => {
      const sel = project.items.filter(i => selected.has(i.key));
      note('Merged ' + sel.length + ' areas into "' + sel[0].name + '", keeping the first selected area\'s properties.');
    }
  })), /*#__PURE__*/React.createElement(A.StatusBar, null, /*#__PURE__*/React.createElement(A.StatusItem, null, /*#__PURE__*/React.createElement(A.StatusDot, {
    status: data ? 'ready' : 'pending'
  }), progress ? 'Generating preview...' : data ? 'NaturalEarth ready' : 'Loading land data...'), /*#__PURE__*/React.createElement(A.StatusItem, null, counts.areas.toLocaleString(), " areas \xB7 ", counts.lanes.toLocaleString(), " lanes \xB7 ", counts.ports.toLocaleString(), " ports"), /*#__PURE__*/React.createElement(A.StatusItem, {
    grow: true
  }), /*#__PURE__*/React.createElement(A.StatusItem, null, dirty ? 'Unsaved changes' : 'Project saved', " \xB7 Local files only")), dialog === 'new' && /*#__PURE__*/React.createElement(window.NewProjectDialog, {
    onCancel: () => setDialog(null),
    onCreate: name => {
      setProject({
        name,
        items: [],
        layers: DEFAULT_LAYERS,
        widthDecimal: 'preserve',
        generator: DEFAULT_GEN
      });
      setSelected(new Set());
      setBoundary(null);
      setDirty(true);
      setDialog(null);
      note('Project created. Draw features or generate your first grid.');
    }
  }), dialog === 'names' && /*#__PURE__*/React.createElement(window.NamingDialog, {
    items: project.items,
    onCancel: () => setDialog(null),
    onApply: (after, n) => {
      commit({
        ...project,
        items: after
      });
      setDialog(null);
      note('Updated ' + n.toLocaleString() + ' feature names. Undo restores the previous names.');
    }
  }), dialog === 'ports' && /*#__PURE__*/React.createElement(window.PortImportWizard, {
    items: project.items,
    onCancel: () => setDialog(null),
    onImport: ports => {
      const add = ports.map(p => ({
        key: 'p' + p.index,
        kind: 'ports',
        name: p.name,
        source: 'World Port Index [U]',
        code: 'WPI-' + p.index,
        wpi: p.index,
        pts: [[+window.projX(p.lon).toFixed(1), +window.projY(p.lat).toFixed(1)]]
      }));
      commit({
        ...project,
        items: [...project.items, ...add]
      });
      setDialog(null);
      note('Imported ' + add.length.toLocaleString() + ' World Port Index ports. Existing features were preserved. Undo removes the whole import.');
    }
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/area-database-designer/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/area-database-designer/Dialogs.jsx
try { (() => {
const DL = window.WorkbenchDesignSystem_7eab5c;
function NewProjectDialog({
  onCancel,
  onCreate
}) {
  const [name, setName] = React.useState('');
  return /*#__PURE__*/React.createElement(DL.Modal, {
    title: "New training project",
    onClose: onCancel,
    onSubmit: () => name.trim() && onCreate(name.trim())
  }, /*#__PURE__*/React.createElement(DL.Hint, null, "Create a local workspace for exercise areas, lanes, and ports."), /*#__PURE__*/React.createElement(DL.Field, {
    label: "Project name"
  }, /*#__PURE__*/React.createElement(DL.TextInput, {
    autoFocus: true,
    required: true,
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Norwegian Sea training"
  })), /*#__PURE__*/React.createElement(DL.ButtonRow, null, /*#__PURE__*/React.createElement(DL.Button, {
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement(DL.Button, {
    variant: "primary",
    type: "submit"
  }, "Create project")));
}
function NamingDialog({
  items,
  onCancel,
  onApply
}) {
  const [naming, setNaming] = React.useState('nato');
  const [alphabets, setAlphabets] = React.useState(['nato', 'greek', 'latin']);
  const [prefix, setPrefix] = React.useState('AREA');
  const [scope, setScope] = React.useState(['areas', 'lanes', 'ports']);
  const [draft, setDraft] = React.useState(null);
  const reset = () => setDraft(null);
  const preview = () => {
    const next = window.ADD.nameSequence(alphabets, prefix, naming);
    setDraft(items.map(i => scope.includes(i.kind) ? {
      ...i,
      name: next()
    } : i));
  };
  const changes = draft ? draft.map((d, i) => ({
    before: items[i].name,
    after: d.name
  })).filter(c => c.before !== c.after) : [];
  return /*#__PURE__*/React.createElement(DL.Modal, {
    title: "Generate project names",
    width: 620,
    gap: 14,
    closeButton: false,
    onClose: onCancel,
    onSubmit: () => changes.length && onApply(draft, changes.length)
  }, /*#__PURE__*/React.createElement(DL.Hint, null, "Replace feature names in project order. IDs, geometry, sources, port codes and lane waypoint names stay unchanged. Apply as one undoable action."), /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: 0,
      margin: 0,
      padding: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px 12px'
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      color: 'var(--muted)',
      fontSize: 11,
      marginBottom: 8
    }
  }, "Rename"), ['areas', 'lanes', 'ports'].map(k => /*#__PURE__*/React.createElement(DL.Checkbox, {
    key: k,
    label: k[0].toUpperCase() + k.slice(1),
    checked: scope.includes(k),
    onChange: c => {
      setScope(c ? [...scope, k] : scope.filter(x => x !== k));
      reset();
    }
  }))), /*#__PURE__*/React.createElement(DL.Field, {
    label: "Naming style"
  }, /*#__PURE__*/React.createElement(DL.Select, {
    value: naming,
    onChange: e => {
      setNaming(e.target.value);
      reset();
    },
    options: [{
      value: 'nato',
      label: 'Alphabet + spoken number'
    }, {
      value: 'prefix',
      label: 'Custom prefix + number'
    }]
  })), naming === 'nato' && /*#__PURE__*/React.createElement(window.AlphabetPicker, {
    value: alphabets,
    onChange: a => {
      setAlphabets(a);
      reset();
    }
  }), /*#__PURE__*/React.createElement(DL.Field, {
    label: "Prefix"
  }, /*#__PURE__*/React.createElement(DL.TextInput, {
    value: prefix,
    onChange: e => {
      setPrefix(e.target.value);
      reset();
    }
  })), naming === 'nato' && /*#__PURE__*/React.createElement(DL.Hint, null, "The prefix is used only with custom-prefix naming."), /*#__PURE__*/React.createElement(DL.Button, {
    onClick: preview
  }, "Preview names"), draft && /*#__PURE__*/React.createElement(DL.DataTable, {
    size: "sm",
    maxHeight: 230,
    caption: changes.length.toLocaleString() + ' names will change. Showing the first ' + Math.min(changes.length, 30) + '.',
    columns: [{
      key: 'before',
      label: 'Current name'
    }, {
      key: 'after',
      label: 'New name'
    }],
    rows: changes.slice(0, 30)
  }), /*#__PURE__*/React.createElement(DL.ButtonRow, null, /*#__PURE__*/React.createElement(DL.Button, {
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement(DL.Button, {
    variant: "primary",
    type: "submit",
    disabled: !changes.length
  }, "Apply names")));
}
function PortImportWizard({
  items,
  onCancel,
  onImport
}) {
  const {
    WPI,
    SIZE,
    TYPE,
    titleCase
  } = window.ADD;
  const [step, setStep] = React.useState('filter');
  const [search, setSearch] = React.useState('');
  const [f, setF] = React.useState({
    region: [],
    country: [],
    size: [],
    type: []
  });
  const [excluded, setExcluded] = React.useState(new Set());
  const [page, setPage] = React.useState(0);
  const imported = new Set(items.filter(i => i.wpi).map(i => i.wpi));
  const match = (p, skip) => (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.index.includes(search)) && ['region', 'country', 'size', 'type'].every(k => k === skip || !f[k].length || f[k].includes(p[k]));
  const matching = WPI.filter(p => match(p));
  const eligible = matching.filter(p => !imported.has(p.index));
  const selected = eligible.filter(p => !excluded.has(p.index));
  const facet = (k, labeler) => {
    const opts = {};
    WPI.filter(p => match(p, k)).forEach(p => {
      opts[p[k]] = (opts[p[k]] || 0) + 1;
    });
    return Object.entries(opts).map(([value, count]) => ({
      value,
      label: labeler(value),
      count
    }));
  };
  const update = patch => {
    setF({
      ...f,
      ...patch
    });
    setExcluded(new Set());
    setPage(0);
  };
  const PAGE = 8,
    pageCount = Math.max(1, Math.ceil(matching.length / PAGE));
  return /*#__PURE__*/React.createElement(DL.Modal, {
    title: "Import World Port Index ports",
    width: 980,
    gap: 12,
    closeButton: false,
    onClose: onCancel,
    onSubmit: () => {
      if (step === 'filter') {
        if (matching.length) setStep('review');
      } else if (selected.length) onImport(selected);
    }
  }, /*#__PURE__*/React.createElement(DL.Hint, {
    strong: true
  }, step === 'filter' ? 'Step 1 of 2: Filter catalogue' : 'Step 2 of 2: Review and import'), /*#__PURE__*/React.createElement(DL.Hint, null, "Bundled wpi.csv snapshot: 3,630 ports. Ports are appended, not substituted for existing features. Nothing changes until Import."), step === 'filter' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DL.Field, {
    label: "Search ports"
  }, /*#__PURE__*/React.createElement(DL.TextInput, {
    value: search,
    onChange: e => {
      setSearch(e.target.value);
      setPage(0);
    },
    placeholder: "Port name or WPI index..."
  })), /*#__PURE__*/React.createElement(DL.Hint, null, "Empty filters include all values. Selected values within a filter are alternatives; different filters are combined. Region names are not in this CSV, so WPI REGION_NO codes are shown with their countries."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(DL.FilterGroup, {
    label: "Regions (WPI)",
    searchable: true,
    options: facet('region', v => v + ' · NO'),
    value: f.region,
    onChange: v => update({
      region: v
    })
  }), /*#__PURE__*/React.createElement(DL.FilterGroup, {
    label: "Countries",
    searchable: true,
    options: facet('country', v => 'Norway (' + v + ')'),
    value: f.country,
    onChange: v => update({
      country: v
    })
  }), /*#__PURE__*/React.createElement(DL.FilterGroup, {
    label: "Harbor size",
    options: facet('size', v => SIZE[v]),
    value: f.size,
    onChange: v => update({
      size: v
    })
  }), /*#__PURE__*/React.createElement(DL.FilterGroup, {
    label: "Harbor type",
    options: facet('type', v => TYPE[v]),
    value: f.type,
    onChange: v => update({
      type: v
    })
  })), /*#__PURE__*/React.createElement("p", {
    role: "status",
    style: {
      margin: 0,
      color: 'var(--accent)'
    }
  }, matching.length, " ports match; ", eligible.length, " new ports; ", matching.length - eligible.length, " already in project."), /*#__PURE__*/React.createElement(DL.Button, {
    onClick: () => update({
      region: [],
      country: [],
      size: [],
      type: []
    })
  }, "Clear all filters")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    role: "status",
    style: {
      margin: 0
    }
  }, selected.length, " ports selected; ", matching.length - eligible.length, " already-imported ports will be skipped. 0 names adjusted to avoid project-wide collisions."), /*#__PURE__*/React.createElement(DL.Hint, null, "Review imported names below. Code is WPI-<index>, not UN/LOCODE. Coordinates are WGS84 [longitude, latitude]. Original CSV attributes are retained. Ports may be on land; this is not navigation data."), /*#__PURE__*/React.createElement(DL.Checkbox, {
    label: "Select all new matching ports",
    style: {
      fontSize: 12,
      gap: 7
    },
    checked: eligible.length > 0 && selected.length === eligible.length,
    indeterminate: selected.length > 0 && selected.length < eligible.length,
    onChange: c => setExcluded(c ? new Set() : new Set(eligible.map(p => p.index)))
  }), /*#__PURE__*/React.createElement(DL.DataTable, {
    minWidth: 800,
    columns: [{
      key: 'imp',
      label: 'Import'
    }, {
      key: 'name',
      label: 'Port / WPI index',
      sub: 'idx'
    }, {
      key: 'country',
      label: 'Country / region',
      sub: 'region'
    }, {
      key: 'size',
      label: 'Harbor',
      sub: 'type'
    }, {
      key: 'lon',
      label: 'Longitude / latitude',
      sub: 'lat'
    }, {
      key: 'as',
      label: 'Import as'
    }],
    rows: matching.slice(page * PAGE, (page + 1) * PAGE).map(p => ({
      key: p.index,
      imp: /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        "aria-label": 'Import ' + titleCase(p.name),
        disabled: imported.has(p.index),
        checked: !imported.has(p.index) && !excluded.has(p.index),
        style: {
          accentColor: 'var(--accent)',
          margin: 0
        },
        onChange: e => setExcluded(s => {
          const n = new Set(s);
          e.target.checked ? n.delete(p.index) : n.add(p.index);
          return n;
        })
      }),
      name: titleCase(p.name),
      idx: 'WPI ' + p.index,
      country: 'Norway (NO)',
      region: 'Region ' + p.region,
      size: SIZE[p.size],
      type: TYPE[p.type],
      lon: p.lon.toFixed(6),
      lat: p.lat.toFixed(6),
      as: imported.has(p.index) ? 'Already imported' : excluded.has(p.index) ? 'Not selected' : p.name
    }))
  }), /*#__PURE__*/React.createElement(DL.Pagination, {
    page: page,
    pageCount: pageCount,
    onChange: setPage,
    previousLabel: "Previous ports",
    nextLabel: "Next ports"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      background: 'var(--surface)',
      padding: '10px 0'
    }
  }, /*#__PURE__*/React.createElement(DL.ButtonRow, null, /*#__PURE__*/React.createElement(DL.Button, {
    onClick: onCancel
  }, "Cancel"), step === 'review' && /*#__PURE__*/React.createElement(DL.Button, {
    onClick: () => setStep('filter')
  }, "Back to filters"), /*#__PURE__*/React.createElement(DL.Button, {
    variant: "primary",
    type: "submit",
    disabled: step === 'filter' ? !matching.length : !selected.length
  }, step === 'filter' ? 'Review ports' : 'Import ' + selected.length + ' ports'))));
}
Object.assign(window, {
  NewProjectDialog,
  NamingDialog,
  PortImportWizard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/area-database-designer/Dialogs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/area-database-designer/Explorer.jsx
try { (() => {
const {
  SidebarTabs,
  ProjectHeading,
  SearchBox,
  TreeGroup,
  TreeItem,
  EmptyState,
  LayerPanel,
  Checkbox,
  Field,
  Select
} = window.WorkbenchDesignSystem_7eab5c;
const KIND_ICON = {
  areas: 'Pentagon',
  lanes: 'Route',
  ports: 'Anchor'
};
const KIND_LABEL = {
  areas: 'Areas',
  lanes: 'Lanes',
  ports: 'Ports'
};
function ExplorerTree({
  project,
  selected,
  errorKeys,
  onSelect,
  onFocus
}) {
  const [search, setSearch] = React.useState('');
  const [collapsed, setCollapsed] = React.useState(new Set());
  const counts = {
    areas: 0,
    lanes: 0,
    ports: 0
  };
  project.items.forEach(i => counts[i.kind]++);
  const toggle = k => setCollapsed(p => {
    const n = new Set(p);
    n.has(k) ? n.delete(k) : n.add(k);
    return n;
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ProjectHeading, {
    name: project.name,
    count: project.items.length
  }), /*#__PURE__*/React.createElement(SearchBox, {
    placeholder: "Search areas, lanes, ports...",
    label: "Search features",
    value: search,
    onChange: setSearch,
    style: {
      margin: '0 10px 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-label": "Solution explorer",
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      minHeight: 110
    }
  }, !project.items.length && /*#__PURE__*/React.createElement(EmptyState, {
    title: "Your training set starts here"
  }, "Draw features on the map, import a database, or generate a coastal grid."), ['areas', 'lanes', 'ports'].map(kind => /*#__PURE__*/React.createElement(React.Fragment, {
    key: kind
  }, /*#__PURE__*/React.createElement(TreeGroup, {
    icon: KIND_ICON[kind],
    label: KIND_LABEL[kind],
    count: counts[kind],
    expanded: !collapsed.has(kind),
    onToggle: () => toggle(kind)
  }), !collapsed.has(kind) && project.items.filter(i => i.kind === kind && i.name.toLowerCase().includes(search.toLowerCase())).map(i => /*#__PURE__*/React.createElement(TreeItem, {
    key: i.key,
    icon: KIND_ICON[kind],
    label: i.name,
    selected: selected.has(i.key),
    error: errorKeys.has(i.key),
    onClick: e => onSelect(i.key, e.ctrlKey || e.metaKey),
    onDoubleClick: () => onFocus(i.key)
  }))))));
}
function MapLayers({
  layers,
  onChange,
  widthDecimal,
  onWidthDecimal
}) {
  const label = k => k === 'land' ? 'NaturalEarth land' : k === 'basemap' ? 'Online grayscale' : k[0].toUpperCase() + k.slice(1);
  return /*#__PURE__*/React.createElement(LayerPanel, {
    footer: /*#__PURE__*/React.createElement(Field, {
      label: "Lane width export",
      size: "sm",
      style: {
        paddingTop: 6
      }
    }, /*#__PURE__*/React.createElement(Select, {
      size: "sm",
      "aria-label": "Lane width export",
      value: widthDecimal,
      onChange: e => onWidthDecimal(e.target.value),
      options: [{
        value: 'preserve',
        label: 'Preserve / new widths: comma'
      }, {
        value: 'comma',
        label: 'Decimal comma (Norwegian)'
      }, {
        value: 'dot',
        label: 'Decimal dot (invariant / English)'
      }]
    }))
  }, Object.keys(layers).map(k => /*#__PURE__*/React.createElement(Checkbox, {
    key: k,
    label: label(k),
    checked: layers[k],
    onChange: c => onChange({
      ...layers,
      [k]: c
    })
  })));
}
function Sidebar({
  width,
  tab,
  onTab,
  children,
  layers
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)',
      flexShrink: 0,
      minHeight: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SidebarTabs, {
    tabs: [{
      id: 'explorer',
      label: 'Solution explorer'
    }, {
      id: 'generate',
      label: 'Generate',
      icon: 'Grid2X2'
    }],
    value: tab,
    onChange: onTab
  }), children, layers);
}
Object.assign(window, {
  ExplorerTree,
  MapLayers,
  Sidebar,
  KIND_ICON
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/area-database-designer/Explorer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/area-database-designer/GeneratePanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const G = window.WorkbenchDesignSystem_7eab5c;
function AlphabetPicker({
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: 0,
      margin: 0,
      padding: 0,
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px 12px'
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      color: 'var(--muted)',
      fontSize: 11,
      marginBottom: 8
    }
  }, "Naming alphabets"), window.ADD.ALPHABETS.map(a => /*#__PURE__*/React.createElement(G.Checkbox, {
    key: a.id,
    label: a.label,
    checked: value.includes(a.id),
    disabled: value.length === 1 && value.includes(a.id),
    onChange: c => onChange(window.ADD.ALPHABETS.filter(x => x.id === a.id ? c : value.includes(x.id)).map(x => x.id))
  })), /*#__PURE__*/React.createElement(G.Hint, {
    style: {
      gridColumn: '1 / -1'
    }
  }, "Keep at least one alphabet selected. Combine alphabets in the order shown; shared words are used once. Number words expand after NINER, without SERIES suffixes."));
}
function GeneratePanel({
  settings,
  onChange,
  boundary,
  boundaryVisible,
  tool,
  onDrawBoundary,
  onClearBoundary,
  onPreview,
  preview,
  onAccept,
  onClearPreview,
  progress,
  onCancel,
  ready
}) {
  const s = settings,
    set = patch => onChange({
      ...s,
      ...patch
    });
  const num = (label, key, extra = {}) => /*#__PURE__*/React.createElement(G.Field, {
    label: label
  }, /*#__PURE__*/React.createElement(G.TextInput, _extends({
    type: "number",
    step: "any",
    value: s[key],
    onChange: e => set({
      [key]: e.target.valueAsNumber
    })
  }, extra)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: '16px 14px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(G.SectionHeading, {
    flush: true
  }, "Coastal grid generator"), /*#__PURE__*/React.createElement(G.Hint, null, "Draw a region, choose cell dimensions and heading, then preview. Cells crossing the drawn boundary stay full size; land, coastal clearance, existing areas and enabled lane clipping trim or exclude them. New areas fill gaps without overlapping existing areas."), /*#__PURE__*/React.createElement(G.Button, {
    wide: true,
    icon: "Pentagon",
    active: tool === 'boundary',
    disabled: !ready,
    onClick: onDrawBoundary
  }, boundary ? 'Redraw boundary' : 'Draw generation boundary'), boundary && boundaryVisible && /*#__PURE__*/React.createElement(G.Hint, null, "The boundary is directly editable while generating, unless geometry is locked. Drag a white corner to move it or a green midpoint to add a point. Alt-click a white corner to remove it. Escape cancels a drag. Valid changes clear the previous preview."), boundary && /*#__PURE__*/React.createElement(G.InlineStatus, {
    actionLabel: "Clear boundary",
    onAction: onClearBoundary
  }, boundaryVisible ? 'Boundary ready' : 'Boundary saved (hidden)'), /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: 0,
      margin: 0,
      padding: 0,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    },
    disabled: !!progress
  }, /*#__PURE__*/React.createElement(G.FieldPair, null, num('Width (NM)', 'width'), num('Height (NM)', 'height')), num('Orientation (degrees true)', 'angle'), /*#__PURE__*/React.createElement(G.Field, {
    label: "Grid edges"
  }, /*#__PURE__*/React.createElement(G.Select, {
    value: s.gridEdges,
    onChange: e => set({
      gridEdges: e.target.value
    }),
    options: [{
      value: 'corners',
      label: 'Four corners (simple)'
    }, {
      value: 'projected',
      label: 'Projected edges (5 km samples)'
    }]
  })), /*#__PURE__*/React.createElement(G.Hint, null, s.gridEdges === 'projected' ? 'Samples curved projected edges every 5 km for greater projection accuracy, adding intermediate points.' : 'Starts each cell with four corners for simpler editing. Straight latitude/longitude edges approximate the projected shape.', " Land, lane and existing-area clipping can add points in either mode. Existing features stay unchanged."), /*#__PURE__*/React.createElement(G.Field, {
    label: "Generation coastline"
  }, /*#__PURE__*/React.createElement(G.Select, {
    value: s.coastline,
    onChange: e => set({
      coastline: e.target.value
    }),
    options: [{
      value: 'simplified',
      label: 'Simplified (~1 km, conservative)'
    }, {
      value: 'detailed',
      label: 'Detailed (NaturalEarth 1:10m)'
    }]
  })), /*#__PURE__*/React.createElement(G.Checkbox, {
    label: "Ignore small islands",
    checked: s.island > 0,
    onChange: c => set({
      island: c ? 100 : 0
    })
  }), s.island !== 0 && num('Island area cutoff (km²)', 'island'), /*#__PURE__*/React.createElement(G.Field, {
    label: "Coastal treatment"
  }, /*#__PURE__*/React.createElement(G.Select, {
    value: s.coastalMode,
    onChange: e => set({
      coastalMode: e.target.value
    }),
    options: [{
      value: 'offshore',
      label: 'Keep grid offshore (exclude island waters)'
    }, {
      value: 'clip',
      label: 'Clip coastal waters (split around islands)'
    }]
  })), s.coastalMode !== 'clip' && num('Coastal clearance (NM)', 'clearance'), num('Minimum area (NM²)', 'minimumArea'), /*#__PURE__*/React.createElement(G.Checkbox, {
    label: "Remove isolated areas",
    checked: s.removeIsolated,
    onChange: c => set({
      removeIsolated: c
    })
  }), /*#__PURE__*/React.createElement(G.Checkbox, {
    label: "Clip to lanes",
    checked: s.clipToLanes,
    onChange: c => set({
      clipToLanes: c
    })
  }), num('Simplify - minimum point spacing (m)', 'simplify'), /*#__PURE__*/React.createElement(G.Field, {
    label: "Naming style"
  }, /*#__PURE__*/React.createElement(G.Select, {
    value: s.naming,
    onChange: e => set({
      naming: e.target.value
    }),
    options: [{
      value: 'nato',
      label: 'Alphabet + spoken number'
    }, {
      value: 'prefix',
      label: 'Custom prefix + number'
    }, {
      value: 'grid',
      label: 'Prefix + row / column'
    }]
  })), s.naming === 'nato' && /*#__PURE__*/React.createElement(AlphabetPicker, {
    value: s.alphabets,
    onChange: alphabets => set({
      alphabets
    })
  }), /*#__PURE__*/React.createElement(G.Field, {
    label: "Prefix"
  }, /*#__PURE__*/React.createElement(G.TextInput, {
    value: s.prefix,
    onChange: e => set({
      prefix: e.target.value
    })
  }))), /*#__PURE__*/React.createElement(G.Button, {
    variant: "primary",
    wide: true,
    icon: "Grid2X2",
    disabled: !boundary || !ready || !!progress,
    onClick: onPreview
  }, "Preview grid"), progress && /*#__PURE__*/React.createElement(G.Progress, {
    value: progress.done,
    max: progress.total,
    label: progress.done.toLocaleString() + ' / ' + progress.total.toLocaleString() + ' cells',
    onCancel: onCancel,
    cancelLabel: "Cancel generation"
  }), preview && /*#__PURE__*/React.createElement(G.SummaryCard, {
    title: preview.cells.length.toLocaleString() + ' sea areas',
    lines: [preview.candidates.toLocaleString() + ' candidate cells', 'Minimum area: ' + s.minimumArea + ' NM²', 'Simplify: ' + (s.simplify ? s.simplify + ' m' : 'disabled') + '; 0 points removed; 0 protected short edges retained.', 'Boundary radius: ' + preview.radius.toLocaleString() + ' km']
  }, /*#__PURE__*/React.createElement(G.Hint, null, preview.landCells, " cells excluded by land; ", preview.existingCells, " overlapped existing areas."), /*#__PURE__*/React.createElement(G.Button, {
    variant: "primary",
    wide: true,
    disabled: !preview.cells.length,
    onClick: onAccept
  }, "Add areas to project"), /*#__PURE__*/React.createElement(G.Button, {
    wide: true,
    onClick: onClearPreview
  }, "Clear preview")), /*#__PURE__*/React.createElement(G.Hint, null, "Limit: 50,000 candidate cells per operation. Regional grids only: at or below 80\xB0 latitude, within 2,000 km of the boundary centre, without crossing the dateline. Preview reports approximate projection distortion."));
}
Object.assign(window, {
  GeneratePanel,
  AlphabetPicker
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/area-database-designer/GeneratePanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/area-database-designer/MapCanvas.jsx
try { (() => {
// Cosmetic SVG recreation of MapView.tsx (OpenLayers). Coordinates are Web Mercator km.
const R_KM = 6378.137;
const projX = lon => R_KM * lon * Math.PI / 180;
const projY = lat => -R_KM * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const unprojLon = x => x / R_KM * 180 / Math.PI;
const unprojLat = y => (2 * Math.atan(Math.exp(-y / R_KM)) - Math.PI / 2) * 180 / Math.PI;
const pathOf = (pts, closed) => pts.length ? 'M' + pts.map(p => p[0] + ' ' + p[1]).join('L') + (closed ? 'Z' : '') : '';
const featureColor = kind => kind === 'areas' ? '#73afdf' : kind === 'lanes' ? '#7fd9c5' : '#edb7ea';
function useMapView(initial) {
  const [view, setView] = React.useState(initial);
  return [view, setView];
}
function scaleLine(pxPerKm, lat) {
  const nmPx = pxPerKm * 1.852 / Math.cos(lat * Math.PI / 180); // mercator stretch at view latitude
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  const nm = steps.find(s => s * nmPx >= 64) || 1000;
  return {
    nm,
    px: Math.round(nm * nmPx)
  };
}
function MapCanvas({
  land,
  items,
  selected,
  tool,
  layers,
  boundary,
  boundaryVisible,
  preview,
  focus,
  onSelect,
  onSelectBox,
  onDraw,
  onModify,
  onEditSelected,
  editable
}) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({
    w: 800,
    h: 600
  });
  const [view, setView] = useMapView({
    cx: projX(12),
    cy: projY(66),
    s: 1 / 6.918
  });
  const [draft, setDraft] = React.useState([]);
  const [hoverPt, setHoverPt] = React.useState(null);
  const [box, setBox] = React.useState(null);
  const drag = React.useRef(null);
  const panned = React.useRef(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize(s => s.w === el.clientWidth && s.h === el.clientHeight ? s : {
      w: el.clientWidth,
      h: el.clientHeight
    });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    const poll = setInterval(measure, 250);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      clearInterval(poll);
    };
  }, []);
  React.useEffect(() => {
    setDraft([]);
  }, [tool]);
  React.useEffect(() => {
    if (!focus) return;
    const it = items.find(i => i.key === focus.key);
    if (!it) return;
    const xs = it.pts.map(p => p[0]),
      ys = it.pts.map(p => p[1]);
    const w = Math.max(...xs) - Math.min(...xs),
      h = Math.max(...ys) - Math.min(...ys);
    const s = Math.min(1.2, Math.min(size.w / Math.max(w, 20), size.h / Math.max(h, 20)) * 0.45);
    setView({
      s,
      cx: (Math.max(...xs) + Math.min(...xs)) / 2,
      cy: (Math.max(...ys) + Math.min(...ys)) / 2
    });
  }, [focus]);
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'Escape') setDraft([]);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  const tx = size.w / 2 - view.cx * view.s,
    ty = size.h / 2 - view.cy * view.s;
  const toScreen = p => [p[0] * view.s + tx, p[1] * view.s + ty];
  const local = e => {
    const r = ref.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const toWorld = ([x, y]) => [+((x - tx) / view.s).toFixed(1), +((y - ty) / view.s).toFixed(1)];
  const drawing = ['area', 'lane', 'boundary'].includes(tool);
  const onWheel = e => {
    const [mx, my] = local(e);
    const f = e.deltaY < 0 ? 1.25 : 0.8;
    const s = Math.min(4, Math.max(0.02, view.s * f));
    const wx = (mx - tx) / view.s,
      wy = (my - ty) / view.s;
    setView({
      s,
      cx: wx - (mx - size.w / 2) / s,
      cy: wy - (my - size.h / 2) / s
    });
  };
  const onPointerDown = e => {
    if (e.button !== 0) return;
    const p = local(e);
    if (tool === 'box-select') {
      drag.current = {
        mode: 'box',
        start: p,
        additive: e.ctrlKey || e.metaKey
      };
      setBox([p, p]);
      return;
    }
    if (drawing || tool === 'port') return;
    drag.current = {
      mode: 'pan',
      start: p,
      view,
      moved: false
    };
  };
  const onPointerMove = e => {
    const p = local(e);
    if (drawing) setHoverPt(p);
    const d = drag.current;
    if (!d) return;
    if (d.mode === 'box') {
      setBox([d.start, p]);
      return;
    }
    if (d.mode === 'pan') {
      const dx = p[0] - d.start[0],
        dy = p[1] - d.start[1];
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      setView({
        ...d.view,
        cx: d.view.cx - dx / d.view.s,
        cy: d.view.cy - dy / d.view.s
      });
    }
    if (d.mode === 'vertex') {
      const w = toWorld(p);
      const it = items.find(i => i.key === d.key);
      const pts = it.pts.map((q, i) => i === d.index ? w : q);
      onModify && onModify(d.key, pts, true);
    }
  };
  const onPointerUp = e => {
    const d = drag.current;
    drag.current = null;
    panned.current = !!(d && d.moved);
    if (!d) return;
    if (d.mode === 'box') {
      const [[x0, y0], [x1, y1]] = box || [[0, 0], [0, 0]];
      setBox(null);
      const a = toWorld([Math.min(x0, x1), Math.min(y0, y1)]),
        b = toWorld([Math.max(x0, x1), Math.max(y0, y1)]);
      const keys = items.filter(it => layers[it.kind] && it.pts.some(([x, y]) => x >= a[0] && x <= b[0] && y >= a[1] && y <= b[1])).map(it => it.key);
      onSelectBox && onSelectBox(keys, d.additive);
    }
    if (d.mode === 'vertex') onModify && onModify(d.key, items.find(i => i.key === d.key).pts, false);
    if (d.mode === 'pan' && !d.moved && e.target === e.currentTarget.querySelector('[data-bg]')) onSelect && onSelect(null, false);
  };
  const onClick = e => {
    if (tool === 'port') {
      onDraw && onDraw('port', [toWorld(local(e))]);
      return;
    }
    if (drawing) setDraft(d => [...d, toWorld(local(e))]);
  };
  const onDoubleClick = e => {
    if (!drawing) return;
    const pts = draft.slice(0, -1).length >= (tool === 'lane' ? 2 : 3) ? draft.slice(0, -1) : draft;
    if (pts.length >= (tool === 'lane' ? 2 : 3)) onDraw && onDraw(tool, pts);
    setDraft([]);
  };
  const sel = selected;
  const editing = tool === 'edit' && editable;
  const sl = scaleLine(view.s, unprojLat(view.cy));
  const labelFor = it => {
    if (!layers.labels) return null;
    const xs = it.pts.map(p => p[0]),
      ys = it.pts.map(p => p[1]);
    const wpx = (Math.max(...xs) - Math.min(...xs)) * view.s;
    if (it.kind === 'areas' && wpx < it.name.length * 6.4 + 6) return null;
    if (it.kind === 'lanes' && view.s < 0.15) return null;
    const c = it.kind === 'ports' ? it.pts[0] : it.kind === 'lanes' ? it.pts[Math.floor(it.pts.length / 2)] : [xs.reduce((a, b) => a + b) / xs.length, ys.reduce((a, b) => a + b) / ys.length];
    const [x, y] = toScreen(c);
    return /*#__PURE__*/React.createElement("text", {
      key: 'l' + it.key,
      x: x,
      y: y + (it.kind === 'ports' ? -14 : 0),
      textAnchor: "middle",
      dominantBaseline: "middle",
      style: {
        font: '11px "Segoe UI", "Open Sans", sans-serif',
        fill: '#eff5ff',
        stroke: '#242b35',
        strokeWidth: 3,
        paintOrder: 'stroke',
        pointerEvents: 'none'
      }
    }, it.name);
  };
  const visible = items.filter(it => layers[it.kind]);
  const ordered = [...visible.filter(it => !sel.has(it.key)), ...visible.filter(it => sel.has(it.key))];
  const selItems = items.filter(it => sel.has(it.key));
  const cursor = drawing || tool === 'port' ? 'crosshair' : tool === 'box-select' ? 'crosshair' : 'default';
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      cursor,
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size.w,
    height: size.h,
    style: {
      display: 'block',
      touchAction: 'none'
    },
    onWheel: onWheel,
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: onPointerUp,
    onClick: onClick,
    onDoubleClick: onDoubleClick
  }, /*#__PURE__*/React.createElement("rect", {
    "data-bg": "1",
    width: size.w,
    height: size.h,
    fill: "#252f3c"
  }), /*#__PURE__*/React.createElement("g", {
    transform: `translate(${tx} ${ty}) scale(${view.s})`,
    style: {
      pointerEvents: 'none'
    }
  }, layers.land && land && /*#__PURE__*/React.createElement("path", {
    d: land,
    fill: "#525963",
    stroke: "#525963",
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke"
  }), layers.lanes && visible.filter(it => it.kind === 'lanes').map(it => {
    const lat = unprojLat(it.pts[0][1]);
    const w = (it.width || 1.852) / Math.cos(lat * Math.PI / 180);
    const on = sel.has(it.key);
    return /*#__PURE__*/React.createElement("g", {
      key: 'w' + it.key
    }, /*#__PURE__*/React.createElement("path", {
      d: pathOf(it.pts),
      fill: "none",
      stroke: on ? 'rgba(243,198,108,0.65)' : 'rgba(127,217,197,0.55)',
      strokeWidth: w + 2 / view.s,
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: pathOf(it.pts),
      fill: "none",
      stroke: "#252f3c",
      strokeWidth: w,
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: pathOf(it.pts),
      fill: "none",
      stroke: on ? 'rgba(243,198,108,0.18)' : 'rgba(127,217,197,0.16)',
      strokeWidth: w,
      strokeLinejoin: "round"
    }));
  }), boundary && boundaryVisible && /*#__PURE__*/React.createElement("path", {
    d: pathOf(boundary, true),
    fill: "rgba(255,201,107,0.04)",
    stroke: "#ffc96b",
    strokeWidth: 1.7,
    strokeDasharray: "8 5",
    vectorEffect: "non-scaling-stroke"
  }), preview.map((c, i) => /*#__PURE__*/React.createElement("path", {
    key: 'p' + i,
    d: pathOf(c, true),
    fill: "rgba(80,210,120,0.17)",
    stroke: "#9ce9b4",
    strokeWidth: 1.7,
    vectorEffect: "non-scaling-stroke"
  }))), /*#__PURE__*/React.createElement("g", {
    transform: `translate(${tx} ${ty}) scale(${view.s})`
  }, ordered.filter(it => it.kind !== 'ports').map(it => {
    const on = sel.has(it.key);
    const color = on ? '#f3c66c' : featureColor(it.kind);
    return /*#__PURE__*/React.createElement("path", {
      key: it.key,
      d: pathOf(it.pts, it.kind === 'areas'),
      fill: it.kind === 'areas' ? on ? 'rgba(243,198,108,0.20)' : 'rgba(87,153,208,0.14)' : 'none',
      stroke: color,
      strokeWidth: on ? 2.6 : 1.3,
      vectorEffect: "non-scaling-stroke",
      strokeLinejoin: "round",
      style: {
        cursor: tool === 'select' || tool === 'edit' ? 'pointer' : cursor,
        pointerEvents: drawing || tool === 'port' || tool === 'box-select' ? 'none' : it.kind === 'areas' ? 'all' : 'stroke'
      },
      onClick: e => {
        if (panned.current) return;
        if (tool === 'select' || tool === 'edit') {
          e.stopPropagation();
          onSelect && onSelect(it.key, e.ctrlKey || e.metaKey);
        }
      },
      onDoubleClick: e => {
        e.stopPropagation();
        if (sel.has(it.key) && editable) onEditSelected && onEditSelected();
      }
    });
  })), ordered.filter(it => it.kind === 'ports').map(it => {
    const [x, y] = toScreen(it.pts[0]);
    const on = sel.has(it.key);
    return /*#__PURE__*/React.createElement("circle", {
      key: it.key,
      cx: x,
      cy: y,
      r: on ? 7 : 5,
      fill: on ? '#f3c66c' : '#edb7ea',
      stroke: "#222832",
      strokeWidth: 2,
      style: {
        cursor: 'pointer'
      },
      onPointerDown: e => e.stopPropagation(),
      onClick: e => {
        e.stopPropagation();
        onSelect && onSelect(it.key, e.ctrlKey || e.metaKey);
      }
    });
  }), visible.map(labelFor), editing && selItems.length === 1 && (() => {
    const it = selItems[0];
    const closed = it.kind === 'areas';
    const pts = it.pts.map(toScreen);
    const mids = it.kind === 'ports' ? [] : pts.slice(0, closed ? pts.length : pts.length - 1).map((p, i) => {
      const q = pts[(i + 1) % pts.length];
      return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    });
    return /*#__PURE__*/React.createElement("g", null, mids.map((m, i) => /*#__PURE__*/React.createElement("circle", {
      key: 'm' + i,
      cx: m[0],
      cy: m[1],
      r: 4,
      fill: "#9ce9b4",
      stroke: "#242b35",
      strokeWidth: 1.5
    })), pts.map((p, i) => /*#__PURE__*/React.createElement("g", {
      key: 'v' + i,
      style: {
        cursor: 'move'
      },
      onPointerDown: e => {
        e.stopPropagation();
        drag.current = {
          mode: 'vertex',
          key: it.key,
          index: i
        };
      }
    }, /*#__PURE__*/React.createElement("circle", {
      cx: p[0],
      cy: p[1],
      r: 7,
      fill: "#eff5ff",
      stroke: "#242b35",
      strokeWidth: 2
    }), /*#__PURE__*/React.createElement("text", {
      x: p[0],
      y: p[1] - 13,
      textAnchor: "middle",
      style: {
        font: '600 10px "Segoe UI", sans-serif',
        fill: '#eff5ff',
        stroke: '#242b35',
        strokeWidth: 3,
        paintOrder: 'stroke',
        pointerEvents: 'none'
      }
    }, i + 1))));
  })(), drawing && draft.length > 0 && (() => {
    const pts = [...draft.map(toScreen), ...(hoverPt ? [hoverPt] : [])];
    return /*#__PURE__*/React.createElement("g", {
      style: {
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: pathOf(pts, tool !== 'lane'),
      fill: tool === 'lane' ? 'none' : 'rgba(255,255,255,0.12)',
      stroke: tool === 'boundary' ? '#ffc96b' : '#eff5ff',
      strokeWidth: 1.7,
      strokeDasharray: tool === 'boundary' ? '8 5' : undefined
    }), draft.map(toScreen).map((p, i) => /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: p[0],
      cy: p[1],
      r: 4,
      fill: "#eff5ff",
      stroke: "#242b35",
      strokeWidth: 1.5
    })));
  })(), box && /*#__PURE__*/React.createElement("rect", {
    x: Math.min(box[0][0], box[1][0]),
    y: Math.min(box[0][1], box[1][1]),
    width: Math.abs(box[1][0] - box[0][0]),
    height: Math.abs(box[1][1] - box[0][1]),
    fill: "var(--accent-soft)",
    stroke: "var(--accent)",
    opacity: 0.5
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 8,
      left: 8,
      background: '#202b3b99',
      borderRadius: 4,
      padding: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, ['+', '−'].map((l, i) => /*#__PURE__*/React.createElement("button", {
    key: l,
    "aria-label": i ? 'Zoom out' : 'Zoom in',
    onClick: () => setView(v => ({
      ...v,
      s: Math.min(4, Math.max(0.02, v.s * (i ? 0.7 : 1.4)))
    })),
    style: {
      width: 25,
      minHeight: 25,
      height: 25,
      padding: 0,
      background: '#273345',
      color: '#e1e7ef',
      border: '1px solid #566477',
      borderRadius: 2,
      fontSize: 17,
      lineHeight: 1,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 8,
      bottom: 8,
      background: '#202b3b99',
      borderRadius: 4,
      padding: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid #eee',
      borderTop: 'none',
      color: '#eee',
      fontSize: 10,
      textAlign: 'center',
      width: sl.px,
      margin: 1
    }
  }, sl.nm, " NM")));
}
Object.assign(window, {
  MapCanvas,
  projX,
  projY,
  unprojLon,
  unprojLat
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/area-database-designer/MapCanvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/area-database-designer/PropertiesDock.jsx
try { (() => {
const PD = window.WorkbenchDesignSystem_7eab5c;
function PropertiesPanel({
  item,
  locked,
  onApply,
  onDelete
}) {
  const geomType = item.kind === 'areas' ? 'Polygon' : item.kind === 'lanes' ? 'LineString' : 'Point';
  const [draft, setDraft] = React.useState({
    name: item.name,
    source: item.source,
    code: item.code || '',
    width: item.width ? String(item.width * 1000).replace('.', ',') : ''
  });
  const [format, setFormat] = React.useState(item.kind === 'areas' ? 'dms' : 'dmm');
  const [positions, setPositions] = React.useState(item.pts.map(p => ({
    p,
    text: window.ADD.formatPosition(p, item.kind === 'areas' ? 'dms' : 'dmm')
  })));
  const [names, setNames] = React.useState(item.pointNames || []);
  const min = item.kind === 'lanes' ? 2 : item.kind === 'areas' ? 3 : 1;
  return /*#__PURE__*/React.createElement("form", {
    style: {
      padding: 12
    },
    onSubmit: e => {
      e.preventDefault();
      onApply({
        ...item,
        name: draft.name,
        source: draft.source,
        code: draft.code,
        pointNames: item.kind === 'lanes' ? names : undefined,
        pts: positions.map(r => r.p)
      });
    }
  }, /*#__PURE__*/React.createElement(PD.SectionHeading, {
    trailing: /*#__PURE__*/React.createElement(PD.Badge, null, geomType)
  }, "Properties"), /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: 0,
      margin: 0,
      padding: 0,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PD.Field, {
    label: "Name"
  }, /*#__PURE__*/React.createElement(PD.TextInput, {
    "aria-label": "Feature name",
    value: draft.name,
    onChange: e => setDraft({
      ...draft,
      name: e.target.value
    })
  })), /*#__PURE__*/React.createElement(PD.Field, {
    label: "Source"
  }, /*#__PURE__*/React.createElement(PD.TextInput, {
    "aria-label": "Feature source",
    value: draft.source,
    onChange: e => setDraft({
      ...draft,
      source: e.target.value
    })
  })), item.kind === 'ports' && /*#__PURE__*/React.createElement(PD.Field, {
    label: "Port code"
  }, /*#__PURE__*/React.createElement(PD.TextInput, {
    value: draft.code,
    onChange: e => setDraft({
      ...draft,
      code: e.target.value
    })
  })), item.kind === 'lanes' && /*#__PURE__*/React.createElement(PD.Field, {
    label: "Lane width (m)"
  }, /*#__PURE__*/React.createElement(PD.TextInput, {
    value: draft.width,
    onChange: e => setDraft({
      ...draft,
      width: e.target.value
    })
  })), item.kind === 'lanes' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PD.Eyebrow, null, "Waypoint names"), names.map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '15px 1fr',
      gap: 5,
      alignItems: 'center',
      paddingTop: 6,
      color: 'var(--muted)',
      fontSize: 10
    }
  }, /*#__PURE__*/React.createElement("span", null, i + 1), /*#__PURE__*/React.createElement(PD.TextInput, {
    "aria-label": 'Waypoint ' + (i + 1) + ' name',
    value: n,
    onChange: e => setNames(names.map((x, j) => j === i ? e.target.value.replace(/;/g, '') : x))
  })))), /*#__PURE__*/React.createElement(PD.Field, {
    label: "Position format"
  }, /*#__PURE__*/React.createElement(PD.Select, {
    "aria-label": "Position format",
    value: format,
    options: window.ADD.positionFormats,
    onChange: e => {
      const f = e.target.value;
      setFormat(f);
      setPositions(positions.map(r => ({
        ...r,
        text: window.ADD.formatPosition(r.p, f)
      })));
    }
  })), /*#__PURE__*/React.createElement(PD.Hint, null, "Enter any of the three formats. Untouched positions keep their full original precision, regardless of the displayed format. Position changes take effect on Apply."), locked && /*#__PURE__*/React.createElement(PD.Hint, null, "Geometry is locked. Unlock it to change or remove positions."), /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: 0,
      margin: 0,
      padding: 0,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      marginBottom: 8,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(PD.Eyebrow, null, "Positions")), positions.map((r, i) => /*#__PURE__*/React.createElement(PD.PositionRow, {
    key: i,
    index: i + 1,
    value: r.text,
    disabled: locked,
    removeDisabled: positions.length <= min || item.kind === 'ports',
    onChange: t => setPositions(positions.map((x, j) => j === i ? {
      ...x,
      text: t
    } : x)),
    onRemove: () => {
      setPositions(positions.filter((_, j) => j !== i));
      if (item.kind === 'lanes') setNames(names.filter((_, j) => j !== i));
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: -12,
      padding: '10px 0',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement(PD.ButtonRow, null, /*#__PURE__*/React.createElement(PD.Button, {
    type: "submit",
    variant: "primary"
  }, "Apply changes"), /*#__PURE__*/React.createElement(PD.Button, {
    variant: "danger",
    onClick: onDelete
  }, "Delete"))), /*#__PURE__*/React.createElement(PD.Hint, null, "Double-click the selected feature or use Edit geometry to show map handles, unless geometry is locked. Drag a numbered white handle to move a point, or a green midpoint to add one. Alt-click a white handle to remove it. Click away or press Escape to finish editing.")));
}
function PropertiesDock({
  items,
  selected,
  locked,
  onApply,
  onDelete,
  onClear,
  onMerge,
  onZoom
}) {
  const sel = items.filter(i => selected.has(i.key));
  const one = sel.length === 1 ? sel[0] : null;
  return /*#__PURE__*/React.createElement("aside", {
    "aria-label": "Selected item properties",
    style: {
      width: 340,
      maxWidth: '30vw',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)'
    }
  }, one && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      padding: '6px 12px',
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(PD.Button, {
    size: "sm",
    style: {
      flex: 1
    },
    onClick: () => onZoom(one.key)
  }, "Zoom to selection")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'auto',
      flex: 1,
      minHeight: 0
    }
  }, sel.length > 1 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(PD.SectionHeading, {
    flush: true,
    style: {
      marginBottom: 4
    }
  }, sel.length + ' features selected'), /*#__PURE__*/React.createElement(PD.Hint, null, "Use Edit geometry or double-click a selected feature to show shared handles. White handles move points shared by at least two selected features; green handles split their shared edges. Points and edges also used by an unselected area stay fixed. Each edit updates all selected owners together. Select one feature to edit its properties."), /*#__PURE__*/React.createElement(PD.ButtonRow, null, /*#__PURE__*/React.createElement(PD.Button, {
    variant: "danger",
    onClick: onDelete
  }, "Delete selected"), /*#__PURE__*/React.createElement(PD.Button, {
    onClick: onClear
  }, "Clear selection")), /*#__PURE__*/React.createElement(PD.ButtonRow, null, /*#__PURE__*/React.createElement(PD.Button, {
    disabled: locked || sel.some(i => i.kind !== 'areas'),
    onClick: onMerge
  }, "Merge selected areas")), /*#__PURE__*/React.createElement(PD.Hint, null, "Merge combines connected areas into one, keeping the first selected area's name and properties. Lanes, ports, disconnected results and holes are not supported. Undo restores the original areas.")) : one ? /*#__PURE__*/React.createElement(PropertiesPanel, {
    key: one.key + JSON.stringify(one.pts) + one.name,
    item: one,
    locked: locked,
    onApply: onApply,
    onDelete: onDelete
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      lineHeight: 1.6,
      color: 'var(--muted)',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement(PD.Eyebrow, null, "Properties"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      paddingTop: 8
    }
  }, "Select a feature in the explorer or map to inspect and edit it."))));
}
Object.assign(window, {
  PropertiesDock
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/area-database-designer/PropertiesDock.jsx", error: String((e && e.message) || e) }); }

// ui_kits/area-database-designer/model.js
try { (() => {
// Plain helpers for the Area Database Designer UI kit (cosmetic, not production logic).
(function () {
  const parsePath = d => d.replace(/Z$/, '').slice(1).split('L').map(p => p.split(' ').map(Number));
  const pad = (n, w) => String(n).padStart(w, '0');
  function dms(v, w, pos, neg) {
    const h = v >= 0 ? pos : neg;
    v = Math.abs(v);
    const d = Math.floor(v),
      mf = (v - d) * 60,
      m = Math.floor(mf),
      s = Math.round((mf - m) * 60);
    return {
      d,
      m,
      s,
      mf,
      h,
      w
    };
  }
  function formatPosition([x, y], format) {
    const lon = window.unprojLon(x),
      lat = window.unprojLat(y);
    const a = dms(lat, 2, 'N', 'S'),
      b = dms(lon, 3, 'E', 'W');
    const f = p => format === 'dm' ? pad(p.d, p.w) + pad(Math.round(p.mf), 2) + p.h : format === 'dmm' ? pad(p.d, p.w) + pad(Math.floor(p.mf), 2) + '.' + Math.round(p.mf % 1 * 10) % 10 + p.h : pad(p.d, p.w) + pad(p.m, 2) + pad(Math.min(59, p.s), 2) + p.h;
    return f(a) + '-' + f(b);
  }
  const positionFormats = [{
    value: 'dm',
    label: 'Degrees/minutes (7604N-02654E)'
  }, {
    value: 'dmm',
    label: 'Decimal minutes (7604.5N-02654.3E)'
  }, {
    value: 'dms',
    label: 'Degrees/minutes/seconds (760429N-0265417E)'
  }];
  function inRing(pt, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i],
        [xj, yj] = ring[j];
      if (yi > pt[1] !== yj > pt[1] && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function bbox(pts) {
    const xs = pts.map(p => p[0]),
      ys = pts.map(p => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  function landIndex(landD) {
    return landD.split('Z').filter(Boolean).map(s => {
      const ring = parsePath(s + 'Z');
      return {
        ring,
        bb: bbox(ring)
      };
    });
  }
  function onLand(pt, land) {
    return land.some(l => pt[0] >= l.bb[0] && pt[0] <= l.bb[2] && pt[1] >= l.bb[1] && pt[1] <= l.bb[3] && inRing(pt, l.ring));
  }
  function validate(items, land) {
    const names = new Map();
    for (const it of items) {
      const n = it.name.trim().toLowerCase();
      if (n) names.set(n, (names.get(n) || 0) + 1);
    }
    const issues = [];
    for (const it of items) {
      const n = it.name.trim().toLowerCase();
      if (!n) issues.push({
        key: it.key,
        severity: 'error',
        message: 'Name cannot be empty.'
      });else if (names.get(n) > 1) issues.push({
        key: it.key,
        severity: 'error',
        message: 'Duplicate name: ' + it.name + '.'
      });
      if (it.kind === 'areas' && it.pts.filter(p => onLand(p, land)).length >= 2) issues.push({
        key: it.key,
        severity: 'warning',
        message: 'Exercise area overlaps NaturalEarth land.'
      });
      if (it.kind === 'lanes' && it.pts.some(p => onLand(p, land))) issues.push({
        key: it.key,
        severity: 'warning',
        message: 'Lane crosses or touches land. Check route suitability.'
      });
    }
    return issues;
  }
  function nextName(items, prefix) {
    const used = new Set(items.map(i => i.name.trim().toLowerCase()));
    let n = 1;
    while (used.has((prefix + ' ' + n).toLowerCase())) n++;
    return prefix + ' ' + n;
  }
  const NATO = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL', 'INDIA', 'JULIETT', 'KILO', 'LIMA', 'MIKE', 'NOVEMBER', 'OSCAR', 'PAPA', 'QUEBEC', 'ROMEO', 'SIERRA', 'TANGO', 'UNIFORM', 'VICTOR', 'WHISKEY', 'XRAY', 'YANKEE', 'ZULU'];
  const GREEK = ['ALPHA', 'BETA', 'GAMMA', 'EPSILON', 'ZETA', 'ETA', 'THETA', 'IOTA', 'KAPPA', 'LAMBDA', 'MU', 'NU', 'XI', 'OMICRON', 'PI', 'RHO', 'TAU', 'UPSILON', 'PHI', 'CHI', 'PSI', 'OMEGA'];
  const NUMS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINER', 'TEN', 'ELEVEN', 'TWELVE'];
  const ALPHABETS = [{
    id: 'nato',
    label: 'NATO phonetic',
    words: NATO
  }, {
    id: 'greek',
    label: 'Greek',
    words: GREEK
  }, {
    id: 'latin',
    label: 'Roman/Latin A-Z',
    words: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  }, {
    id: 'runic',
    label: 'Runic (Elder Futhark)',
    words: ['FEHU', 'URUZ', 'THURISAZ', 'ANSUZ', 'RAIDO', 'KAUNAN', 'GEBO', 'WUNJO']
  }, {
    id: 'hebrew',
    label: 'Hebrew letter names',
    words: ['ALEPH', 'BET', 'GIMEL', 'DALET', 'HE', 'VAV', 'ZAYIN', 'HET']
  }];
  function nameSequence(alphabets, prefix, naming) {
    if (naming === 'prefix') {
      let i = 0;
      return () => prefix + ' ' + ++i;
    }
    const words = [...new Set(ALPHABETS.filter(a => alphabets.includes(a.id)).flatMap(a => a.words))];
    let i = 0;
    return () => {
      const w = words[i % words.length],
        n = NUMS[Math.floor(i / words.length)] || String(Math.floor(i / words.length) + 1);
      i++;
      return w + ' ' + n;
    };
  }
  // Excerpt of the bundled World Port Index snapshot (wpi.csv), Norwegian ports, region 20620.
  const WPI = [[21310, 'TROMSO', 69.65, 18.966667, 'M', 'OR'], [20920, 'HAMMERFEST', 70.666667, 23.666667, 'M', 'CN'], [22290, 'BODO', 67.283333, 14.383333, 'V', 'CB'], [22030, 'NARVIK', 68.433333, 17.416667, 'V', 'CB'], [21610, 'HARSTAD', 68.8, 16.55, 'M', 'CN'], [21900, 'SVOLVAER', 68.233333, 14.583333, 'S', 'CN'], [20650, 'KIRKENES', 69.733333, 30.05, 'S', 'CN'], [20700, 'VARDO', 70.366667, 31.116667, 'S', 'CN'], [20800, 'HONNINGSVAG', 70.983333, 26.0, 'S', 'CN'], [21130, 'ALTA', 69.966667, 23.25, 'V', 'CN'], [21660, 'ANDENES', 69.333333, 16.133333, 'V', 'OR'], [21670, 'SORTLAND', 68.7, 15.416667, 'V', 'CN'], [22760, 'MO INLET', 66.316667, 14.133333, 'S', 'OR'], [22750, 'SANDNESSJOEN', 66.016667, 12.633333, 'V', 'CN'], [22990, 'BRONNOYSUND', 65.466667, 12.2, 'V', 'CN'], [23090, 'TRONDHEIM', 63.433333, 10.4, 'M', 'CN'], [23100, 'KRISTIANSUND', 63.116667, 7.733333, 'S', 'CN'], [23120, 'ALESUND', 62.466667, 6.166667, 'S', 'CB'], [23110, 'MOLDE', 62.733333, 7.166667, 'S', 'CN'], [23125, 'MALOY', 61.933333, 5.116667, 'S', 'CN'], [23138, 'MONGSTAD', 60.816667, 5.033333, 'M', 'OR'], [23160, 'BERGEN', 60.4, 5.316667, 'M', 'CN'], [23440, 'HAUGESUND', 59.416667, 5.266667, 'S', 'CN'], [23480, 'STAVANGER', 58.966667, 5.75, 'M', 'CB'], [23550, 'KRISTIANSAND', 58.15, 8.0, 'S', 'CN'], [23810, 'OSLO', 59.916667, 10.75, 'L', 'CN']].map(([index, name, lat, lon, size, type]) => ({
    index: String(index),
    name,
    lat,
    lon,
    size,
    type,
    country: 'NO',
    region: '20620'
  }));
  const SIZE = {
    L: 'Large',
    M: 'Medium',
    S: 'Small',
    V: 'Very small'
  };
  const TYPE = {
    CN: 'Coastal (natural)',
    CB: 'Coastal (breakwater)',
    OR: 'Open roadstead',
    RN: 'River (natural)',
    RB: 'River (basin)',
    LC: 'Lake or canal'
  };
  const titleCase = s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  async function loadProject() {
    const data = await (await fetch('map-data.json')).json();
    let k = 0;
    const items = [...data.areas.map(a => ({
      key: 'f' + k++,
      kind: 'areas',
      name: a.name,
      source: 'Development [U]',
      pts: parsePath(a.d)
    })), ...data.lanes.map(l => ({
      key: 'f' + k++,
      kind: 'lanes',
      name: l.name,
      source: 'Development [U]',
      pts: l.coords,
      width: l.width,
      pointNames: l.pts
    }))];
    return {
      land: data.land,
      landIndex: landIndex(data.land),
      items
    };
  }
  window.ADD = {
    loadProject,
    formatPosition,
    positionFormats,
    validate,
    nextName,
    nameSequence,
    ALPHABETS,
    WPI,
    SIZE,
    TYPE,
    titleCase,
    onLand,
    bbox,
    inRing
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/area-database-designer/model.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Hint = __ds_scope.Hint;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Separator = __ds_scope.Separator;

__ds_ns.StatusDot = __ds_scope.StatusDot;

__ds_ns.LayerPanel = __ds_scope.LayerPanel;

__ds_ns.ProjectHeading = __ds_scope.ProjectHeading;

__ds_ns.SidebarTabs = __ds_scope.SidebarTabs;

__ds_ns.TreeGroup = __ds_scope.TreeGroup;

__ds_ns.TreeItem = __ds_scope.TreeItem;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.InlineStatus = __ds_scope.InlineStatus;

__ds_ns.MapCaption = __ds_scope.MapCaption;

__ds_ns.MapNotice = __ds_scope.MapNotice;

__ds_ns.Notification = __ds_scope.Notification;

__ds_ns.Progress = __ds_scope.Progress;

__ds_ns.SummaryCard = __ds_scope.SummaryCard;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.FieldPair = __ds_scope.FieldPair;

__ds_ns.FilterGroup = __ds_scope.FilterGroup;

__ds_ns.PositionRow = __ds_scope.PositionRow;

__ds_ns.SearchBox = __ds_scope.SearchBox;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.ButtonRow = __ds_scope.ButtonRow;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.CommandBar = __ds_scope.CommandBar;

__ds_ns.Spacer = __ds_scope.Spacer;

__ds_ns.ProblemsBar = __ds_scope.ProblemsBar;

__ds_ns.ProblemFilter = __ds_scope.ProblemFilter;

__ds_ns.ProblemRow = __ds_scope.ProblemRow;

__ds_ns.Splitter = __ds_scope.Splitter;

__ds_ns.StatusBar = __ds_scope.StatusBar;

__ds_ns.StatusItem = __ds_scope.StatusItem;

__ds_ns.Titlebar = __ds_scope.Titlebar;

__ds_ns.Toolbar = __ds_scope.Toolbar;

__ds_ns.ToolButton = __ds_scope.ToolButton;

__ds_ns.CoordinateBadge = __ds_scope.CoordinateBadge;

})();
