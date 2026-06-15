/**
 * ui.js
 * Bertanggung jawab atas semua manipulasi DOM:
 * - Tampilkan/sembunyikan halaman (Start, Exam, Result)
 * - Render soal dan pilihan jawaban
 * - Render peta soal (question map)
 * - Render log aktivitas
 * - Update status pill di topbar
 * - Tampilkan / sembunyikan overlay
 * - Render halaman hasil
 */

const UI = (() => {

  // ── Navigasi Halaman ────────────────────────────────────────────────────
  function showPage(pageId) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    const target = document.getElementById("page-" + pageId);
    if (target) target.classList.add("active");
  }

  // ── Render Soal ────────────────────────────────────────────────────────
  const OPTION_KEYS = ["A", "B", "C", "D"];

  function renderQuestion() {
    const idx = AppState.currentQuestion;
    const q = QUESTIONS[idx];

    document.getElementById("q-label").textContent =
      `Soal ${idx + 1} dari ${QUESTIONS.length}`;
    document.getElementById("q-text").textContent = q.text;
    document.getElementById("q-counter").textContent =
      `${idx + 1} / ${QUESTIONS.length}`;

    const container = document.getElementById("options-container");
    container.innerHTML = "";

    q.options.forEach((optText, i) => {
      const isSelected = AppState.answers[idx] === i;

      const div = document.createElement("div");
      div.className = "option" + (isSelected ? " selected" : "");
      div.setAttribute("role", "button");
      div.setAttribute("tabindex", "0");
      div.setAttribute("aria-pressed", isSelected ? "true" : "false");

      div.innerHTML = `
        <div class="opt-key">${OPTION_KEYS[i]}</div>
        <span class="opt-text">${optText}</span>
      `;

      div.addEventListener("click", () => ExamController.selectAnswer(i));
      div.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") ExamController.selectAnswer(i);
      });

      container.appendChild(div);
    });

    renderQuestionMap();
    updateLiveStats();
  }

  // ── Peta Soal (sidebar) ────────────────────────────────────────────────
  function renderQuestionMap() {
    const map = document.getElementById("q-map");
    if (!map) return;
    map.innerHTML = "";

    QUESTIONS.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.className =
        "qmap-btn" +
        (AppState.answers[i] !== null ? " answered" : "") +
        (i === AppState.currentQuestion ? " current" : "");
      btn.textContent = i + 1;
      btn.setAttribute("aria-label", `Soal ${i + 1}`);
      btn.addEventListener("click", () => ExamController.goToQuestion(i));
      map.appendChild(btn);
    });
  }

  // ── Live Stats (sidebar) ───────────────────────────────────────────────
  function updateLiveStats() {
    const elTab = document.getElementById("stat-tab");
    const elAfk = document.getElementById("stat-afk");
    const elAns = document.getElementById("stat-ans");

    if (elTab) elTab.textContent = AppState.tabSwitchCount + "×";
    if (elAfk) elAfk.textContent = AppState.afkTotalSeconds + " dtk";
    if (elAns)
      elAns.textContent = `${AppState.countAnswered()} / ${QUESTIONS.length}`;
  }

  // ── Log Aktivitas (sidebar) ────────────────────────────────────────────
  function renderActivityLog() {
    const list = document.getElementById("log-list");
    if (!list) return;

    // Tampilkan log terbaru di atas
    list.innerHTML = [...AppState.logs]
      .reverse()
      .map(
        (entry) =>
          `<div class="log-entry log-${entry.type}">
            <span class="log-time">${entry.time}</span>
            <span class="log-msg">${entry.message}</span>
          </div>`
      )
      .join("");
  }

  // ── Status Pill (topbar) ───────────────────────────────────────────────
  /**
   * @param {"tab"|"afk"} which  - pill mana yang diupdate
   * @param {"active"|"away"|"afk"} status
   */
  function updateStatusPill(which, status) {
    const dot = document.getElementById(`dot-${which}`);
    const label = document.getElementById(`lbl-${which}`);
    if (!dot || !label) return;

    dot.className = "dot";
    if (which === "tab") {
      if (status === "active") {
        dot.classList.add("green");
        label.textContent = "Tab Aktif";
      } else {
        dot.classList.add("red");
        label.textContent = "Tab Tidak Aktif";
      }
    } else {
      if (status === "active") {
        dot.classList.add("green");
        label.textContent = "Hadir";
      } else {
        dot.classList.add("yellow");
        label.textContent = "AFK";
      }
    }
  }

  // ── AFK Badge pada timer ───────────────────────────────────────────────
  function showAfkBadge(visible) {
    const badge = document.getElementById("afk-badge");
    if (badge) badge.classList.toggle("visible", visible);
  }

  // ── Overlay ────────────────────────────────────────────────────────────
  function showOverlay(id) {
    const el = document.getElementById("overlay-" + id);
    if (el) el.classList.add("show");
  }

  function hideOverlay(id) {
    const el = document.getElementById("overlay-" + id);
    if (el) el.classList.remove("show");
  }

  /** Perbarui pesan peringatan pindah tab. */
  function updateTabWarningMessage(count, max) {
    const el = document.getElementById("tab-warning-count");
    if (el) el.textContent = count;
    const elMax = document.getElementById("tab-warning-max");
    if (elMax) elMax.textContent = max;
  }

  // ── Halaman Topbar ──────────────────────────────────────────────────────
  function showTopbar(visible) {
    const bar = document.getElementById("status-bar");
    if (bar) bar.style.display = visible ? "flex" : "none";
  }

  // ── Halaman Hasil ──────────────────────────────────────────────────────
  function renderResult() {
    const { correct, total, score } = AppState.calculateScore();

    // Salam
    document.getElementById("res-heading").textContent =
      `Hasil Ujian — ${AppState.nama} (${AppState.nim})`;

    // Skor
    document.getElementById("res-score").textContent = score;
    document.getElementById("res-correct").textContent = `${correct} / ${total}`;
    document.getElementById("res-tab").textContent = AppState.tabSwitchCount + "×";
    document.getElementById("res-afk").textContent =
      AppState.afkTotalSeconds + " detik";

    // Warna ring sesuai nilai
    const ring = document.getElementById("score-ring");
    ring.className = "score-ring";
    if (score >= 80) ring.classList.add("pass");
    else if (score >= 60) ring.classList.add("average");
    else ring.classList.add("fail");

    // Log perilaku naratif
    const tabMsg =
      AppState.tabSwitchCount === 0
        ? "Tidak ada perpindahan tab selama ujian."
        : `Berpindah tab sebanyak <strong>${AppState.tabSwitchCount} kali</strong>` +
          (AppState.isLocked ? " — ujian dikunci otomatis." : ".");

    const afkMsg =
      AppState.afkTotalSeconds === 0
        ? "Tidak ada periode AFK tercatat."
        : `Total waktu AFK: <strong>${AppState.afkTotalSeconds} detik</strong>.`;

    const logEntries = AppState.logs
      .map(
        (e) =>
          `<div class="res-log-entry res-log-${e.type}">` +
          `<span class="res-log-time">[${e.time}]</span> ${e.message}</div>`
      )
      .join("");

    document.getElementById("behavior-summary").innerHTML =
      `<p>${tabMsg}</p><p>${afkMsg}</p>`;
    document.getElementById("behavior-log").innerHTML = logEntries;
  }

  // ── Ekspor ──────────────────────────────────────────────────────────────
  return {
    showPage,
    renderQuestion,
    renderQuestionMap,
    updateLiveStats,
    renderActivityLog,
    updateStatusPill,
    showAfkBadge,
    showOverlay,
    hideOverlay,
    updateTabWarningMessage,
    showTopbar,
    renderResult,
  };
})();
