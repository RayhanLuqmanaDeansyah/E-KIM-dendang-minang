16 Testing Strategy

1. Unit Testing (Jest)

Fokus pada CardGenerator. Harus lulus tes:

Expect card.flat().filter(Boolean).length === 30.

Expect setiap kolom mematuhi rentang angkanya.

Expect setiap baris memiliki tepat 5 non-null values.

2. Integration Testing (Supertest)

Menguji API /api/claim dengan skenario kartu belum KIM namun diclaim (Expect 400 & isTorn=true jika fase putih).

Menguji API /api/claim dengan skenario sah (Expect 200 & Room State berpindah ke warna baru).

3. Load Testing (Artillery)

Simulasi 10,000 koneksi WebSocket bersamaan yang menerima NUMBER_DRAWN untuk menguji skalabilitas Node.js.