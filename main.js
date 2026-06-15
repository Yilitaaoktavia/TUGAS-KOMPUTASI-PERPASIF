/**
 * main.js
 * ExamController — pengontrol utama alur aplikasi ujian.
 *
 * Fungsi publik:
 *   startExam()          — validasi form lalu mulai ujian
 *   selectAnswer(idx)    — simpan jawaban pengguna
 *   goToQuestion(idx)    — pindah ke soal tertentu
 *   prevQuestion()       — soal sebelumnya
 *   nextQuestion()       — soal berikutnya
 *   confirmSubmit()      — konfirmasi sebelum kumpul
 *   forceSubmit()        — kumpul tanpa konfirmasi (timeout/terkunci)
 *   resetExam()          — kembali ke halaman awal
 */

const ExamController = (() => {

  // ── Start ────────────────────────────────────────────────────────────────
  function startExam() {
    const nama = document.getElementById("inp-nama").value.trim();
    const nim  = document.getElementById("inp-nim").value.trim();

    if (!nama) {
      alert("Nama lengkap harus diisi.");
      document.getElementById("inp-nama").focus();
      return;
    }
    if (!nim) {
      alert("NIM / ID peserta harus diisi.");
      document.getElementById("inp-nim").focus();
      return;
    }

    // Reset & isi state awal
    AppState.reset();
    AppState.nama = nama;
    AppState.nim  = nim;
    AppState.addLog(`Ujian dimulai oleh ${nama} (${nim}).`);

    // Tampilkan halaman ujian dan topbar
    UI.showTopbar(true);
    UI.updateStatusPill("tab", "active");
    UI.updateStatusPill("afk", "active");
    UI.showPage("exam");
    UI.renderQuestion();
    UI.renderActivityLog();

    // Mulai timer dan fitur pervasif
    Timer.start();
    Pervasive.start();
  }

  // ── Jawab Soal ───────────────────────────────────────────────────────────
  function selectAnswer(optionIndex) {
    AppState.answers[AppState.currentQuestion] = optionIndex;
    AppState.addLog(
      `Soal ${AppState.currentQuestion + 1}: memilih opsi ${["A","B","C","D"][optionIndex]}.`
    );
    UI.renderQuestion();
    UI.renderActivityLog();
  }

  // ── Navigasi ─────────────────────────────────────────────────────────────
  function goToQuestion(idx) {
    if (idx < 0 || idx >= QUESTIONS.length) return;
    AppState.currentQuestion = idx;
    UI.renderQuestion();
  }

  function prevQuestion() {
    goToQuestion(AppState.currentQuestion - 1);
  }

  function nextQuestion() {
    goToQuestion(AppState.currentQuestion + 1);
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  function confirmSubmit() {
    const unanswered = QUESTIONS.length - AppState.countAnswered();
    let msg = "Yakin ingin mengumpulkan ujian sekarang?";
    if (unanswered > 0) {
      msg = `Masih ada ${unanswered} soal yang belum dijawab.\n${msg}`;
    }
    if (window.confirm(msg)) {
      forceSubmit();
    }
  }

  function forceSubmit() {
    // Hentikan timer dan pervasive listener
    Timer.stop();
    Pervasive.stop();

    // Tutup semua overlay
    ["tab-warning", "afk-warning", "locked"].forEach((id) =>
      UI.hideOverlay(id)
    );

    // Jika masih dalam kondisi AFK saat dikumpulkan, catat durasi
    if (AppState.isAfk && AppState.afkStartTime) {
      const dur = Math.round((Date.now() - AppState.afkStartTime) / 1000);
      AppState.afkTotalSeconds += dur;
      AppState.afkStartTime = null;
      AppState.isAfk = false;
    }

    AppState.addLog("✅ Ujian dikumpulkan.");
    UI.showTopbar(false);
    UI.renderResult();
    UI.showPage("result");
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  function resetExam() {
    document.getElementById("inp-nama").value = "";
    document.getElementById("inp-nim").value = "";
    UI.showPage("start");
  }

  // ── Ekspor ───────────────────────────────────────────────────────────────
  return {
    startExam,
    selectAnswer,
    goToQuestion,
    prevQuestion,
    nextQuestion,
    confirmSubmit,
    forceSubmit,
    resetExam,
  };
})();
