/**
 * pervasive.js
 * Implementasi dua fitur Pervasive Computing:
 *
 * 1. Tab Visibility Monitor  — menggunakan Page Visibility API
 *    (document.visibilitychange + document.hidden)
 *
 * 2. Idle / AFK Detector     — menggunakan event mousemove, keydown,
 *    touchstart, scroll, dan click. Jika tidak ada aktivitas selama
 *    AFK_THRESHOLD_SECONDS detik, pengguna dianggap AFK.
 */

const Pervasive = (() => {
  // ── Konstanta ───────────────────────────────────────────────────────────
  const AFK_THRESHOLD_SECONDS = 20; // detik tidak aktif sebelum dianggap AFK
  const MAX_TAB_SWITCHES = 3;       // batas maksimal pindah tab sebelum dikunci

  // Event yang digunakan untuk mendeteksi aktivitas pengguna
  const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "keypress",
    "touchstart",
    "scroll",
    "click",
  ];

  // ── Handler: Tab Visibility ─────────────────────────────────────────────
  function handleVisibilityChange() {
    // Abaikan jika ujian sudah dikunci
    if (AppState.isLocked) return;

    if (document.hidden) {
      // Pengguna meninggalkan tab ujian
      AppState.tabSwitchCount++;
      AppState.isPaused = true;
      AppState.addLog(
        `⚠️ Pindah tab terdeteksi (ke-${AppState.tabSwitchCount})`,
        "warn"
      );

      UI.updateStatusPill("tab", "away");
      UI.updateLiveStats();

      if (AppState.tabSwitchCount >= MAX_TAB_SWITCHES) {
        // Batas tercapai → kunci ujian
        AppState.isLocked = true;
        AppState.addLog(
          "🔒 Ujian dikunci otomatis: batas perpindahan tab (3×) tercapai.",
          "danger"
        );
        UI.showOverlay("locked");
      } else {
        UI.showOverlay("tab-warning");
        UI.updateTabWarningMessage(AppState.tabSwitchCount, MAX_TAB_SWITCHES);
      }
    }
    // Tidak perlu else: pemulihan tab ditangani oleh tombol "Kembali ke Ujian"
  }

  // ── Handler: Resume dari Tab Warning ───────────────────────────────────
  function resumeFromTabWarning() {
    if (AppState.isLocked) return;
    AppState.isPaused = false;
    UI.hideOverlay("tab-warning");
    UI.updateStatusPill("tab", "active");
    AppState.addLog("▶ Kembali ke tab ujian.");
    UI.renderActivityLog();
  }

  // ── Handler: AFK ───────────────────────────────────────────────────────
  function triggerAfk() {
    if (AppState.isLocked || AppState.isAfk) return;

    AppState.isAfk = true;
    AppState.isPaused = true;
    AppState.afkStartTime = Date.now();

    AppState.addLog(
      `💤 Pengguna tidak aktif selama ${AFK_THRESHOLD_SECONDS} detik — timer dijeda.`,
      "warn"
    );

    UI.updateStatusPill("afk", "afk");
    UI.showAfkBadge(true);
    UI.showOverlay("afk-warning");
    UI.updateLiveStats();
    UI.renderActivityLog();
  }

  /** Reset (restart) countdown AFK. Dipanggil setiap kali ada aktivitas. */
  function resetAfkTimer() {
    // Jika sebelumnya AFK, catat durasi dan pulihkan
    if (AppState.isAfk) {
      const duration = Math.round((Date.now() - AppState.afkStartTime) / 1000);
      AppState.afkTotalSeconds += duration;
      AppState.afkStartTime = null;
      AppState.isAfk = false;

      // Hanya pulihkan pause jika bukan karena pindah tab
      if (!document.hidden && !AppState.isLocked) {
        AppState.isPaused = false;
      }

      UI.hideOverlay("afk-warning");
      UI.showAfkBadge(false);
      UI.updateStatusPill("afk", "active");
      AppState.addLog(`▶ Aktif kembali setelah AFK ${duration} detik.`);
      UI.updateLiveStats();
      UI.renderActivityLog();
    }

    // Bersihkan timer lama dan buat yang baru
    clearTimeout(AppState.afkTimerHandle);
    if (!AppState.isLocked) {
      AppState.afkTimerHandle = setTimeout(triggerAfk, AFK_THRESHOLD_SECONDS * 1000);
    }
  }

  /** Dipanggil oleh tombol "Saya Di Sini!" pada overlay AFK. */
  function resumeFromAfk() {
    resetAfkTimer(); // ini sudah menangani pemulihan
    UI.hideOverlay("afk-warning");
  }

  // ── Init & Destroy ──────────────────────────────────────────────────────
  function start() {
    // Pasang listener tab visibility
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Pasang listener aktivitas untuk AFK detection
    ACTIVITY_EVENTS.forEach((ev) =>
      document.addEventListener(ev, resetAfkTimer, { passive: true })
    );

    // Mulai countdown AFK pertama kali
    resetAfkTimer();
  }

  function stop() {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    ACTIVITY_EVENTS.forEach((ev) =>
      document.removeEventListener(ev, resetAfkTimer)
    );
    clearTimeout(AppState.afkTimerHandle);
    AppState.afkTimerHandle = null;
  }

  return {
    start,
    stop,
    resumeFromTabWarning,
    resumeFromAfk,
  };
})();
