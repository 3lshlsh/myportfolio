export function initEnhancedMotion() {
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("isVisible");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -6% 0px", threshold: 0.07 },
  );
  function observe() {
    document
      .querySelectorAll(
        ".sectionHead, .archiveRow, .case, .videoCard, .prehistory",
      )
      .forEach((el, i) => {
        if (el.dataset.observedMotion) return;
        el.dataset.observedMotion = "1";
        el.classList.add(
          el.matches(".case,.videoCard") ? "staggerItem" : "revealLift",
        );
        el.style.transitionDelay = el.matches(".case,.videoCard")
          ? (i % 4) * 75 + "ms"
          : "0ms";
        io.observe(el);
      });
  }
  observe();
  const m = new MutationObserver(() => observe());
  ["caseGrid", "videoGrid"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) m.observe(el, { childList: true });
  });
}
