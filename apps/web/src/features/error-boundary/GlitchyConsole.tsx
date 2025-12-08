const ERROR_CODES = ['CORE_DUMP', 'SEG_FAULT', 'MEM_LEAK', 'NULL_PTR', 'STACK_OVF', 'HEAP_CORR', 'IO_FAIL', 'TIMEOUT'];

const FILE_PATHS = [
  'zack/apps/web/src/main.tsx',
  'zack/apps/web/src/routes.tsx',
  'zack/apps/api/internal/app.go',
  'zack/apps/web/src/lib/queryClient.ts',
  'zack/apps/api/internal/handlers/auth.go',
  'zack/apps/web/src/components/ui/HudDrawer.tsx',
  'zack/apps/api/internal/services/cooking.go',
  'zack/apps/web/src/features/disc-golf/bags.tsx',
  'zack/apps/api/internal/llm/openai.go',
  'zack/apps/web/src/utils/api.client.ts',
  'zack/apps/api/internal/database/mongodb.go',
  'zack/apps/web/src/hooks/useClippedShape.ts',
];

const baseTime = { h: 14, m: 23, s: 47 };
const TERMINAL_ERRORS = Array.from({ length: 50 }, (_, i) => {
  const totalSeconds = baseTime.s + i * 2 + Math.floor(Math.random() * 3); // ~2-4 seconds between errors
  const s = totalSeconds % 60;
  const extraMinutes = Math.floor(totalSeconds / 60);
  const m = (baseTime.m + extraMinutes) % 60;
  const h = baseTime.h + Math.floor((baseTime.m + extraMinutes) / 60);

  return {
    id: i,
    timestamp: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    code: ERROR_CODES[Math.floor(Math.random() * ERROR_CODES.length)],
    file: FILE_PATHS[Math.floor(Math.random() * FILE_PATHS.length)],
    line: Math.floor(Math.random() * 500) + 1,
    delay: i * 0.15,
  };
});

const STATIC_BLOCKS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: 50 + Math.random() * 45,
  top: Math.random() * 80,
  width: 30 + Math.random() * 80,
  height: 2 + Math.random() * 8,
  delay: Math.random() * 2,
}));

export const GlitchyConsole = () => {
  return (
    <div className="fixed inset-0 bg-surface-900 font-mono text-xs">
      {/* Scan lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
        }}
      />

      {/* Terminal error log */}
      <div className="flex flex-col gap-0.5 p-6 w-full items-start">
        {TERMINAL_ERRORS.map((err) => (
          <div
            key={err.id}
            className="text-secondary whitespace-nowrap animate-[fadeIn_0.3s_ease-out_forwards] opacity-0"
            style={{ animationDelay: `${err.delay}s` }}
          >
            <span className="text-primary/50">[{err.timestamp}]</span>{' '}
            <span className="text-secondary">{err.code}</span>{' '}
            <span className="text-primary/30">
              {err.file}:{err.line}
            </span>
          </div>
        ))}
      </div>

      {/* Static noise blocks */}
      {STATIC_BLOCKS.map((block) => (
        <div
          key={block.id}
          className="absolute bg-primary/10 animate-pulse"
          style={{
            left: `${block.left}%`,
            top: `${block.top}%`,
            width: `${block.width}px`,
            height: `${block.height}px`,
            animationDelay: `${block.delay}s`,
            animationDuration: '0.5s',
          }}
        />
      ))}
    </div>
  );
};
