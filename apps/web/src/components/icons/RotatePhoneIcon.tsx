import type { IconProps } from '@/types/icon';

export const RotatePhoneIcon = ({ color = 'currentColor', size = 24, className }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Phone body - portrait rectangle with beveled/clipped corners */}
      <path d="M 35 15 L 65 15 L 70 20 L 70 80 L 65 85 L 35 85 L 30 80 L 30 20 Z" />

      {/* Screen indicator line at top */}
      <line x1="40" y1="22" x2="60" y2="22" opacity="0.6" />

      {/* Super cool tech noise inside phone screen */}
      <g opacity="0.4">
        <text x="38" y="35" fontSize="8" fill={color} fontFamily="monospace">
          {'01'}
        </text>
        <text x="55" y="42" fontSize="6" fill={color} fontFamily="monospace">
          {'//'}
        </text>
        <line x1="37" y1="48" x2="45" y2="48" strokeWidth="0.5" />
        <text x="50" y="52" fontSize="7" fill={color} fontFamily="monospace">
          {'zt'}
        </text>
        <circle cx="40" cy="58" r="1.5" fill={color} />
        <text x="45" y="62" fontSize="6" fill={color} fontFamily="monospace">
          {'>'}
        </text>
        <line x1="54" y1="58" x2="62" y2="58" strokeWidth="0.5" />
        <text x="37" y="70" fontSize="5" fill={color} fontFamily="monospace">
          {'[ ]'}
        </text>
        <line x1="50" y1="68" x2="56" y2="68" strokeWidth="0.5" />
        <text x="58" y="73" fontSize="6" fill={color} fontFamily="monospace">
          {'#'}
        </text>
      </g>

      {/* Top-left curved arrow wrapping around corner */}
      <path d="M 20 23 Q 20 5 35 5" fill="none" strokeWidth="2" />
      <path d="M 38 5 L 33 2 L 33 8 Z" fill={color} stroke="none" />

      {/* Bottom-right curved arrow wrapping around corner */}
      <path d="M 80 77 Q 80 95 65 95" fill="none" strokeWidth="2" />
      <path d="M 62 95 L 67 98 L 67 92 Z" fill={color} stroke="none" />
    </svg>
  );
};
