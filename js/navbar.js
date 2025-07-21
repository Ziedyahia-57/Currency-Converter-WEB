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

document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".bottom-nav .nav-btn");
  const sections = document.querySelectorAll("section");
  let isScrolling = false;
  let lastScrollPosition = window.scrollY;

  // Get the computed scroll-margin-top value (in pixels)
  function getScrollMargin(element) {
    const style = window.getComputedStyle(element);
    const scrollMargin = parseInt(style.scrollMarginTop) || 0;
    return scrollMargin;
  }

  function updateActiveNav() {
    let currentSection = "";
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section) => {
      const scrollMargin = getScrollMargin(section);
      const sectionTop = section.offsetTop - scrollMargin;
      const sectionHeight = section.clientHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
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

  // Smooth scroll for nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        isScrolling = true;
        navLinks.forEach((navLink) => navLink.classList.remove("active"));
        this.classList.add("active");

        const scrollMargin = getScrollMargin(targetSection);
        window.scrollTo({
          top: targetSection.offsetTop - scrollMargin,
          behavior: "smooth",
        });

        setTimeout(() => {
          isScrolling = false;
          updateActiveNav(); // Final position check after scroll
        }, 1000);
      }
    });
  });

  // Throttled scroll event
  function throttle(callback, limit) {
    let wait = false;
    return function () {
      if (!wait) {
        callback.apply(this, arguments);
        wait = true;
        setTimeout(() => {
          wait = false;
        }, limit);
      }
    };
  }

  window.addEventListener(
    "scroll",
    throttle(function () {
      const currentScrollPosition = window.scrollY;

      // Only update if not programmatically scrolling and user actually scrolled
      if (
        !isScrolling &&
        Math.abs(currentScrollPosition - lastScrollPosition) > 5
      ) {
        updateActiveNav();
      }
      lastScrollPosition = currentScrollPosition;
    }, 100)
  );

  updateActiveNav(); // Initial update
});
