this.main();
this.animate();

function main() {
  collidableMeshList = [];

  scene = new THREE.Scene();

  add_camera();
  add_renderer();
  add_events();
  add_controls();
  // add_lights();
  add_plane_track();
  add_skybox();
  add_stats();
  // add_axis();
  add_player();

  add_glow_to_player();

  if (show_minimap) {
    add_minimap();
  }

  control = new THREE.OrbitControls(camera, scene);
	scene.fog = new THREE.FogExp2('black', 0.0002);
}
