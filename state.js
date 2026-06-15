/**
 * state.js
 * Satu sumber kebenaran (single source of truth) untuk seluruh state aplikasi.
 * Semua modul lain membaca dan menulis via objek `AppState` ini.
 */

const AppState = {
  // Data peserta
  nama: "",
  nim: "",

  // Progress ujian
  currentQuestion: 0,                          // index soal aktif (0-based)
  answers: new Array(QUESTIONS.length).fill(null), // null = belum dijawab

  // Timer
  timeLeft: 5 * 60,   // sisa waktu dalam detik (5 menit)
  timerInterval: null, // referensi setInterval agar bisa dihentikan
  isPaused: false,     // true saat ujian dijeda (AFK atau pindah tab)

  // Deteksi tab
  tabSwitchCount: 0,   // berapa kali pengguna pindah tab
  isLocked: false,     // true jika ujian dikunci karena pelanggaran 3x

  // Deteksi AFK
  isAfk: false,        // true saat pengguna sedang AFK
  afkTimerHandle: null,// handle setTimeout untuk memicu status AFK
  afkStartTime: null,  // timestamp saat AFK dimulai (untuk hitung durasi)
  afkTotalSeconds: 0,  // akumulasi total detik AFK

  // Log perilaku
  logs: [],            // array of { time: string, message: string, type: "info"|"warn"|"danger" }

  /** Reset semua state ke nilai awal (dipanggil saat ujian baru dimulai). */
  reset() {
    this.nama = "";
    this.nim = "";
    this.currentQuestion = 0;
    this.answers = new Array(QUESTIONS.length).fill(null);
    this.timeLeft = 5 * 60;
    this.timerInterval = null;
    this.isPaused = false;
    this.tabSwitchCount = 0;
    this.isLocked = false;
    this.isAfk = false;
    this.afkTimerHandle = null;
    this.afkStartTime = null;
    this.afkTotalSeconds = 0;
    this.logs = [];
  },

  /** Tambah entri ke log perilaku. */
  addLog(message, type = "info") {
    const now = new Date();
    const time =
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");
    this.logs.push({ time, message, type });
  },

  /** Hitung jumlah jawaban yang sudah dipilih. */
  countAnswered() {
    return this.answers.filter((a) => a !== null).length;
  },

  /** Hitung skor (0–100). */
  calculateScore() {
    let correct = 0;
    this.answers.forEach((ans, i) => {
      if (ans === QUESTIONS[i].answer) correct++;
    });
    return {
      correct,
      total: QUESTIONS.length,
      score: Math.round((correct / QUESTIONS.length) * 100),
    };
  },
};
