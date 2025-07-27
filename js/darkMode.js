// Theme management system
const ThemeManager = {
  // List of selectors to apply dark mode to
  darkModeSelectors: [
    "body",
    "h1",
    "h2",
    "h4",
    "nav.top-nav",
    "section#brands",
    ".question",
    "footer",
  ],

  // Initialize the theme system
  init() {
    this.themeContainer = document.querySelector(".theme");
    this.themeButtons = {
      light: this.themeContainer.querySelector(".theme-btn.light"),
      dark: this.themeContainer.querySelector(".theme-btn.dark"),
      auto: this.themeContainer.querySelector(".theme-btn.auto"),
    };

    this.setupEventListeners();
    this.loadTheme();
  },

  // Set up event listeners
  setupEventListeners() {
    // Theme container click handler
    this.themeContainer.addEventListener("click", () => this.cycleTheme());

    // System preference changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (this.currentTheme === "auto") {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });
  },

  // Cycle through themes
  cycleTheme() {
    const themes = ["light", "dark", "auto"];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  },

  // Load saved theme or use system preference
  loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    this.currentTheme = savedTheme || "auto"; // Default to auto if no preference saved

    // Apply the theme
    if (this.currentTheme === "auto") {
      this.applyTheme(systemPrefersDark ? "dark" : "light");
    } else {
      this.applyTheme(this.currentTheme);
    }

    this.updateThemeButtonVisibility(false); // No animation on initial load
  },

  // Set and save the theme
  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem("theme", theme);

    if (theme === "auto") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      this.applyTheme(systemPrefersDark ? "dark" : "light");
    } else {
      this.applyTheme(theme);
    }

    this.updateThemeButtonVisibility(true); // With animation
  },

  // Update which theme button is visible with optional animation
  updateThemeButtonVisibility(animate = true) {
    const buttons = Object.values(this.themeButtons);

    if (animate) {
      // Fade out all buttons first
      buttons.forEach((btn) => {
        btn.classList.add("hidden");
      });

      // After fade out completes, switch visibility and fade in the current button
      setTimeout(() => {
        // Hide all buttons
        buttons.forEach((btn) => {
          btn.style.display = "none";
        });

        // Show and fade in the current theme button
        if (this.themeButtons[this.currentTheme]) {
          this.themeButtons[this.currentTheme].style.display = "block";
          // Trigger reflow to ensure transition works
          void this.themeButtons[this.currentTheme].offsetWidth;
          this.themeButtons[this.currentTheme].classList.remove("hidden");
        }
      }, 300); // Match this timeout with CSS transition duration
    } else {
      // No animation - immediate change
      buttons.forEach((btn) => {
        btn.style.display = "none";
        btn.classList.remove("hidden");
      });

      if (this.themeButtons[this.currentTheme]) {
        this.themeButtons[this.currentTheme].style.display = "block";
      }
    }
  },

  // Apply the theme to the page
  applyTheme(theme) {
    const isDark = theme === "dark";

    // Apply to root element
    document.documentElement.setAttribute("data-dark", isDark);

    // Apply to all other elements
    this.darkModeSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.setAttribute("data-dark", isDark);
      });
    });

    // Update shape images
    this.updateShapeImages(isDark);

    // Update app image
    const appImage = document.querySelector(".first.fade-in-left.delay-1 img");
    if (appImage) {
      appImage.src = isDark
        ? appImage.src.replace("app.webp", "app-dark.webp")
        : appImage.src.replace("app-dark.webp", "app.webp");
    }
  },

  updateShapeImages(shouldApply) {
    const shapeImages = document.querySelectorAll('img[src*="Shape"]');

    shapeImages.forEach((img) => {
      const currentSrc = img.src;

      if (img.classList.contains("white-icon")) {
        // Handle white-icon special case
        if (shouldApply) {
          img.src = currentSrc.includes("Shape-light.webp")
            ? currentSrc.replace("Shape-light.webp", "Shape-primary.webp")
            : currentSrc;
        } else {
          img.src = currentSrc.includes("Shape-primary.webp")
            ? currentSrc.replace("Shape-primary.webp", "Shape-light.webp")
            : currentSrc;
        }
      } else {
        // Handle regular shape images
        if (shouldApply) {
          img.src = currentSrc.includes("Shape-light.webp")
            ? currentSrc.replace("Shape-light.webp", "Shape-dark.webp")
            : currentSrc;
        } else {
          img.src = currentSrc.includes("Shape-dark.webp")
            ? currentSrc.replace("Shape-dark.webp", "Shape-light.webp")
            : currentSrc;
        }
      }
    });
  },
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
});
