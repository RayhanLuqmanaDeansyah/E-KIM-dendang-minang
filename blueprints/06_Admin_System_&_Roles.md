06 Admin System & Roles

1. Hierarki Hak Akses (Role-Based Access Control)

SUPER_ADMIN: Akses penuh (Billing, Management User, System Settings).

OPERATOR: Mengelola Room, memulai/menghentikan game, mengatur interval tarikan angka (misal: 10 detik/angka).

SINGER_ADMIN: Mode khusus dimana operator hanya memicu angka selanjutnya secara manual (untuk sinkronisasi event live/offline).

VALIDATOR: Menerima notifikasi klaim "KIM!" dari pemain, layar akan menampilkan kartu pemain secara besar untuk divalidasi visual (jika server-side validation di-bypass untuk event offline).

2. Turnamen Mode

Fitur untuk mengelompokkan beberapa GameRooms ke dalam satu Tournament.

Sistem poin kumulatif (Pemenang fase 1 dapat 10 poin, fase 5 dapat 50 poin).

3. PDF Export

Di akhir permainan, Admin dapat menekan tombol Ekspor Hasil (PDF).
Node.js (menggunakan puppeteer atau pdfkit) akan men-generate laporan berisi:

Detail Room & Waktu.

Daftar Pemenang tiap Fase (Pink s/d Putih).

Log urutan 90 angka yang keluar.