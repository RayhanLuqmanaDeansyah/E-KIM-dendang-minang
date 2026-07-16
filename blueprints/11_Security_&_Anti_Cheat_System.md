11 Security & Anti-Cheat System

1. Mencegah Manipulasi HTML

Semua grid di-render secara dinamis. Jika pemain mengedit DOM via Inspect Element untuk mengubah angka di kotak, ini tidak akan berdampak.

Tombol "KIM!" hanya mengirim roomId.

Server-Side Validation: Server mengecek tabel PlayerCards asli milik user di database dan membandingkannya dengan array drawnNumbers di database.

Server TIDAK PERNAH menerima array angka dari client untuk divalidasi.

2. Seed Visibility

Variabel Seed yang digunakan di generateKIMCard() HANYA diketahui oleh server.

Klien hanya menerima array 2D statis.

3. Rate Limiting

Endpoint /api/v1/game/claim dilimit: 1 request per 5 detik per IP/User untuk menghindari Spam Claim.