19 AI Implementation Prompts (Master Execution Plan)

Ini adalah dokumen Master Execution Plan.
ATURAN MAIN:

Jangan jalankan prompt berikutnya sebelum prompt sebelumnya selesai dan kodenya berjalan tanpa error.

Jika ada error, minta AI memperbaikinya dulu di tahap tersebut.

Copy-paste blok teks di bawah tulisan "PROMPT" ke dalam kolom chat AI kamu (pastikan fitur baca file / @ aktif).

Tahap 1: Fondasi Backend & Database

Target: Setup struktur folder, Express.js, TypeScript, koneksi MongoDB, dan pembuatan 4 Model Data.

PROMPT:

Kamu adalah Senior Full-Stack Developer. Kita akan membangun aplikasi "Virtual KIM Minangkabau" bertahap.
BACA file @00-product-vision.md, @18-coding-standards.md, dan @09-database-schema.md.
TUGAS TAHAP 1:

Buat struktur folder monorepo: /web (untuk Next.js nanti) dan /server (untuk Node.js).

Masuk ke /server, inisialisasi Express.js dengan TypeScript. Setup tsconfig.json, package.json, dan koneksi Mongoose ke MongoDB.

Buat folder models/ dan buatkan 4 file schema secara presisi sesuai dengan @09-database-schema.md (User, Pantun, GameRoom, PlayerCard). Gunakan TypeScript Interface yang strict.
JANGAN buat frontend, API routes, atau socket dulu. Beri tahu saya jika sudah selesai dan berikan perintah terminal untuk menjalankan servernya.

Tahap 2: Algoritma Generator Kartu KIM

Target: Logika matematika murni untuk membuat matriks 9x6 di backend.

PROMPT:

BACA @02-kim-traditional-rules.md, @03-card-generation.md, dan @16-testing.md.
TUGAS TAHAP 2:

Di dalam folder /server, buat file utils/cardGenerator.ts.

Implementasikan algoritma seeded randomization untuk membuat matriks grid 9x6 sesuai aturan ketat di file 02 dan 03 (tepat 5 angka per baris, rentang angka per kolom yang benar, urutan ascending).

Buatkan unit test dasar menggunakan Jest (atau setup test runner sederhana) untuk memvalidasi bahwa matriks yang dihasilkan benar-benar valid sesuai aturan.
Fokus pada fungsi utilitas ini saja, pastikan algoritmanya efisien (tidak infinite loop).

Tahap 3: REST API & Keamanan (Klaim Pemenang)

Target: Endpoint API untuk validasi permainan dan manajemen pantun.

PROMPT:

BACA @10-api-specification.md, @11-security.md, dan @07-pantun-management.md.
TUGAS TAHAP 3:

Di dalam folder /server, buatkan REST API routes dan controllers.

Buat endpoint Auth sederhana (Login/Register) menghasilkan JWT.

Buat endpoint POST /api/card/claim yang sangat aman. Endpoint ini harus mengecek grid pemain di database melawan drawnNumbers di GameRoom. Terapkan logika hukuman isTorn jika klaim di ronde putih salah, sesuai aturan keamanan.

Buat script seeder (seed/pantun.ts) untuk memasukkan beberapa data dummy pantun 1-90 ke database.

Tahap 4: WebSocket & Manajemen Room

Target: Komunikasi realtime, pengundian angka, dan penanganan koneksi putus.

PROMPT:

BACA @04-room-system.md, @15-edge-cases.md, dan @01-game-rules.md.
TUGAS TAHAP 4:

Integrasikan Socket.io ke server Express.js kita.

Buat state machine untuk Room (Waiting, Playing, Finished).

Buat fungsi/cron interval yang menarik 1 angka + 1 pantun acak setiap 10 detik dan mem-broadcastnya via Socket NUMBER_DRAWN.

Terapkan logika reconnect: jika klien disconnect lalu mengirim event JOIN_ROOM lagi dengan token valid, berikan state terakhir (auto-resume).

Tahap 5: Setup Frontend & Design System

Target: Inisialisasi Next.js dan Tailwind CSS dengan tema budaya Minang.

PROMPT:

Backend sudah stabil. Sekarang kita pindah ke folder /web.
BACA @12-ui-ux-guidelines.md dan @13-design-system.md.
TUGAS TAHAP 5:

Inisialisasi project Next.js (App Router) dengan Tailwind CSS.

Konfigurasi tailwind.config.js untuk memasukkan color palette kertas KIM (Pink, Kuning, Biru, Hijau, Putih) dan warna aksen Merah Minang.

Buat layout utama dan komponen Navbar yang responsive.

Buat komponen KimCard (Grid 9x6) yang statis dulu. Pastikan aspect rationya bagus di mobile portrait.

Tahap 6: Gameplay UI & Sinkronisasi Realtime

Target: Pemain bisa login, masuk room, dan mencoret kartu.

PROMPT:

BACA @05-player-flow.md dan @14-business-rules.md.
TUGAS TAHAP 6:

Koneksikan Next.js ke backend Socket.io.

Buat halaman /play/[roomId]. Saat komponen load, fetch kartu pemain dari API dan tampilkan di komponen KimCard.

Tambahkan fungsi "Daub" (pencoretan): saat kotak diklik, munculkan tanda silang/bulat (simpan state-nya di client dulu).

Dengarkan event Socket NUMBER_DRAWN untuk mengupdate riwayat angka di layar.

Buat tombol "KIM!" raksasa yang men-trigger endpoint POST /api/card/claim dan handle UI jika response-nya berhasil atau gagal (animasi kertas robek).

Tahap 7: Animasi 3D & Audio (Tukang Dendang Virtual)

Target: Pengalaman budaya yang imersif.

PROMPT:

BACA @08-tts-system.md dan @12-ui-ux-guidelines.md.
TUGAS TAHAP 7:

Install three dan @react-three/fiber di frontend.

Buat komponen VirtualDendang3D. Render objek 3D sederhana (misal silinder untuk tabung dan disc untuk koin). Buat animasi koin melompat keluar saat menerima event NUMBER_DRAWN.

Implementasikan Web Speech API (Text-to-Speech). Baca currentPantun yang diterima dari backend. Pastikan ada queue system agar audio tidak bertabrakan.

Tambahkan tag HTML5 Audio untuk memutar instrumen musik latar.

Tahap 8: Sistem Admin & Turnamen

Target: Dashboard untuk mengontrol jalannya game.

PROMPT:

BACA @06-admin-system.md.
TUGAS TAHAP 8:

Buat halaman /admin/dashboard (lindungi dengan middleware khusus role Admin).

Buat UI untuk membuat Room baru, mengubah status Room (Start/Pause), dan mengatur interval waktu tarikan angka.

Tampilkan monitor realtime jumlah pemain yang bertahan.

(Opsional) Implementasikan fitur export PDF hasil permainan menggunakan library yang ringan di client-side atau backend.