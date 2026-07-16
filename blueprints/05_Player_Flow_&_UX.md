05 Player Flow & UX

1. Flowchart Eksekusi Pemain

graph TD
    A[Login / Register] --> B[Dashboard]
    B --> C[Cari/Join Room]
    C --> D{Koneksi Stabil?}
    D -- No --> E[Auto-Reconnect Polling]
    D -- Yes --> F[Room Waiting Area]
    F --> G[Game Started: Terima Kartu 9x6]
    G --> H[Dengarkan Pantun & Lihat Angka 3D]
    H --> I{Angka ada di Kartu?}
    I -- Yes --> J[Pemain Tap Kotak]
    J --> K{Cek Target Baris?}
    K -- Penuh --> L[Tap Tombol 'KIM!']
    L --> M[Server Validate]
    M -- Benar --> N[Menang Fase, Lanjut Warna Baru]
    M -- Salah & Fase Putih --> O[Kartu Sobek, Spectator Mode]
    K -- Belum --> H
    I -- No --> H


2. Interaksi UI

Daubing (Pencoretan): Pemain melakukan tap/klik pada kotak. Animasi cap bulat (daub) transparan warna merah/hitam muncul dengan animasi scale-in.

Coretan Salah: Pemain diizinkan mencoret angka yang salah (tidak keluar) secara UI, namun ini akan berakibat fatal jika ia mengklaim kemenangan. (Meningkatkan kehati-hatian).