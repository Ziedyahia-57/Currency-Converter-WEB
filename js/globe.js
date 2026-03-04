// Scene setup with transparent background
const scene = new THREE.Scene();
scene.background = null;

// Target container
const container = document.querySelector(".second");

// Initial sizing based on container
const width = container.clientWidth;
const height = container.clientHeight;

// Camera setup
const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
camera.position.z = 1.75;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(width, height);
container.innerHTML = "";

// Make canvas responsive
const canvas = renderer.domElement;
canvas.style.display = "block";
canvas.style.width = "100%";
canvas.style.height = "auto";
canvas.style.maxWidth = "100%";
container.appendChild(canvas);

// SVG loader
const loadSvgTexture = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const resolution = 2048;
      canvas.width = resolution;
      canvas.height = resolution / 2;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      resolve(texture);
    };
    // img.src = "img/world hexagon mercator.png";
    img.src = "img/map-final.svg";
  });
};

// Check if screen width is less than 1020px
const isMobileView = () => window.innerWidth < 1020;

// Main creation function
loadSvgTexture()
  .then((texture) => {
    // Create gradient material with texture
    const gradientMaterial = new THREE.ShaderMaterial({
      uniforms: {
        outerColor: { value: new THREE.Color(0x00ae8b) },
        innerColor: { value: new THREE.Color(0x888888) },
        opacity: { value: 0.8 },
        backOpacity: { value: 0.2 },
        map: { value: texture },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vFacingRatio;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vec3 viewDirection = vec3(0.0, 0.0, 1.0);
          vFacingRatio = max(0.0, dot(vNormal, viewDirection));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 outerColor;
        uniform vec3 innerColor;
        uniform float opacity;
        uniform float backOpacity;
        uniform sampler2D map;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vFacingRatio;
        
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 gradient = mix(innerColor, outerColor, 1.0 - intensity);
          vec4 texColor = texture2D(map, vUv);
          vec3 finalColor = mix(gradient, texColor.rgb, texColor.a);
          float facingFactor = smoothstep(0.0, 0.5, vFacingRatio);
          float finalOpacity = mix(backOpacity, opacity, facingFactor) * texColor.a;
          gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create globe with initial rotation
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.85, 128, 128), gradientMaterial);
    globe.rotation.y = -120 * (Math.PI / 180);
    scene.add(globe);

    // Rim glow
    const rimGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.86, 128, 128),
      new THREE.MeshBasicMaterial({
        color: 0x00ae8b,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      }),
    );
    scene.add(rimGlow);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Controls Configuration
    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.4;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = (Math.PI * 5) / 6;
    controls.screenSpacePanning = false;
    controls.maxDistance = 1.75;
    controls.minDistance = 1.75;

    // Function to update rotation enable state based on screen width
    const updateRotationEnableState = () => {
      if (isMobileView()) {
        controls.enableRotate = false; // Disable normal rotation for mobile
      } else {
        controls.enableRotate = true; // Enable normal rotation for desktop
      }
    };

    // Initial state
    updateRotationEnableState();

    // Drag handling for mobile view
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTime = 0;
    let hasVerticalMovement = false;

    // Function to check if movement is more vertical than horizontal
    const isVerticalMovement = (currentX, currentY) => {
      const deltaX = Math.abs(currentX - dragStartX);
      const deltaY = Math.abs(currentY - dragStartY);
      return deltaY > deltaX * 1.5; // More vertical than horizontal
    };

    canvas.addEventListener("mousedown", (e) => {
      if (!isMobileView()) {
        // Desktop behavior
        canvas.style.cursor = "grabbing";
        controls.autoRotate = false;
        return;
      }

      // Mobile behavior - start drag detection
      isDragging = false;
      hasVerticalMovement = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartTime = Date.now();
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isMobileView()) return;

      // Don't prevent default if we haven't started dragging yet
      if (!isDragging) {
        // Check if this is a drag (movement threshold exceeded)
        if (Math.abs(e.clientX - dragStartX) > 5 || Math.abs(e.clientY - dragStartY) > 5) {
          // Check if movement is primarily vertical
          if (isVerticalMovement(e.clientX, e.clientY)) {
            // This is likely a scroll attempt - let it pass through
            hasVerticalMovement = true;
            return;
          }
          
          // This is a horizontal or diagonal drag - enable globe rotation
          isDragging = true;
          
          // Prevent page scroll only when we're sure it's a drag
          e.preventDefault();
          
          // Enable rotation temporarily
          controls.enableRotate = true;
          controls.autoRotate = false;
        }
      } else {
        // Already dragging - continue preventing scroll
        e.preventDefault();
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      if (!isMobileView()) {
        // Desktop behavior
        canvas.style.cursor = "grab";
        controls.autoRotate = true;
        return;
      }

      // Mobile behavior - reset if we were dragging
      if (isDragging) {
        e.preventDefault();
        
        // Disable rotation after a short delay
        setTimeout(() => {
          controls.enableRotate = false;
          controls.autoRotate = true;
        }, 100);
      }
      
      isDragging = false;
      hasVerticalMovement = false;
    });

    canvas.addEventListener("mouseleave", () => {
      if (!isMobileView()) {
        canvas.style.cursor = "grab";
        controls.autoRotate = true;
        return;
      }

      // Mobile behavior - reset drag state
      if (isDragging) {
        controls.enableRotate = false;
        controls.autoRotate = true;
      }
      isDragging = false;
      hasVerticalMovement = false;
    });

    // Touch events for mobile
    canvas.addEventListener("touchstart", (e) => {
      if (isMobileView()) {
        isDragging = false;
        hasVerticalMovement = false;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartTime = Date.now();
      }
    }, { passive: true }); // Start with passive true to allow scrolling

    canvas.addEventListener("touchmove", (e) => {
      if (!isMobileView()) return;

      // Don't prevent default if we haven't started dragging yet
      if (!isDragging) {
        // Check if this is a drag (movement threshold exceeded)
        if (Math.abs(e.touches[0].clientX - dragStartX) > 5 || Math.abs(e.touches[0].clientY - dragStartY) > 5) {
          // Check if movement is primarily vertical
          if (isVerticalMovement(e.touches[0].clientX, e.touches[0].clientY)) {
            // This is likely a scroll attempt - let it pass through
            hasVerticalMovement = true;
            return;
          }
          
          // This is a horizontal or diagonal drag - enable globe rotation
          isDragging = true;
          
          // Now we need to prevent default to stop scrolling
          e.preventDefault();
          
          // Enable rotation temporarily
          controls.enableRotate = true;
          controls.autoRotate = false;
        }
      } else {
        // Already dragging - continue preventing scroll
        e.preventDefault();
      }
    }, { passive: false }); // Switch to passive: false only when we need to prevent default

    canvas.addEventListener("touchend", (e) => {
      if (!isMobileView()) return;

      if (isDragging) {
        e.preventDefault();
        
        // Disable rotation after a short delay
        setTimeout(() => {
          controls.enableRotate = false;
          controls.autoRotate = true;
        }, 100);
      }
      
      isDragging = false;
      hasVerticalMovement = false;
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      
      // Update rotation state on resize
      updateRotationEnableState();
    });
    resizeObserver.observe(container);

    // Handle window resize
    window.addEventListener('resize', updateRotationEnableState);

    // Cursor interaction
    const updateCursor = () => {
      canvas.style.cursor = "grab";
    };
    
    updateCursor();

    // Also update cursor on window resize
    window.addEventListener('resize', updateCursor);

  })
  .catch((error) => {
    console.error("Error loading globe:", error);
    container.innerHTML = '<div class="error">Globe failed to load</div>';
  });