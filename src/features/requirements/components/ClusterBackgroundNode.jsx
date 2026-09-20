import { memo } from "react";

function ClusterBackgroundNodeImpl({ data }) {
  return (
    <div
      className="pointer-events-none rounded-2xl border border-dashed"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: `${data.color}0d`,
        borderColor: `${data.color}55`,
      }}
    >
      <div
        className="inline-flex items-center gap-1.5 rounded-br-lg rounded-tl-2xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{ backgroundColor: `${data.color}1a`, color: data.color }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: data.color }} />
        {data.label}
        <span className="font-normal normal-case opacity-70">· {data.count}</span>
      </div>
    </div>
  );
}

export const ClusterBackgroundNode = memo(ClusterBackgroundNodeImpl);
