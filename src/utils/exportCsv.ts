import type { Business } from '../types';

const HEADERS = [
  'Business Name',
  'Phone Number',
  'International Phone',
  'Address',
  'Website',
  'Rating',
  'Review Count',
  'Google Maps Link',
  'Business Status',
  'Place ID',
];

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function businessToRow(b: Business): string[] {
  return [
    b.name,
    b.phone ?? '',
    b.internationalPhone ?? '',
    b.address ?? '',
    b.website ?? '',
    b.rating !== null ? String(b.rating) : '',
    b.reviewCount !== null ? String(b.reviewCount) : '',
    b.googleMapsUri ?? '',
    b.businessStatus ?? '',
    b.placeId,
  ];
}

/** Exports the given (already filtered/sorted) businesses as a downloadable CSV file. */
export function downloadBusinessesAsCsv(businesses: Business[], fileName = 'business-leads.csv'): void {
  const lines = [HEADERS, ...businesses.map(businessToRow)].map((row) =>
    row.map(escapeCsvValue).join(',')
  );
  const csvContent = lines.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
