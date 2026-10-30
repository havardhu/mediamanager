import { useCallback, useState, type PointerEvent as RPointerEvent } from 'react';

/**
 * Splitter from the Workbench design system (5px, border colour, accent on hover/drag),
 * generalised to both axes and to panels that grow towards the left or up.
 * Drag to resize, arrow keys step by 20px, double-click restores the default size.
 */
export function Resizer({
  axis,
  value,
  onChange,
  min,
  max,
  invert = false,
  defaultValue,
  label,
}: {
  axis: 'x' | 'y';
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  /** True when dragging towards the start (left/up) makes the panel bigger. */
  invert?: boolean;
  defaultValue?: number;
  label: string;
}) {
  const [hot, setHot] = useState(false);
  const [dragging, setDragging] = useState(false);
  const clamp = useCallback((v: number) => Math.round(Math.min(max, Math.max(min, v))), [min, max]);

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const start = axis === 'x' ? e.clientX : e.clientY;
    const startValue = value;
    setDragging(true);
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    const move = (ev: PointerEvent) => {
      const delta = (axis === 'x' ? ev.clientX : ev.clientY) - start;
      onChange(clamp(startValue + (invert ? -delta : delta)));
    };
    const stop = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', stop);
      el.removeEventListener('pointercancel', stop);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = '';
      setDragging(false);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
  };

  const active = hot || dragging;
  const grow = axis === 'x' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowDown', 'ArrowUp'];
  return (
    <div
      role="separator"
      aria-label={label}
      title={label}
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={down}
      onDoubleClick={() => defaultValue != null && onChange(clamp(defaultValue))}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      onKeyDown={e => {
        const i = grow.indexOf(e.key);
        if (i < 0) return;
        e.preventDefault();
        const dir = (i === 0 ? 1 : -1) * (invert ? -1 : 1);
        onChange(clamp(value + dir * 20));
      }}
      style={{
        [axis === 'x' ? 'width' : 'height']: 5,
        flexShrink: 0,
        // A 1px border line inside a 5px grab area; the whole handle lights up on hover/drag.
        background: active
          ? 'var(--accent)'
          : `linear-gradient(${axis === 'x' ? 'to right' : 'to bottom'}, transparent 2px, var(--border) 2px, var(--border) 3px, transparent 3px)`,
        cursor: axis === 'x' ? 'col-resize' : 'row-resize',
        touchAction: 'none',
        outline: 'none',
      }}
    />
  );
}

/** A size remembered in this browser (localStorage), shared by every tab. */
export function useStoredSize(key: string, initial: number): [number, (v: number) => void] {
  const [v, setV] = useState<number>(() => {
    try {
      const s = localStorage.getItem('seedboxsync.size.' + key);
      const n = s == null ? NaN : Number(s);
      return isFinite(n) && n > 0 ? n : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (n: number) => {
      setV(n);
      try {
        localStorage.setItem('seedboxsync.size.' + key, String(n));
      } catch {
        /* storage unavailable */
      }
    },
    [key],
  );
  return [v, set];
}
