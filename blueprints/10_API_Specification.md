10 API Specification (REST & WebSocket)

1. WebSocket Events (Socket.io)

Server to Client:

ROOM_STATE_UPDATE: Mengirim state terbaru (Waktu tunggu, warna aktif).

NUMBER_DRAWN: Payload { number: 45, pantun: "..." }.

WINNER_ANNOUNCED: Payload { userId, color, newColor }.

CARD_TORN_BROADCAST: Menyiarkan ke room ada pemain yang salah tebak dan disobek kartunya.

Client to Server:

JOIN_ROOM: Payload { roomId, token }.

SYNC_DAUB: Payload { number, isDaubed } (Disimpan ke Redis untuk auto-save coretan pemain, tidak digunakan untuk validasi kemenangan).

2. REST Endpoints

POST /api/v1/game/claim

Auth: Bearer Token

Body: { roomId }

Response 200: { valid: true, message: "KIM!" }

Response 400: { valid: false, message: "Invalid claim. Card torn." }