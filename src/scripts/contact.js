let contactReturnFocus = null;
function openContactDialog() {
  const modal = document.getElementById("contactModal");
  contactReturnFocus = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("contact-locked");
  modal.querySelector("[data-contact-close].contactX").focus();
}
function closeContactDialog() {
  const modal = document.getElementById("contactModal");
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("contact-locked");
  if (contactReturnFocus && typeof contactReturnFocus.focus === "function")
    contactReturnFocus.focus();
}
export function initContactDialog() {

  document
    .querySelectorAll(".contactOpen")
    .forEach((el) => el.addEventListener("click", openContactDialog));
  document
    .querySelectorAll("[data-contact-close]")
    .forEach((el) => el.addEventListener("click", closeContactDialog));
  document.getElementById("contactModal").addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeContactDialog();
    }
    if (e.key === "Tab") {
      const nodes = [
        ...e.currentTarget.querySelectorAll(".contactX,.contactChoice"),
      ];
      const a = nodes[0],
        b = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    }
  });
}
