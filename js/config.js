var container, scene, camera, renderer, controls, stats;
var keyboard = new KeyboardState();
var clock = new THREE.Clock();

var track, glow_mesh;
var player, control;
// how much the characters turn
var steering_bias = 1.6;
// base speed
var steering_speed = 150;
var outline_effect = true;

var player_radius = 15;
var player_segments = player_radius * 1.5;
var player_geometry = new THREE.SphereGeometry(
  player_radius,
  player_segments,
  player_segments
);
var player_material = new THREE.MeshNormalMaterial();
// var player_material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

var show_minimap = true;
var minimap,
  minimap_width = 500,
  minimap_height = 500,
  minimap_composer;

var collidableMeshList;
const GRAVITY = -1;