export const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="h-dvh w-dvw lg:h-full lg:w-full relative overflow-hidden p-1 lg:p-4"
    style={{
      maxWidth: 'var(--app-max-width)',
      maxHeight: 'var(--app-max-height)',
    }}
  >
    <main className="h-full w-full">{children}</main>
  </div>
);
