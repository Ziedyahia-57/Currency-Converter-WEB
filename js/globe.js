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

    // Double-click detection variables
    let clickCount = 0;
    let clickTimer = null;
    const DOUBLE_CLICK_DELAY = 300; // milliseconds

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

    // Handle double-click for mobile view
    canvas.addEventListener("click", (event) => {
      if (!isMobileView()) return; // Only apply double-click behavior on mobile

      clickCount++;
      
      if (clickCount === 1) {
        // First click - start timer
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, DOUBLE_CLICK_DELAY);
      } else if (clickCount === 2) {
        // Double click detected
        clearTimeout(clickTimer);
        clickCount = 0;
        
        // Toggle rotation enable state
        controls.enableRotate = true;
        controls.autoRotate = false;
        
        // Reset after a delay
        setTimeout(() => {
          controls.enableRotate = false;
          controls.autoRotate = true;
        }, 2000); // Allow rotation for 2 seconds after double-click
      }
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
      if (isMobileView()) {
        canvas.style.cursor = "default";
      } else {
        canvas.style.cursor = "grab";
      }
    };
    
    updateCursor();

    canvas.addEventListener("mousedown", () => {
      if (!isMobileView()) {
        canvas.style.cursor = "grabbing";
        controls.autoRotate = false;
      }
    });

    canvas.addEventListener("mouseup", () => {
      if (!isMobileView()) {
        canvas.style.cursor = "grab";
        controls.autoRotate = true;
      }
    });

    canvas.addEventListener("mouseleave", () => {
      if (!isMobileView()) {
        canvas.style.cursor = "grab";
        controls.autoRotate = true;
      }
    });

    // Also update cursor on window resize
    window.addEventListener('resize', updateCursor);

  })
  .catch((error) => {
    console.error("Error loading globe:", error);
    container.innerHTML = '<div class="error">Globe failed to load</div>';
  });