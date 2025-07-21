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

// Make canvas responsive - width 100%, height auto
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
    img.src = "img/map.svg";
  });
};

// Main creation function
loadSvgTexture()
  .then((texture) => {
    // Create REVERSED gradient material with texture
    const gradientMaterial = new THREE.ShaderMaterial({
      uniforms: {
        outerColor: { value: new THREE.Color(0x00ae8b) }, // Teal
        innerColor: { value: new THREE.Color(0x888888) }, // Gray inside
        opacity: { value: 0.8 }, // 80% transparency for front side
        backOpacity: { value: 0.2 }, // 20% transparency for back side
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

    // Create globe with initial -120 degree rotation
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 128, 128),
      gradientMaterial
    );
    globe.rotation.y = -120 * (Math.PI / 180);
    scene.add(globe);

    // Rim glow (teal color)
    const rimGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.86, 128, 128),
      new THREE.MeshBasicMaterial({
        color: 0x00ae8b,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      })
    );
    scene.add(rimGlow);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = (Math.PI * 5) / 6;

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

      // Update renderer
      renderer.setSize(newWidth, newHeight);

      // Update camera
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);
  })
  .catch((error) => {
    console.error("Error loading globe:", error);
    container.innerHTML = '<div class="error">Globe failed to load</div>';
  });

const canvasZone = document.querySelector("Canvas");

canvasZone.addEventListener("mousedown", () => {
  canvasZone.style.cursor = "grabbing";
});

canvasZone.addEventListener("mouseup", () => {
  canvasZone.style.cursor = "grab";
});

canvasZone.addEventListener("mouseleave", () => {
  canvasZone.style.cursor = "grab";
});
