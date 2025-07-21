var prevScrollpos = window.pageYOffset;

function handleScroll() {
  // Check if screen width is below 1020px
  if (window.innerWidth < 1020) {
    var currentScrollPos = window.pageYOffset;
    var navbar = document.getElementById("navbar");

    if (prevScrollpos > currentScrollPos) {
      navbar.style.top = "0";
    } else {
      navbar.style.top = "-76px";
    }
    prevScrollpos = currentScrollPos;
  }
}

// Add event listeners
window.onscroll = handleScroll;

// Also handle screen resize in case user changes window size
window.onresize = function () {
  var navbar = document.getElementById("navbar");
  // If screen is larger than 1020px, ensure navbar is visible
  if (window.innerWidth >= 1019) {
    navbar.style.top = "0";
  }
};

// Add active class to bottom nav based on visible section
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".bottom-nav .nav-btn");
  const sections = document.querySelectorAll("section");

  // Function to check which section is in view
  function updateActiveNav() {
    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.scrollY >= sectionTop - sectionHeight / 3) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  // Run on initial load and scroll
  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav();

  // Also update when clicking nav links (for smooth scrolling)
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Remove active class from all links
      navLinks.forEach((navLink) => navLink.classList.remove("active"));
      // Add active class to clicked link
      this.classList.add("active");
    });
  });
});
