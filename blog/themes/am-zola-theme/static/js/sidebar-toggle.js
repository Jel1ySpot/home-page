document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-sidebar-toggle]");
  if (!toggle) return;

  const body = document.body;
  const mediaQuery = window.matchMedia("(max-width: 767px)");

  const isMobile = () => mediaQuery.matches;
  const updateState = () => {
    const isOpen = isMobile()
      ? body.classList.contains("sidebar-open")
      : !body.classList.contains("sidebar-collapsed");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  toggle.addEventListener("click", () => {
    if (isMobile()) {
      body.classList.toggle("sidebar-open");
    } else {
      body.classList.toggle("sidebar-collapsed");
    }
    updateState();
  });

  const handleResize = () => {
    if (isMobile()) {
      body.classList.remove("sidebar-collapsed");
    } else {
      body.classList.remove("sidebar-open");
    }
    updateState();
  };

  mediaQuery.addEventListener("change", handleResize);
  window.addEventListener("resize", handleResize);

  updateState();
});
