08 Text-to-Speech (TTS) & Audio Queue

1. Arsitektur TTS

Menggunakan Web Speech API (Browser-based) untuk mengurangi server cost, atau Google Cloud TTS API / OpenAI TTS jika menginginkan suara berkualitas tinggi dengan logat Melayu/Minang.

2. Manajemen Antrean (Queue System)

Agar audio tidak bertabrakan saat interval tarikan cepat (misal 5 detik/angka):

Frontend memiliki State audioQueue: [].

Saat event Socket NEW_NUMBER masuk, masukkan payload (pantun) ke queue.

Sebuah useEffect / Worker akan mengeksekusi audioQueue[0].

Jika audio selesai (event onend), hapus indeks 0, jalankan berikutnya.

3. Sinkronisasi Animasi Tabung

Musik Gamaik (background) dimainkan via tag <audio loop>.

Saat TTS berbicara: Musik Gamaik di- ducking (volume diturunkan dari 1.0 ke 0.2).

Animasi 3D Tabung Bambu di- trigger 2 detik sebelum TTS menyebut angka, mensimulasikan pengocokan.