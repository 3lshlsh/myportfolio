export async function initViewer(getAngle, text, models, language) {
  let scene3, camera3, renderer, modelObject;
  try {
    const THREE = await import("three");
    const { STLLoader } = await import("three/addons/loaders/STLLoader.js");
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const viewer = document.getElementById("modelViewer");
    scene3 = new THREE.Scene();
    camera3 = new THREE.PerspectiveCamera(
      38,
      viewer.clientWidth / viewer.clientHeight,
      0.1,
      100,
    );
    camera3.position.set(4, 2.4, 7);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    viewer.prepend(renderer.domElement);
    document.getElementById("modelFallback").style.display = "none";
    scene3.add(new THREE.HemisphereLight(0xffffff, 0x5b8377, 2.3));
    const light = new THREE.DirectionalLight(0xffffff, 3.6);
    light.position.set(5, 7, 4);
    scene3.add(light);
    let fill = new THREE.DirectionalLight(0xb2d5b5, 1.7);
    fill.position.set(-6, 2, -5);
    scene3.add(fill);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x547a70,
      metalness: 0.15,
      roughness: 0.3,
      clearcoat: 0.45,
    });
    const mat2 = new THREE.MeshPhysicalMaterial({
      color: 0xc6cdac,
      metalness: 0.12,
      roughness: 0.32,
    });
    let demo = new THREE.Group();
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.21, 20, 100),
      mat,
    );
    torus.rotation.y = 0.35;
    demo.add(torus);
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.42, 0.42), mat2);
    box.rotation.z = 0.65;
    demo.add(box);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 30, 30), mat);
    sphere.position.set(0.7, 0.42, 0.6);
    demo.add(sphere);
    scene3.add(demo);
    modelObject = demo;
    let drag = false,
      lastX = 0,
      lastY = 0,
      dragX = 0,
      dragY = 0;
    renderer.domElement.addEventListener("pointerdown", (e) => {
      drag = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    });
    renderer.domElement.addEventListener("pointermove", (e) => {
      if (!drag) return;
      dragX += (e.clientX - lastX) * 0.012;
      dragY += (e.clientY - lastY) * 0.008;
      dragY = Math.max(-0.8, Math.min(0.8, dragY));
      lastX = e.clientX;
      lastY = e.clientY;
    });
    renderer.domElement.addEventListener("pointerup", () => (drag = false));
    renderer.domElement.addEventListener("pointercancel", () => (drag = false));
    const input = document.getElementById("modelFile");
    let revision = 0;
    async function loadModel(url, name, sourceFile, modelId) {
      const request = ++revision;
      try {
        let object;
        if (
          (sourceFile?.name || new URL(url, location.href).pathname)
            .toLowerCase()
            .endsWith(".stl")
        ) {
          const loader = new STLLoader();
          const geo = sourceFile
            ? loader.parse(await sourceFile.arrayBuffer())
            : await loader.loadAsync(url);
          geo.computeVertexNormals();
          object = new THREE.Mesh(
            geo,
            new THREE.MeshStandardMaterial({
              color: 0x6c9284,
              metalness: 0.08,
              roughness: 0.42,
              side: THREE.DoubleSide,
            }),
          );
        } else {
          object = (await new GLTFLoader().loadAsync(url)).scene;
        }
        if (request !== revision) return;
        scene3.remove(modelObject);
        const group = new THREE.Group();
        group.add(object);
        const bounds = new THREE.Box3().setFromObject(group);
        const center = bounds.getCenter(new THREE.Vector3());
        object.position.sub(center);
        const size = bounds.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) group.scale.setScalar(3.2 / maxDim);
        scene3.add(group);
        modelObject = group;
        document.getElementById("modelType").removeAttribute("data-t");
        document.getElementById("modelType").textContent = modelId
          ? models.find((m) => m.id === modelId).name[language()]
          : name;
        document.getElementById("modelType").dataset.modelId = modelId || "";
        document.getElementById("modelStatus").dataset.t = "modelLoaded";
        document.getElementById("modelStatus").textContent =
          text("modelLoaded");
      } catch (err) {
        if (request !== revision) return;
        document.getElementById("modelStatus").textContent =
          text("modelError") + err.message;
      } finally {
        if (sourceFile) URL.revokeObjectURL(url);
      }
    }
    input.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (f) loadModel(URL.createObjectURL(f), f.name, f, null);
    });
    const selection = document.getElementById("modelSelection");
    if (selection) {
      const loadSelected = () => {
        const model = models.find((m) => m.id === selection.value);
        if (model) loadModel(model.url, model.name[language()], null, model.id);
      };
      selection.addEventListener("change", loadSelected);
      loadSelected();
    }
    const resize = () => {
      const w = viewer.clientWidth,
        h = viewer.clientHeight;
      renderer.setSize(w, h, false);
      camera3.aspect = w / h;
      camera3.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);
    new ResizeObserver(resize).observe(viewer);
    function tick() {
      if (modelObject) {
        modelObject.rotation.y +=
          (getAngle() + dragX - modelObject.rotation.y) * 0.075;
        modelObject.rotation.x += (dragY - modelObject.rotation.x) * 0.075;
      }
      renderer.render(scene3, camera3);
      requestAnimationFrame(tick);
    }
    tick();
  } catch (err) {
    console.warn(
      "3D viewer unavailable; fallback preview remains available.",
      err,
    );
    document.getElementById("modelStatus").dataset.t = "viewerOffline";
    document.getElementById("modelStatus").textContent = text("viewerOffline");
  }
}
