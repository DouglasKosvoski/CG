this.main();
this.animate();


function main() {
  collidableMeshList = [];

  scene = new THREE.Scene();

  add_camera();
  add_renderer();
  add_events();
  add_controls();
  add_lights();
  add_plane_track();
  add_skybox();
  add_stats();
  // add_axis();
  add_player();

  add_glow_to_player();

  if (show_minimap) {
    add_minimap();
  }

  var ambientLight = new THREE.AmbientLight(0x111111);
  scene.add(ambientLight);
  control = new THREE.OrbitControls(camera, scene);
}
