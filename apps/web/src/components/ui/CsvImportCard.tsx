import type { ReactNode } from 'react';
import { useState } from 'react';

import { FileField } from '../forms';

import { Button } from './Button';
import { ClippedCard } from './ClippedCard';

interface CsvImportCardProps {
  onImport: (file: File) => void;
  children?: ReactNode;
}

export const CsvImportCard = ({ children, onImport }: CsvImportCardProps) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleImport = () => {
    if (!csvFile) return;
    onImport(csvFile);
    setCsvFile(null);
  };

  return (
    <ClippedCard>
      <details className="group">
        <summary className="cursor-pointer list-none">
          <div className="flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            <span>Import CSV</span>
          </div>
        </summary>
        <div className="flex flex-row flex-wrap gap-4 p-4 items-center border-t mt-4 border-primary/20">
          {children}

          <FileField value={csvFile} onChange={setCsvFile} accept=".csv" className="whitespace-nowrap" />
          <Button variant="primaryGhost" disabled={!csvFile} onClick={handleImport}>
            Import
          </Button>
        </div>
      </details>
    </ClippedCard>
  );
};
