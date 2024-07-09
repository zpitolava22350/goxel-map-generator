const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.01, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//scene.fog = new THREE.FogExp2( 0x000000, 0.01 );

// Add directional light

const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(40, 100, 16);
//sunLight.castShadow = true;
scene.add(sunLight);
scene.add(sunLight.target);
sunLight.target.position.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const playerLight = new THREE.PointLight(0xffc996, 0, 12);
scene.add(playerLight);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

const playerHeight = 1.8;
const playerWidth = playerHeight * 0.3;
const halfHeight = playerHeight * 0.5;
const halfWidth = playerWidth * 0.5;
const stepHeight = 0.6;

const speed = 0.00007;
const gravity = 0.000024;
const jumpHeight = 0.008;
const dampening = 0.012;

var world = new World();

var mouse = {
  l: false,
  r: false,
  m: false
}

var player = {
  x: 0,
  y: 0,
  z: 0,
  xVel: 0,
  yVel: 0,
  zVel: 0,
  r: 0,
  t: 0,

  camera: {
    x: 0,
    y: 0,
    z: 0,
  }
};

player.chunk = {
  x: world.gc(player.x),
  y: world.gc(player.y),
  z: world.gc(player.z)
}

var grassTex;
var world = new World();

function setup() {
  //defineImages(); // needed cause it can't run in preload (cringe)

  //var cnv = createCanvas(window.innerWidth, window.innerHeight);
  //cnv.position(0, 0);
  //pixelDensity(1);
  //noSmooth();
  frameRate(9999999);

  grassTex = new THREE.TextureLoader().load(`http://127.0.0.1:5500/texsheet.png`);
  grassTex.magFilter = THREE.NearestFilter;
  grassTex.minFilter = THREE.NearestFilter;
  grassTex.wrapS = THREE.RepeatWrapping;
  grassTex.wrapT = THREE.RepeatWrapping;

  parseVoxelFile();

}

function draw() {

  if (world.loaded) {

    if (deltaTime > 60) {
      deltaTime = 60;
    }

    switch (-keyIsDown(87) + keyIsDown(83) + (keyIsDown(65) * 10) + -(keyIsDown(68) * 10) + 11) {
      case 11://no
        break;
      case 10://W
        player.zVel -= (Math.cos(player.r) * speed) * deltaTime;
        player.xVel -= (Math.sin(player.r) * speed) * deltaTime;
        break;
      case 20://WD
        player.zVel -= (Math.cos(player.r + (PI * 0.25)) * speed) * deltaTime;
        player.xVel -= (Math.sin(player.r + (PI * 0.25)) * speed) * deltaTime;
        break;
      case 21://D
        player.zVel -= (Math.cos(player.r + (PI * 0.5)) * speed) * deltaTime;
        player.xVel -= (Math.sin(player.r + (PI * 0.5)) * speed) * deltaTime;
        break;
      case 22://SD
        player.zVel -= (Math.cos(player.r + (PI * 0.75)) * speed) * deltaTime;
        player.xVel -= (Math.sin(player.r + (PI * 0.75)) * speed) * deltaTime;
        break;
      case 12://S
        player.zVel -= (Math.cos(player.r + (PI)) * speed) * deltaTime;
        player.xVel -= (Math.sin(player.r + (PI)) * speed) * deltaTime;
        break;
      case 2://SA
        player.zVel -= (Math.cos(player.r + (PI * 1.25)) * speed) * deltaTime;
        player.xVel -= (Math.sin(player.r + (PI * 1.25)) * speed) * deltaTime;
        break;
      case 1://A
        player.zVel -= (Math.cos(player.r + (PI * 1.5)) * speed) * deltaTime;
        player.xVel -= (Math.sin(player.r + (PI * 1.5)) * speed) * deltaTime;
        break;
      case 0://WA
        player.zVel -= (Math.cos(player.r + (PI * 1.75)) * speed) * deltaTime;
        player.xVel -= (Math.sin(player.r + (PI * 1.75)) * speed) * deltaTime;
        break;
    }

    if (keyIsDown(32) && player.onGround) {
      player.yVel += jumpHeight;
      player.onGround = false;
    }

    if (Math.abs(player.yVel) > 0.02) {
      player.yVel = lerp(player.yVel, 0, 0.01 * deltaTime);
    }

    world.collide();

    if (player.xVel != 0) {
      player.x += (player.xVel) * deltaTime;
    }
    if (player.zVel != 0) {
      player.z += (player.zVel) * deltaTime;
    }
    if (player.yVel != 0) {
      player.y += (player.yVel) * deltaTime;
    }

    player.xVel = lerp(player.xVel, 0, (deltaTime * dampening));
    player.zVel = lerp(player.zVel, 0, (deltaTime * dampening));

    if (!isNaN(gravity * deltaTime)) {
      if (Math.abs(player.yVel - (gravity * deltaTime)) <= 0.000005) {
        player.yVel = 0;
      } else if (Math.abs(gravity * deltaTime) > 0.000006) {
        player.yVel -= gravity * deltaTime;
      }
    }

    player.chunk = {
      x: world.gc(player.x),
      y: world.gc(player.y),
      z: world.gc(player.z)
    }

    camera.rotateX(-player.t);
    camera.rotateY(-player.r);

    let rotateCam = 0;
    let tiltCam = 0;

    rotateCam = (round(-movedX, 4) * 0.003);
    tiltCam = (round(movedY, 4) * 0.003);

    player.r += (rotateCam * deltaTime) / 8;
    player.t -= (tiltCam * deltaTime) / 8;

    if (player.t >= 1.45) {
      player.t = 1.45;
    } else if (player.t <= -1.45) {
      player.t = -1.45;
    }

    if (player.r > Math.PI) {
      player.r -= Math.PI * 2;
    } else if (player.r < -Math.PI) {
      player.r += Math.PI * 2;
    }
    camera.rotateY(player.r);
    camera.rotateX(player.t);

    player.camera = {
      x: player.x,
      y: player.y + (halfHeight / 2),
      z: player.z
    }

    camera.position.x = player.camera.x;
    camera.position.y = player.camera.y;
    camera.position.z = player.camera.z;
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

  }

}

function windowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeCanvas(window.innerWidth, window.innerHeight);
}

document.addEventListener("mousedown", function (event) {
  if (event.button === 0) { // Left mouse button
    requestPointerLock();
    mouse.l = true;
  }
  if (event.button === 2) { // Right mouse button
    mouse.r = true;
  }
  if (event.button === 1) { // Middle mouse button
    mouse.m = true;
  }
});

document.addEventListener("mouseup", function (event) {
  if (event.button === 0) { // Left mouse button
    mouse.l = false;
  }
  if (event.button === 2) { // Right mouse button
    mouse.r = false;
  }
  if (event.button === 1) { // Middle mouse button
    mouse.m = false;
  }
});