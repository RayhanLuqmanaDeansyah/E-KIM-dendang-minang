07 Pantun Management System

1. Konsep Database Relasional

Setiap angka (1-90) memiliki referensi ke koleksi Pantuns. Relasi ini diatur secara one-to-many.

2. Struktur Data Pantun

{
  "_id": "ObjectId",
  "numberTarget": 45,
  "text": "Pai ka pasa mambali ragi, singgah sabanta di kadai nasi. Angka kalua indak disangko lagi, iko inyo ampek puluah limo!",
  "language": "min",
  "category": "humor",
  "usageCount": 120
}


3. Algoritma Randomisasi (Tukang Dendang AI)

Event DRAW dipicu (angka yang keluar: 45).

Server query: db.pantuns.find({ numberTarget: 45 }). (Mendapat array misal 50 pantun).

Server memilih satu pantun secara acak.

Server memperbarui usageCount + 1 (untuk statistik pantun favorit).

Teks pantun dikirimkan via Socket ke semua klien beserta angkanya.

Frontend meneruskan teks tersebut ke sistem TTS (Document 08).