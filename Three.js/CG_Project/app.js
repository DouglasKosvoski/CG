var container, scene, camera, renderer, controls, stats;
var keyboard = new KeyboardState();
var clock = new THREE.Clock();

var car, control;
var steering_bias = 1.2;
var steering_speed = 200;

var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight;

var VIEW_ANGLE = 45,
  ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
  NEAR = 0.1,
  FAR = 20000;

this.init();
this.animate();

function init() {
  scene = new THREE.Scene();
  add_camera();

  add_renderer();
  add_events();
  add_controls();
  add_lights();
  add_plane_track();
  add_skybox();

  //   var ambientLight = new THREE.AmbientLight(0x111111);
  //   scene.add(ambientLight);

  //   add_stats();
  //   add_axis();

  var car_width = 20;
  var car_height = 15;
  var car_depth = 40;
  var car_geometry = new THREE.CubeGeometry(car_width, car_height, car_depth);
  var car_material = new THREE.MeshLambertMaterial({ color: "gold" });
  car = new THREE.Mesh(car_geometry, car_material);
  car.rotation.y = Math.PI / 2;
  car.position.y = car.geometry.height / 2;
  scene.add(car);

  control = new THREE.OrbitControls(camera, scene);
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
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById("ThreeJS");
  container.appendChild(renderer.domElement);
}

function add_camera() {
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.set(100, 100, 100);
  camera.lookAt(scene.position);
  scene.add(camera);
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
  var trackTexture = new THREE.ImageUtils.loadTexture("./race_track.png");
  trackTexture.wrapS = trackTexture.wrapT = THREE.RepeatWrapping;
  trackTexture.repeat.set(1, 1);

  var trackMaterial = new THREE.MeshBasicMaterial({
    map: trackTexture,
    side: THREE.DoubleSide,
  });

  var trackGeometry = new THREE.PlaneGeometry(2177, 1088, 1, 1);
  var track = new THREE.Mesh(trackGeometry, trackMaterial);
  track.position.x = -300;
  track.position.y = 0;
  track.position.z = -350;

  track.rotation.x = -Math.PI / 2;
  scene.add(track);
}

function add_axis() {
  var axis = new THREE.AxisHelper(100);
  scene.add(axis);
}

function add_skybox() {
  var imagePrefix = "./skybox/";
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

function update() {
  keyboard.update();

  var delta = clock.getDelta();
  var moveDistance = steering_speed * delta;
  var rotateAngle = (Math.PI / 2) * delta + steering_bias / 100;
  var rotation_matrix = new THREE.Matrix4().identity();


  if (keyboard.pressed("up") || keyboard.pressed("W")) {
    car.translateZ(-moveDistance);
    if (keyboard.pressed("left") || keyboard.pressed("A")) {
      car.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
      car.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
    }
  }
  else if (keyboard.pressed("down") || keyboard.pressed("S")) {
    car.translateZ(moveDistance);
    if (keyboard.pressed("left") || keyboard.pressed("A")) {
      car.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
      car.rotateOnAxis(new THREE.Vector3(0, 1, 0), +rotateAngle);
    }
  }

  if (keyboard.pressed("R")) {
    car.position.set(0, 25.1, 0);
    car.rotation.set(0, 0, 0);
  }

  camera.position
    .copy(control.center)
    .add(
      new THREE.Vector3(
        car.position.x + 150,
        car.position.y + 150,
        car.position.z + 150
      )
    );

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}
