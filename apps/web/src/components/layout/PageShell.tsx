export const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="h-full w-full text-slate-100 overflow-hidden p-2 md:p-8 lg:p-8"
    style={{
      maxWidth: 'var(--app-max-width)',
      maxHeight: 'var(--app-max-height)',
    }}
  >
    <main className="h-full w-full">{children}</main>
  </div>
);
