import { useRef, useState } from "react";
import { Diamond } from "lucide-react";
import { statusBarClass } from "../lib/scheduleUtils";
import { cn } from "../../../lib/utils";

// One task's row within GanttChart's timeline column: a muted "baseline"
// ghost track showing what was originally planned, with the actual/live
// bar drawn on top so the gap between them (variance) is visible at a
// glance. Milestone tasks additionally get a diamond marker at their end.
//
// PM-only: the actual bar is drag-to-reschedule. Dragging is pointer-
// event driven (not native HTML5 DnD) so it works the same in day-count
// terms whether the timeline is percentage-scaled (Week/Sprint) or
// fixed px-per-day (zoomed Project Timeline), `containerRef` points at
// whichever element establishes that coordinate space, and `totalDays`
// lets a drag convert a live pixel delta into a whole-day offset. A tiny
// drag (a plain click) is treated as a click, not a reschedule.
export function TaskBar({ task, rangeStart, rangeEnd, onClick, draggable, onReschedule, containerRef, totalDays, pxPerDay }) {
  const totalMs = rangeEnd.getTime() - rangeStart.getTime();
  const pct = (date) => {
    const clamped = Math.min(Math.max(new Date(date).getTime(), rangeStart.getTime()), rangeEnd.getTime());
    return ((clamped - rangeStart.getTime()) / totalMs) * 100;
  };

  const barLeft = pct(task.start);
  const barRight = pct(task.end);
  const baseLeft = pct(task.baselineStart);
  const baseRight = pct(task.baselineEnd);
  const barWidth = Math.max(barRight - barLeft, 1);
  const baseWidth = Math.max(baseRight - baseLeft, 1);

  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragPxRef = useRef(0);
  const startXRef = useRef(0);
  const pxPerDayRef = useRef(20);

  const handlePointerMove = (e) => {
    const dx = e.clientX - startXRef.current;
    dragPxRef.current = dx;
    setDragPx(dx);
  };
  const handlePointerUp = () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    setIsDragging(false);
    const movedPx = Math.abs(dragPxRef.current);
    const deltaDays = Math.round(dragPxRef.current / pxPerDayRef.current);
    setDragPx(0);
    if (movedPx < 3) {
      onClick?.(task);
    } else if (deltaDays !== 0) {
      onReschedule?.(task, deltaDays);
    }
  };
  const handlePointerDown = (e) => {
    e.stopPropagation();
    startXRef.current = e.clientX;
    pxPerDayRef.current = pxPerDay ?? ((containerRef?.current?.getBoundingClientRect().width || totalDays * 20) / (totalDays || 1));
    dragPxRef.current = 0;
    setIsDragging(true);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div className="relative h-9 w-full">
      {baseWidth > 0.3 && (
        <div
          className="absolute top-1.5 h-1.5 rounded-full bg-muted-foreground/25"
          style={{ left: `${baseLeft}%`, width: `${baseWidth}%` }}
          title="Baseline"
        />
      )}
      <button
        type="button"
        onClick={!draggable ? () => onClick?.(task) : undefined}
        onPointerDown={draggable ? handlePointerDown : undefined}
        className={cn(
          "absolute top-4 flex h-4 items-center overflow-hidden rounded-md px-1.5 text-left text-[10px] font-medium leading-none text-white shadow-sm transition-transform",
          !isDragging && "hover:z-10 hover:scale-y-125",
          isDragging ? "z-20 cursor-grabbing shadow-lg" : draggable ? "cursor-grab" : "cursor-default",
          statusBarClass(task)
        )}
        style={{
          left: `${barLeft}%`,
          width: `${barWidth}%`,
          transform: dragPx ? `translateX(${dragPx}px)` : undefined,
        }}
      >
        <span className="truncate">{task.name}</span>
      </button>
      {task.milestone && (
        <Diamond
          className="absolute top-3 h-3.5 w-3.5 fill-primary text-primary drop-shadow-sm"
          style={{ left: `calc(${barRight}% - 7px)` }}
        />
      )}
    </div>
  );
}
