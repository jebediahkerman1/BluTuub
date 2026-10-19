// Independent profile drawer controller: works even if the main app script has an error.
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

    menu.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    // Menu actions keep the drawer responsive even if the main app has not initialized.
    const settings = document.getElementById("editProfile");
    const switchAccount = document.getElementById("switchProfile");
    const login = document.getElementById("onlineAccountAction");
    if (settings) settings.addEventListener("click", function () {
      setOpen(false);
      const modal = document.getElementById("profileModal");
      const form = document.getElementById("profileForm");
      const list = document.getElementById("switchList");
      const title = document.getElementById("profileTitle");
      if (modal) modal.classList.remove("hidden");
      if (form) form.classList.remove("hidden");
      if (list) list.classList.add("hidden");
      if (title) title.textContent = "Edit your profile";
    });
    if (switchAccount) switchAccount.addEventListener("click", function () {
      setOpen(false);
      const modal = document.getElementById("profileModal");
      const form = document.getElementById("profileForm");
      const list = document.getElementById("switchList");
      const title = document.getElementById("profileTitle");
      if (modal) modal.classList.remove("hidden");
      if (form) form.classList.add("hidden");
      if (list) list.classList.remove("hidden");
      if (title) title.textContent = "Switch account";
    });
    if (login) login.addEventListener("click", function () {
      setOpen(false);
      const modal = document.getElementById("authModal");
      if (modal) modal.classList.remove("hidden");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfileDrawer);
  } else {
    initProfileDrawer();
  }
})();