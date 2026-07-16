12 UI/UX & Accessibility Guidelines

1. Estetika Visual (Kearifan Lokal)

Menggunakan motif Pucuak Rabuang atau Itiak Pulang Patang sebagai pattern background dengan opacity rendah (10%).

Tabung 3D dirender menyerupai tabung bambu tradisional Minang dengan ukiran.

2. Adaptabilitas Layar (Mobile)

Portrait: Grid 9x6 dikompres secara proporsional. Gunakan CSS aspect-ratio: 1/1 untuk tiap kotak agar tap area cukup untuk jari (> 44px).

Landscape: Layar terbagi dua (Kiri: Grid Kertas 60%, Kanan: Animasi 3D & Sejarah Angka 40%).

3. Accessibility (A11y)

Warna font (angka) harus berikan rasio kontras 4.5:1 terhadap 5 warna kertas (Pink, Kuning, Biru, Hijau, Putih).

Support Screen Reader (aria-label) pada setiap kotak nomor yang dibacakan sebagai: "Kolom 1, Angka 8, Belum dicoret".