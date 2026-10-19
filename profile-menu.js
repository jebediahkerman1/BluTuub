// Independent controller for the profile drawer.
(function () {
  function initProfileDrawer() {
    const button = document.getElementById("profileButton");
    const menu = document.getElementById("profileMenu");
    if (!button || !menu || button.dataset.drawerReady === "true") return;
    button.dataset.drawerReady = "true";

    function setOpen(open) {
      menu.classList.toggle("hidden", !open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close profile menu" : "Open profile menu");
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(menu.classList.contains("hidden"));
    });
    menu.addEventListener("click", function (event) { event.stopPropagation(); });
    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfileDrawer);
  } else {
    initProfileDrawer();
  }
})();