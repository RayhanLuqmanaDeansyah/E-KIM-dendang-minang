14 Core Business Rules

1. Distribusi Hadiah (Prize Pool)

Jika permainan menggunakan saldo koin:

Total Kumpul (Entry Fee x Total Player) = 100%.

Potongan Sistem = 10%.

Sisa 90% dibagi:

Pink (1 Baris): 10%

Kuning (2 Baris): 15%

Biru (3 Baris): 20%

Hijau (4 Baris): 25%

Putih (5 Baris/KIM): 30%

2. Aturan Seri (Draw Claim)

Jika karena latency, dua pemain menekan "KIM" pada milidetik yang sama setelah angka terakhir keluar:

Server menggunakan Timestamp terekam.

Jika perbedaan < 50ms, hadiah dibagi rata (Split Pot) untuk menjamin keadilan.

3. Refund & Crash Policy

Jika server mati sebelum fase Hijau tercapai, saldo entry fee semua pemain di dalam room dikembalikan (Refund) secara otomatis melalui skrip rekonsiliasi saat server hidup kembali.