/**
 * questions.js
 * Data soal pilihan ganda untuk ujian Komputasi Pervasif.
 * Setiap objek soal memiliki:
 *   - text    : teks pertanyaan
 *   - options : array 4 pilihan jawaban (string)
 *   - answer  : index jawaban yang benar (0-based)
 */

const QUESTIONS = [
  {
    text: "Apa yang dimaksud dengan 'Pervasive Computing' (Komputasi Pervasif)?",
    options: [
      "Komputasi yang hanya terjadi di pusat data besar",
      "Komputasi yang menyebar ke lingkungan sehari-hari dan berinteraksi dengan pengguna secara transparan",
      "Komputasi berbasis kartu punch yang digunakan pada era 1970-an",
      "Sistem komputasi yang memerlukan input manual pengguna setiap saat"
    ],
    answer: 1
  },
  {
    text: "Web API manakah yang digunakan untuk mendeteksi apakah tab browser sedang aktif atau tersembunyi?",
    options: [
      "Geolocation API",
      "WebSocket API",
      "Page Visibility API (document.hidden / visibilitychange)",
      "Service Worker API"
    ],
    answer: 2
  },
  {
    text: "Dalam konteks IoT (Internet of Things), apa peran utama 'sensor' dalam ekosistem pervasive computing?",
    options: [
      "Menampilkan data kepada pengguna melalui layar",
      "Mengumpulkan data dari lingkungan fisik untuk diproses oleh sistem",
      "Menyimpan data secara permanen di cloud",
      "Mengelola koneksi jaringan antar perangkat"
    ],
    answer: 1
  },
  {
    text: "Konsep 'Context-Aware Computing' berarti sistem mampu…",
    options: [
      "Bekerja tanpa koneksi internet sama sekali",
      "Memproses data lebih cepat dari komputer konvensional",
      "Menyesuaikan perilaku berdasarkan informasi konteks pengguna seperti lokasi, waktu, dan aktivitas",
      "Mengenkripsi semua data secara otomatis"
    ],
    answer: 2
  },
  {
    text: "Kombinasi event JavaScript manakah yang paling tepat untuk mendeteksi ketidakaktifan (idle) pengguna?",
    options: [
      "onclick dan onscroll saja",
      "mousemove, keypress, touchstart, scroll — lalu reset countdown timer setiap kali event terjadi",
      "onload dan onbeforeunload saja",
      "resize dan orientationchange saja"
    ],
    answer: 1
  }
];
