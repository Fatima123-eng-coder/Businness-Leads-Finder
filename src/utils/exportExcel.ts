import type { Business } from '../types';

interface ExcelRow {
  'Business Name': string;
  'Phone Number': string;
  'International Phone': string;
  Address: string;
  Website: string;
  Rating: number | string;
  'Review Count': number | string;
  'Google Maps Link': string;
  'Business Status': string;
  'Place ID': string;
}

function businessToExcelRow(b: Business): ExcelRow {
  return {
    'Business Name': b.name,
    'Phone Number': b.phone ?? '',
    'International Phone': b.internationalPhone ?? '',
    Address: b.address ?? '',
    Website: b.website ?? '',
    Rating: b.rating ?? '',
    'Review Count': b.reviewCount ?? '',
    'Google Maps Link': b.googleMapsUri ?? '',
    'Business Status': b.businessStatus ?? '',
    'Place ID': b.placeId,
  };
}

/**
 * Exports the given (already filtered/sorted) businesses as a downloadable .xlsx file.
 * The `xlsx` library is dynamically imported so it is only downloaded by the
 * browser when the user actually requests an Excel export, keeping the
 * main app bundle small.
 */
export async function downloadBusinessesAsExcel(
  businesses: Business[],
  fileName = 'business-leads.xlsx'
): Promise<void> {
  const XLSX = await import('xlsx');
  const rows = businesses.map(businessToExcelRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Reasonable column widths so the exported sheet is readable out of the box.
  worksheet['!cols'] = [
    { wch: 28 }, // Business Name
    { wch: 16 }, // Phone Number
    { wch: 18 }, // International Phone
    { wch: 36 }, // Address
    { wch: 28 }, // Website
    { wch: 8 }, // Rating
    { wch: 12 }, // Review Count
    { wch: 36 }, // Google Maps Link
    { wch: 16 }, // Business Status
    { wch: 28 }, // Place ID
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Business Leads');
  XLSX.writeFile(workbook, fileName);
}
