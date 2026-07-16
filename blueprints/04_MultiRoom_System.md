04 Multi-Room System

1. Arsitektur Komunikasi

Menggunakan Socket.io (WebSockets) dengan fallback ke HTTP Long-Polling.

2. State Machine Room

stateDiagram-v2
    [*] --> LOBBY
    LOBBY --> WAITING : Player Joins
    WAITING --> PLAYING : Admin Starts
    PLAYING --> PAUSED : Admin Pauses/Disconnection
    PAUSED --> PLAYING : Admin Resumes
    PLAYING --> FINISHED : Phase 5 Claimed
    FINISHED --> [*]


3. Skenario Reconnect & Auto-Save

State game (drawnNumbers, currentColor, isTorn) disimpan di Redis (in-memory) dan secara asinkron di-sync ke MongoDB setiap 5 detik (Auto-Save).

Socket Disconnect: Jika internet pemain putus, Socket.io akan mendeteksi disconnect.

Reconnect Logic:

Pemain refresh halaman / internet kembali.

Client mengirimkan JWT ke /api/room/reconnect.

Server mengirimkan kembali State Room terakhir + Grid Kartu Pemain.

Client me-render ulang UI tanpa kehilangan coretan (karena coretan disinkronkan ke server secara batched).

4. Replay Permainan

Sistem merekam event dalam array events[] berisi timestamp.
Contoh: [{ time: 10:00:01, type: 'DRAW', value: 45 }, { time: 10:05:02, type: 'CLAIM', userId: 'xyz' }].
Ini memungkinkan game di- play back dari awal hingga akhir.