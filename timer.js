/**
 * timer.js
 * Mengelola countdown timer ujian.
 * - startTimer()  : mulai hitung mundur
 * - stopTimer()   : berhentikan interval
 * Membaca/menulis AppState.timeLeft dan AppState.isPaused.
 */

const Timer = (() => {
  /** Format detik menjadi "MM:SS". */
  function format(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  /** Perbarui tampilan elemen timer di DOM. */
  function updateDisplay() {
    const el = document.getElementById("timer-display");
    if (!el) return;
    el.textContent = format(AppState.timeLeft);

    // Ubah warna sesuai sisa waktu
    el.className = "timer-value";
    if (AppState.timeLeft <= 60) {
      el.classList.add("danger");
    } else if (AppState.timeLeft <= 120) {
      el.classList.add("warn");
    }
  }

  /** Mulai countdown. Jika sudah ada interval sebelumnya, hentikan dulu. */
  function start() {
    stop();
    updateDisplay();
    AppState.timerInterval = setInterval(() => {
      // Jika dijeda (AFK atau pindah tab), skip tick ini
      if (AppState.isPaused) return;

      AppState.timeLeft--;
      updateDisplay();

      if (AppState.timeLeft <= 0) {
        stop();
        AppState.addLog("⏰ Waktu habis! Ujian dikumpulkan otomatis.", "danger");
        // Trigger pengumpulan dari main.js
        ExamController.forceSubmit();
      }
    }, 1000);
  }

  /** Hentikan interval timer. */
  function stop() {
    if (AppState.timerInterval) {
      clearInterval(AppState.timerInterval);
      AppState.timerInterval = null;
    }
  }

  return { start, stop, format };
})();
