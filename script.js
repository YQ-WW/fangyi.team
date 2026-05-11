// ── 在一起天数计算 ──────────────────────────────────────
// 修改这里的纪念日日期（YYYY, MM-1, DD）
const ANNIVERSARY = new Date(2023, 4, 12); // 2023-05-12，月份从0起

function updateDayCount() {
  const el = document.getElementById("dayCount");
  if (!el) return;
  const today = new Date();
  const diff = Math.floor((today - ANNIVERSARY) / (1000 * 60 * 60 * 24));
  el.textContent = diff > 0 ? diff : "...";
}
updateDayCount();

// ── 主逻辑 ───────────────────────────────────────────────
const scroller = document.querySelector(".snap");
const screens  = [...document.querySelectorAll(".screen")];
const letterScreen = document.getElementById("letter");

function updateDots(activeIndex) {
  document.body.dataset.activeScreen = String(activeIndex);
}

// ── IntersectionObserver ─────────────────────────────────
// 普通屏：58% 可见时激活
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-active", entry.isIntersecting);
      if (entry.isIntersecting) {
        updateDots(screens.indexOf(entry.target));
        // 离开首屏后移除滚动提示
        if (screens.indexOf(entry.target) > 0) {
          const hint = document.querySelector(".scroll-hint");
          if (hint) hint.style.opacity = "0";
        }
      }
    });
  },
  { root: scroller, threshold: 0.58 }
);

// 信件屏：高度超出视口，用低阈值激活
const letterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-active", entry.isIntersecting);
      if (entry.isIntersecting) {
        updateDots(screens.indexOf(entry.target));
      }
    });
  },
  { root: scroller, threshold: 0.08 }
);

screens.forEach((screen) => {
  if (screen === letterScreen) {
    letterObserver.observe(screen);
  } else {
    observer.observe(screen);
  }
});

// 初始状态
updateDots(0);

// ── 跳转函数 ─────────────────────────────────────────────
function scrollToScreen(index) {
  const next = screens[index];
  if (!next) return;
  next.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Hash 跳转 ────────────────────────────────────────────
function scrollToHash() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  const jump    = () => scroller.scrollTo({ top: target.offsetTop, behavior: "auto" });
  const jumpNow = () => scroller.scrollTo({ top: target.offsetTop, behavior: "instant" });
  requestAnimationFrame(jumpNow);
  window.setTimeout(jump, 80);
}

scrollToHash();
window.addEventListener("hashchange", scrollToHash);

// ── 点击前进 ─────────────────────────────────────────────
screens.forEach((screen, index) => {
  screen.addEventListener("click", (event) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) return;
    if (event.target.closest("a, button, input, textarea")) return;
    scrollToScreen(Math.min(index + 1, screens.length - 1));
  });
});

// ── 键盘导航 ─────────────────────────────────────────────
window.addEventListener("keydown", (event) => {
  const current = screens.findIndex((s) => s.classList.contains("is-active"));
  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    scrollToScreen(Math.min(current + 1, screens.length - 1));
  }
  if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    scrollToScreen(Math.max(current - 1, 0));
  }
});
