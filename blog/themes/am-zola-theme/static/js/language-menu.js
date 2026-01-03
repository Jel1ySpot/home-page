document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.querySelector("[data-language-switcher]");
  if (!switcher) return;

  const trigger = switcher.querySelector(".language-trigger");
  const menu = switcher.querySelector(".language-menu");
  if (!trigger || !menu) return;

  const closeMenu = () => {
    switcher.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    const isOpen = switcher.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    toggleMenu();
  });

  document.addEventListener("click", (event) => {
    if (!switcher.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
});
