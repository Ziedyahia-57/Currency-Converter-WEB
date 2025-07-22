// List of selectors to apply dark mode to
const darkModeSelectors = [
  "body",
  "h1",
  "h2",
  "h4",
  "nav.top-nav",
  "section#brands",
  ".question",
  "footer",
];

function updateShapeImages(shouldApply) {
  // Get all shape images
  const shapeImages = document.querySelectorAll('img[src*="Shape"]');

  shapeImages.forEach((img) => {
    const currentSrc = img.src;

    if (img.classList.contains("white-icon")) {
      // Handle white-icon special case
      if (shouldApply) {
        img.src = currentSrc.includes("Shape-light.png")
          ? currentSrc.replace("Shape-light.png", "Shape-primary.png")
          : currentSrc;
      } else {
        img.src = currentSrc.includes("Shape-primary.png")
          ? currentSrc.replace("Shape-primary.png", "Shape-light.png")
          : currentSrc;
      }
    } else {
      // Handle regular shape images
      if (shouldApply) {
        img.src = currentSrc.includes("Shape-light.png")
          ? currentSrc.replace("Shape-light.png", "Shape-dark.png")
          : currentSrc;
      } else {
        img.src = currentSrc.includes("Shape-dark.png")
          ? currentSrc.replace("Shape-dark.png", "Shape-light.png")
          : currentSrc;
      }
    }
  });
}

function applyDarkMode(shouldApply) {
  // Apply to root (<html>)
  document.documentElement.setAttribute("data-dark", shouldApply);

  // Apply to all other elements
  darkModeSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.setAttribute("data-dark", shouldApply);
    });
  });

  // Update shape images
  updateShapeImages(shouldApply);

  // Change app.png to app-dark.png in about section
  const appImage = document.querySelector(".first.fade-in-left.delay-1 img");
  if (appImage) {
    appImage.src = shouldApply
      ? appImage.src.replace("app.png", "app-dark.png")
      : appImage.src.replace("app-dark.png", "app.png");
  }
}

function checkDarkModePreference() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyDarkMode(prefersDark);
}

// Initial check
document.addEventListener("DOMContentLoaded", checkDarkModePreference);

// Listen for changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    applyDarkMode(e.matches);
  });
