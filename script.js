document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobile-toggle");
  const mobileMenuPane = document.getElementById("mobile-menu-pane");
  const mobileMenuOverlay = document.createElement("div");
  let menuIsOpen = false;

  mobileMenuOverlay.className = "mobile-menu-overlay";
  mobileMenuOverlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(mobileMenuOverlay);

  const closeMenu = () => {
    menuIsOpen = false;
    mobileMenuPane.classList.remove("is-open");
    mobileMenuOverlay.classList.remove("is-visible");
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.setAttribute("aria-label", "Open menu");
  };

  const openMenu = () => {
    menuIsOpen = true;
    mobileMenuPane.classList.add("is-open");
    mobileMenuOverlay.classList.add("is-visible");
    mobileToggle.setAttribute("aria-expanded", "true");
    mobileToggle.setAttribute("aria-label", "Close menu");
  };

  mobileToggle.addEventListener("click", () => {
    menuIsOpen ? closeMenu() : openMenu();
  });

  mobileMenuOverlay.addEventListener("click", closeMenu);

  mobileMenuPane.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuIsOpen) {
      closeMenu();
      mobileToggle.focus();
    }
  });
});
