import { useState } from 'react';
import type { Business } from '../types';
import { downloadBusinessesAsCsv } from '../utils/exportCsv';
import { downloadBusinessesAsExcel } from '../utils/exportExcel';

interface ExportButtonsProps {
  businesses: Business[];
}

export default function ExportButtons({ businesses }: ExportButtonsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const disabled = businesses.length === 0;

  const handleExcelExport = async () => {
    setIsExportingExcel(true);
    try {
      await downloadBusinessesAsExcel(businesses);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="export-buttons">
      <button
        type="button"
        className="btn btn-secondary"
        disabled={disabled}
        onClick={() => downloadBusinessesAsCsv(businesses)}
      >
        Download CSV
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={disabled || isExportingExcel}
        onClick={handleExcelExport}
      >
        {isExportingExcel ? 'Preparing…' : 'Download Excel'}
      </button>
    </div>
  );
}
