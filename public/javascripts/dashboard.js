document.addEventListener("DOMContentLoaded", function () {
  var drawer = document.querySelector(".command-drawer");
  var sidebarOverlay = document.querySelector(".sidebar-overlay");
  var trigger = document.querySelector(".hero__nav-trigger");
  var closeBtn = document.querySelector(".command-drawer__close");
  var profileBtn = document.querySelector(".hero__profile-trigger");
  var profileDropdown = document.querySelector(".profile-dropdown");
  var toggleDrawer = function (shouldOpen) {
    if (!drawer) return;
    if (shouldOpen) {
      drawer.classList.add("is-open");
      document.body.classList.add("drawer-open");
    } else {
      drawer.classList.remove("is-open");
      document.body.classList.remove("drawer-open");
    }
  };
  var toggleProfile = function (shouldOpen) {
    if (!profileBtn || !profileDropdown) return;
    if (shouldOpen) {
      profileDropdown.classList.add("is-visible");
      profileBtn.setAttribute("aria-expanded", "true");
    } else {
      profileDropdown.classList.remove("is-visible");
      profileBtn.setAttribute("aria-expanded", "false");
    }
  };
  var toggleSidebar = function (shouldOpen) {
    if (window.innerWidth >= 992 && typeof shouldOpen === "undefined") {
      document.body.classList.toggle("sidebar-collapsed");
      return;
    }
    var isOpen = document.body.classList.contains("sidebar-open");
    if (shouldOpen === undefined) {
      shouldOpen = !isOpen;
    }
    if (shouldOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  };

  if (trigger) {
    trigger.addEventListener("click", function () {
      toggleDrawer(true);
      toggleSidebar();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      toggleDrawer(false);
    });
  }
  if (drawer) {
    drawer.addEventListener("click", function (event) {
      if (event.target === drawer) {
        toggleDrawer(false);
      }
    });
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", function () {
      toggleSidebar(false);
    });
  }
  if (profileBtn) {
    profileBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen =
        profileDropdown && profileDropdown.classList.contains("is-visible");
      toggleProfile(!isOpen);
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (drawer && drawer.classList.contains("is-open")) {
        toggleDrawer(false);
      }
      if (profileDropdown && profileDropdown.classList.contains("is-visible")) {
        toggleProfile(false);
      }
    }
  });
  document.addEventListener("click", function (event) {
    if (
      profileDropdown &&
      profileDropdown.classList.contains("is-visible") &&
      !profileDropdown.contains(event.target) &&
      event.target !== profileBtn
    ) {
      toggleProfile(false);
    }
  });
});
