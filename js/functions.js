function add_glow_to_player() {
  var glow_geometry = new THREE.SphereGeometry(
    1,
    1,
    1
  );
  var glow_material = new THREE.MeshLambertMaterial({ color: 'white' });
  glow_mesh = new THREE.Mesh(glow_geometry, glow_material);
  glow_mesh.position = player.position;

  scene.add(glow_mesh);

  // SUPER SIMPLE GLOW EFFECT
  // use sprite because it appears the same from all angles
  var glowSpriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.ImageUtils.loadTexture("./images/glow.png"),
    useScreenCoordinates: false,
    alignment: THREE.SpriteAlignment.center,
    color: 'blue',
    transparent: false,
    blending: THREE.AdditiveBlending,
  });
  var glow_sprite = new THREE.Sprite(glowSpriteMaterial);
  glow_sprite.scale.set(80, 80, 1.0);
  glow_mesh.add(glow_sprite); // this centers the glow at the mesh
}

function add_player() {
  player = new THREE.Mesh(player_geometry, player_material);
  position_player_on_start();
  scene.add(player);

  if (outline_effect) {
    apply_player_outline_effect();
  }
}

function apply_player_outline_effect() {
  var outline_color = "teal";
  var thickness = 1.05;

  var material = new THREE.MeshBasicMaterial({
    color: outline_color,
    side: THREE.BackSide,
  });
  var outline = new THREE.Mesh(player_geometry, material);
  outline.position = player.position;
  outline.scale.multiplyScalar(thickness);
  scene.add(outline);
}

function position_player_on_start() {
  player.rotation.y = Math.PI / 2;
  // player.position.y = player.geometry.height / 2;
  player.position.set(0, player_radius, 0);
}

function add_controls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function add_events() {
  THREEx.WindowResize(renderer, camera);
  THREEx.FullScreen.bindKey({ charCode: "m".charCodeAt(0) });
}

function add_renderer() {
  if (Detector.webgl) {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } else {
    renderer = new THREE.CanvasRenderer();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  container = document.getElementById("ThreeJS");
  container.appendChild(renderer.domElement);
}

function add_camera() {
  // original fov = 45
  var w = window.innerWidth,
    h = window.innerHeight;

  var VIEW_ANGLE = 95;
  var ASPECT = w / h;
  var NEAR = 0.1;
  var FAR = 10000;

  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.set(100, 100, 100);
  camera.lookAt(scene.position);
  scene.add(camera);
}

function add_minimap() {
  minimap = new THREE.OrthographicCamera(
    -1500, // Left
    1500, // Right
    1500, // Top
    -1500, // Bottom
    1, // Near
    1000
  ); // Far
  minimap.up = new THREE.Vector3(0, 0, -1);
  minimap.lookAt(new THREE.Vector3(0, -1, 0));
  minimap.position.y = 100;
  // minimap.rotation.z = Math.PI / 2;
  minimap.position.z = -500;

  scene.add(minimap);

  ////////////////////
  // POSTPROCESSING //
  ////////////////////
  renderer.autoClear = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xccccff, 1);

  // composer for main scene
  composer = new THREE.EffectComposer(renderer);
  var renderModel = new THREE.RenderPass(scene, camera);

  var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
  var width = window.innerWidth || 2;
  var height = window.innerHeight || 2;
  effectFXAA.uniforms["resolution"].value.set(1 / width, 1 / height);

  // var effectCopy = new THREE.ShaderPass( THREE.CopyShader );
  effectFXAA.renderToScreen = true;

  composer.addPass(renderModel);
  composer.addPass(effectFXAA);
  // composer.addPass( effectCopy );

  // composer for minimap
  var parameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false,
  };
  minimap_composer = new THREE.EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(512, 512)
  );
  minimap_composer.setSize(512, 512);
  var renderModel2 = new THREE.RenderPass(scene, minimap);
  minimap_composer.addPass(renderModel2);
  var effectFXAA2 = new THREE.ShaderPass(THREE.FXAAShader);
  effectFXAA2.uniforms["resolution"].value.set(1 / 512, 1 / 512);
  // effectFXAA2.renderToScreen = true;
  minimap_composer.addPass(effectFXAA2);
  var effectCopy2 = new THREE.ShaderPass(THREE.CopyShader);
  effectCopy2.renderToScreen = true;
  minimap_composer.addPass(effectCopy2);
}

function add_stats() {
  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.bottom = "0px";
  stats.domElement.style.zIndex = 100;
  container.appendChild(stats.domElement);
}

function add_lights() {
  var light = new THREE.PointLight(0xffffff);
  light.position.set(100, 250, 100);
  scene.add(light);
}

function add_plane_track() {
  var trackTexture = new THREE.ImageUtils.loadTexture(
    "./images/race_track.png"
  );
  trackTexture.wrapS = trackTexture.wrapT = THREE.RepeatWrapping;
  trackTexture.repeat.set(1, 1);

  var trackMaterial = new THREE.MeshBasicMaterial({
    map: trackTexture,
    side: THREE.DoubleSide,
  });

  var trackGeometry = new THREE.PlaneGeometry(2177, 1088, 1, 1);
  track = new THREE.Mesh(trackGeometry, trackMaterial);
  track.position.x = -300;
  track.position.y = -5;
  track.position.z = -350;

  track.rotation.x = -Math.PI / 2;
  scene.add(track);
  collidableMeshList.push(track);
}

function add_axis() {
  var axis = new THREE.AxisHelper(100);
  scene.add(axis);
}

function add_skybox() {
  var imagePrefix = "./images/skybox/";
  var directions = ["px", "nx", "py", "ny", "pz", "nz"];
  var imageSuffix = ".png";
  var skyGeometry = new THREE.CubeGeometry(10000, 10000, 10000);

  var materialArray = [];
  for (var i = 0; i < 6; i++)
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(
          imagePrefix + directions[i] + imageSuffix
        ),
        side: THREE.BackSide,
      })
    );
  var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
  var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyBox);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function apply_gravity() {
  player.translateY(GRAVITY);
}

function update() {
  keyboard.update();

  var delta = clock.getDelta();
  var moveDistance = steering_speed * delta;
  var rotateAngle = (Math.PI / 2) * delta + steering_bias / 100;
  var rotation_matrix = new THREE.Matrix4().identity();

  if (keyboard.pressed("up") || keyboard.pressed("W")) {
    player.translateZ(-moveDistance);
    if (keyboard.pressed("left") || keyboard.pressed("A")) {
      player.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
      player.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
    }
  } else if (keyboard.pressed("down") || keyboard.pressed("S")) {
    player.translateZ(moveDistance);
    if (keyboard.pressed("left") || keyboard.pressed("A")) {
      player.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
      player.rotateOnAxis(new THREE.Vector3(0, 1, 0), +rotateAngle);
    }
  }

  if (keyboard.pressed("R")) {
    player.position.set(0, 25.1, 0);
    player.rotation.set(0, 0, 0);
  }

  camera.position
    .copy(control.center)
    .add(
      new THREE.Vector3(
        player.position.x + 150,
        player.position.y + 150,
        player.position.z + 150
      )
    );

  glow_mesh.position = player.position;
  if (!collision_detection()) {
    apply_gravity();
  };
  stats.update();
}

function render() {
  var w = window.innerWidth,
    h = window.innerHeight;

  // setViewport parameters:
  //  lower_left_x, lower_left_y, viewport_width, viewport_height

  // full display
  renderer.setViewport(0, 0, w, h);
  renderer.render(scene, camera);

  if (show_minimap) {
    composer.render();
  }
  renderer.clear(false, true, false);

  renderer.setViewport(
    5,
    h - minimap_height - 5,
    minimap_width,
    minimap_height
  );

  if (show_minimap) {
    renderer.render(scene, minimap);
  }
}

function collision_detection() {
  var originPoint = player.position.clone();

  for (var vertexIndex = 0; vertexIndex < player.geometry.vertices.length; vertexIndex++ ) {
    var localVertex = player.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(player.matrix);
    var directionVector = globalVertex.sub(player.position);

    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

    var collisionResults = ray.intersectObjects(collidableMeshList);
    if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      return true;
    }
  }
}