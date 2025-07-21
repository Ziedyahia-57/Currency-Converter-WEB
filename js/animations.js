document.addEventListener("DOMContentLoaded", () => {
  // Select all elements with any fade-in class
  const fadeElements = document.querySelectorAll(
    ".fade-in-up, .fade-in-down, .fade-in-left, .fade-in-right"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Optional: Unobserve after animation
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px", // Adjust to trigger animation slightly earlier
    }
  );

  fadeElements.forEach((element) => {
    observer.observe(element);
  });
});
