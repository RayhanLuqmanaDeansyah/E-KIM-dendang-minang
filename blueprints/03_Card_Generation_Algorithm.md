03 Card Generation Algorithm

1. Objektif

Menghasilkan matriks 9x6 (grid) yang mematuhi aturan tradisional KIM secara mutlak. Proses terjadi 100% di server.

2. Seeded Randomization (Auditability)

Generator menggunakan PRNG berbasis seed (misal: seedrandom library). Seed digenerate berdasarkan roomId + userId untuk memungkinkan rekontruksi kartu saat fitur Replay atau Audit dipicu.

3. Algoritma Generasi (Pseudocode)

function generateKIMCard(seed) {
  const rng = seedrandom(seed);
  let card = Array(6).fill().map(() => Array(9).fill(null));
  
  // Tahap 1: Inisialisasi struktur baris (pastikan tiap baris punya tepat 5 slot)
  const rowSlotCounts = [5, 5, 5, 5, 5, 5]; // Total 30 slot
  
  // Tahap 2: Distribusikan 30 slot ke dalam 9 kolom
  // Tiap kolom butuh minimal 1 angka, maksimal 3 angka (biasanya)
  let colSlotCounts = [1, 1, 1, 1, 1, 1, 1, 1, 1]; // 9 terisi
  let remainingSlots = 21; // 30 - 9
  
  while(remainingSlots > 0) {
    let randomCol = Math.floor(rng() * 9);
    // Batasi maks 3 angka per kolom untuk distribusi yang seimbang
    if(colSlotCounts[randomCol] < 3) {
      colSlotCounts[randomCol]++;
      remainingSlots--;
    }
  }

  // Tahap 3: Populate angka sesuai rentang per kolom
  const ranges = [[1,9], [10,19], [20,29], [30,39], [40,49], [50,59], [60,69], [70,79], [80,90]];
  const colNumbers = [];
  for(let c=0; c<9; c++) {
    let nums = generateUniqueRandoms(rng, ranges[c][0], ranges[c][1], colSlotCounts[c]);
    colNumbers.push(nums.sort((a,b) => a - b));
  }

  // Tahap 4: Tempatkan angka ke dalam grid (9x6)
  // Logic untuk mapping colNumbers ke matrix 6x9 sedemikian rupa sehingga 
  // tiap baris tepat memiliki 5 angka. (Backtracking algorithm digunakan di sini).
  
  return runBacktrackingToFillGrid(card, colNumbers, rowSlotCounts, rng);
}


4. Complexity & Optimization

Karena algoritma membutuhkan Backtracking, fungsi ini harus di-cache di Redis setelah dibuat agar tidak membebani CPU saat ratusan pemain masuk room secara bersamaan.