/**
 * Google Apps Script untuk menerima data dari form Laporan Keuangan Sie Keamanan
 * dan menyimpannya ke Google Sheets.
 * 
 * CARA PENGGUNAAN:
 * 1. Buka Google Sheets Anda (https://docs.google.com/spreadsheets/d/1234567890/edit)
 * 2. Klik menu "Ekstensi" > "Apps Script"
 * 3. Hapus semua kode yang ada (Code.gs) dan paste kode ini
 * 4. Simpan (Ctrl+S / Cmd+S)
 * 5. Klik "Terapkan" (Deploy) > "Deployment baru"
 * 6. Pilih jenis: "Aplikasi web"
 * 7. Deskripsi: "API Laporan Keuangan"
 * 8. Jalankan sebagai: "Saya"
 * 9. Siapa yang memiliki akses: "Siapa saja" (Anyone)
 * 10. Klik "Terapkan"
 * 11. Otorisasi akses jika diminta (Lanjutkan > Buka project (tidak aman) > Izinkan)
 * 12. Salin URL Web App yang dihasilkan dan gunakan di aplikasi web Anda.
 */

const SHEET_NAME = "Sheet1"; // Sesuaikan dengan nama sheet Anda jika berbeda

function doPost(e) {
  try {
    // Buka spreadsheet yang sedang aktif
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // Parse data JSON yang dikirim dari aplikasi web
    const data = JSON.parse(e.postData.contents);
    
    // Struktur kolom: Tanggal, Uraian, Pemasukan, Pengeluaran
    const rowData = [
      data.tanggal,
      data.uraian,
      data.pemasukan || 0,
      data.pengeluaran || 0
    ];
    
    // Tambahkan baris baru ke sheet
    sheet.appendRow(rowData);
    
    // Format kolom tanggal dan angka
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat("dd/MM/yyyy");
    sheet.getRange(lastRow, 3, 1, 2).setNumberFormat('_(Rp* #,##0_);_(Rp* (#,##0);_(Rp* "-"_);_(@_)');
    
    // Kembalikan response sukses
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Kembalikan response error jika terjadi kesalahan
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk menangani preflight request (CORS)
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
