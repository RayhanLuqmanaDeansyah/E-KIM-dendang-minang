15 Edge Cases & Latency Handling

1. Network Jitter (Putus Nyambung)

Gejala: Klien telat menerima angka 45, menekan "KIM" untuk angka sebelumnya, namun di server sudah tertarik angka 46.

Handling: Klien mengirimkan lastKnownNumber saat klaim. Server menyesuaikan validasi.

2. TTS Terputus / Audio Engine Gagal

Gejala: Web Speech API di mobile browser mati jika tidak berinteraksi.

Handling: Ada tombol fallback "Aktifkan Audio". UI Teks Pantun dan riwayat angka tetap berjalan tanpa hambatan sebagai fallback utama.

3. Kertas Kosong akibat RNG Collison

Algoritma 03-card-generation.md bisa terjebak di infinite loop saat backtracking gagal.

Handling: Pasang batas max_iterations=1000. Jika gagal, re-seed dan ulangi proses pembuatan di server.