import { useState } from 'react';

interface TechNoiseProps {
  brackets?: number;
  crosses?: number;
  dots?: number;
  scanLines?: number;
}

type NoiseItem =
  | { corner: number; type: 'bracket'; x: number; y: number }
  | { type: 'cross'; x: number; y: number }
  | { type: 'dot'; x: number; y: number }
  | { type: 'scanline'; width: number; y: number };

// Generate random items once on mount, not during render
function generateNoiseItems(crosses: number, dots: number, brackets: number, scanLines: number): NoiseItem[] {
  const xs: NoiseItem[] = [];

  // crosses
  for (let i = 0; i < crosses; i++) {
    xs.push({
      type: 'cross',
      x: Math.random() * 100,
      y: Math.random() * 100,
    });
  }

  // dots
  for (let d = 0; d < dots; d++) {
    xs.push({
      type: 'dot',
      x: Math.random() * 100,
      y: Math.random() * 100,
    });
  }

  // brackets (corner markers)
  for (let b = 0; b < brackets; b++) {
    xs.push({
      type: 'bracket',
      x: Math.random() * 100,
      y: Math.random() * 100,
      corner: Math.floor(Math.random() * 4), // 0: TL, 1: TR, 2: BR, 3: BL
    });
  }

  // scan lines
  for (let s = 0; s < scanLines; s++) {
    xs.push({
      type: 'scanline',
      y: Math.random() * 100,
      width: 20 + Math.random() * 40, // random width between 20-60%
    });
  }

  return xs;
}

export const TechNoise = ({ crosses = 5, dots = 30, brackets = 8, scanLines = 12 }: TechNoiseProps) => {
  const [items] = useState<NoiseItem[]>(() => generateNoiseItems(crosses, dots, brackets, scanLines));

  return (
    <svg className="pointer-events-none absolute inset-0 z-20" width="100%" height="100%" preserveAspectRatio="none">
      <g opacity="0.25" stroke="rgba(66,220,232,0.4)" fill="none">
        {items.map((i, idx) =>
          i.type === 'cross' ? (
            <g key={idx}>
              <line x1={`${i.x - 1}%`} y1={`${i.y}%`} x2={`${i.x + 1}%`} y2={`${i.y}%`} />
              <line x1={`${i.x}%`} y1={`${i.y - 1}%`} x2={`${i.x}%`} y2={`${i.y + 1}%`} />
            </g>
          ) : i.type === 'dot' ? (
            <circle key={idx} cx={`${i.x}%`} cy={`${i.y}%`} r="2" fill="rgba(233,72,217,0.4)" stroke="none" />
          ) : i.type === 'scanline' ? (
            <line key={idx} x1="0%" y1={`${i.y}%`} x2={`${i.width}%`} y2={`${i.y}%`} strokeWidth="0.3" opacity="0.6" />
          ) : (
            <g key={idx} strokeWidth="0.5">
              {i.corner === 0 && (
                <>
                  <line x1={`${i.x}%`} y1={`${i.y}%`} x2={`${i.x + 1.5}%`} y2={`${i.y}%`} />
                  <line x1={`${i.x}%`} y1={`${i.y}%`} x2={`${i.x}%`} y2={`${i.y + 1.5}%`} />
                </>
              )}
              {i.corner === 1 && (
                <>
                  <line x1={`${i.x}%`} y1={`${i.y}%`} x2={`${i.x - 1.5}%`} y2={`${i.y}%`} />
                  <line x1={`${i.x}%`} y1={`${i.y}%`} x2={`${i.x}%`} y2={`${i.y + 1.5}%`} />
                </>
              )}
              {i.corner === 2 && (
                <>
                  <line x1={`${i.x}%`} y1={`${i.y}%`} x2={`${i.x - 1.5}%`} y2={`${i.y}%`} />
                  <line x1={`${i.x}%`} y1={`${i.y}%`} x2={`${i.x}%`} y2={`${i.y - 1.5}%`} />
                </>
              )}
              {i.corner === 3 && (
                <>
                  <line x1={`${i.x}%`} y1={`${i.y}%`} x2={`${i.x + 1.5}%`} y2={`${i.y}%`} />
                  <line x1={`${i.x}%`} y1={`${i.y}%`} x2={`${i.x}%`} y2={`${i.y - 1.5}%`} />
                </>
              )}
            </g>
          )
        )}
      </g>
    </svg>
  );
};
