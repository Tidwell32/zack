import type { AccentPosition } from '@/components/ui/ClippedCard';

import { generateBevelPoints } from './ui.bevelUtils';
import { LAYERED_BORDER, OPACITY_VALUES } from './ui.designConstants';

interface LayeredBorderProps {
  bevelBase: number;
  borderColor: string;
  borderWidth: number;
  height: number;
  width: number;
}

export const renderLayeredBorder = ({ width, height, bevelBase, borderWidth, borderColor }: LayeredBorderProps) => (
  <>
    {/* Outer border */}
    <polygon
      points={generateBevelPoints(width, height, bevelBase, borderWidth / 2)}
      fill="none"
      stroke={borderColor}
      strokeWidth={borderWidth}
      strokeLinejoin="round"
    />
    {/* Inner parallel border */}
    <polygon
      points={generateBevelPoints(
        width,
        height,
        bevelBase * LAYERED_BORDER.innerBevelMultiplier,
        borderWidth / 2 + LAYERED_BORDER.innerInset
      )}
      fill="none"
      stroke={borderColor}
      strokeWidth={borderWidth * LAYERED_BORDER.innerStrokeMultiplier}
      strokeOpacity={LAYERED_BORDER.innerOpacity}
      strokeLinejoin="round"
    />
  </>
);

export const renderSegmentedBorder = ({
  width,
  height,
  bevel,
  inset,
  color,
  borderWidth,
}: {
  bevel: number;
  borderWidth: number;
  color: string;
  height: number;
  inset: number;
  width: number;
}) => {
  const w = width;
  const h = height;

  const topY = inset;
  const bottomY = h - inset;
  const leftX = inset;
  const rightX = w - inset;

  const topLeftX = bevel + inset;
  const topRightX = w - bevel - inset;
  const leftTopY = bevel + inset;
  const leftBottomY = h - bevel - inset;

  // how big the "gap" near each edge center should be
  const gapRatio = 0.28;
  const topSpan = topRightX - topLeftX;
  const topGap = topSpan * gapRatio;
  const topSegment = (topSpan - topGap) / 2;

  const sideSpan = leftBottomY - leftTopY;
  const sideGap = sideSpan * gapRatio;
  const sideSegment = (sideSpan - sideGap) / 2;

  return (
    <g
      fill="none"
      stroke={color}
      strokeWidth={borderWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeOpacity={OPACITY_VALUES.border.simple}
    >
      {/* TOP EDGE (two segments with a gap in the center) */}
      <polyline points={`${topLeftX},${topY} ${topLeftX + topSegment},${topY}`} />
      <polyline points={`${topRightX - topSegment},${topY} ${topRightX},${topY}`} />

      {/* RIGHT EDGE */}
      <polyline points={`${rightX},${leftTopY} ${rightX},${leftTopY + sideSegment}`} />
      <polyline points={`${rightX},${leftBottomY - sideSegment} ${rightX},${leftBottomY}`} />

      {/* BOTTOM EDGE */}
      <polyline points={`${topLeftX},${bottomY} ${topLeftX + topSegment},${bottomY}`} />
      <polyline points={`${topRightX - topSegment},${bottomY} ${topRightX},${bottomY}`} />

      {/* LEFT EDGE */}
      <polyline points={`${leftX},${leftTopY} ${leftX},${leftTopY + sideSegment}`} />
      <polyline points={`${leftX},${leftBottomY - sideSegment} ${leftX},${leftBottomY}`} />
    </g>
  );
};

export const renderCardAccents = (position: AccentPosition, color: string, width: number, height: number) => {
  const opacity = 0.35;
  const strokeWidth = 1.5;

  switch (position) {
    case 'top-left': {
      const o = 14;

      const corner = [
        { x: o, y: o + 12 },
        { x: o, y: o },
        { x: o + 12, y: o },
      ];

      const inner = [
        { x: o + 6, y: o + 18 },
        { x: o + 6, y: o + 6 },
        { x: o + 18, y: o + 6 },
      ];

      return (
        <g key={position} opacity={opacity} stroke={color} strokeWidth={strokeWidth} fill="none">
          <polyline points={corner.map((p) => `${p.x},${p.y}`).join(' ')} />
          <polyline points={inner.map((p) => `${p.x},${p.y}`).join(' ')} />
        </g>
      );
    }
    case 'top-right': {
      const padding = 14;
      const startX = width - padding - 160;
      const endX = width - padding;

      const lines = Array.from({ length: 3 }).map((_, i) => {
        const y = padding + i * 12;
        return <line key={i} x1={startX + i * 24} y1={y} x2={endX} y2={y} strokeWidth={1} />;
      });

      return (
        <g key={position} opacity={opacity} stroke={color}>
          {lines}
        </g>
      );
    }

    case 'bottom-left': {
      const o = 16;

      return (
        <g key={position} opacity={opacity} stroke={color} strokeWidth={1.2} fill="none">
          <polyline points={`${o},${height - o - 8} ${o},${height - o} ${o + 16},${height - o}`} />

          <line x1={o + 4} y1={height - o - 4} x2={o + 28} y2={height - o - 4} />
          <line x1={o + 4} y1={height - o + 2} x2={o + 20} y2={height - o + 2} />
        </g>
      );
    }

    case 'bottom-right': {
      const o = 14;

      const outer = [
        { x: width - o - 12, y: height - o },
        { x: width - o, y: height - o },
        { x: width - o, y: height - o - 12 },
      ];

      const inner = [
        { x: width - o - 18, y: height - o - 6 },
        { x: width - o - 6, y: height - o - 6 },
        { x: width - o - 6, y: height - o - 18 },
      ];

      return (
        <g key={position} opacity={opacity} stroke={color} strokeWidth={strokeWidth} fill="none">
          <polyline points={outer.map((p) => `${p.x},${p.y}`).join(' ')} />
          <polyline points={inner.map((p) => `${p.x},${p.y}`).join(' ')} />
        </g>
      );
    }
  }
};
