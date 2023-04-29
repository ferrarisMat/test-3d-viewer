import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const canvas = document.querySelector('#canvas');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

const aspectRatio = canvas.width / canvas.height;
const camera = new THREE.PerspectiveCamera(90, aspectRatio, 0.1, 1000);
camera.position.set(0, 10, 20);

renderer.setSize(canvas.width, canvas.height);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.castShadow = true;
light.shadow.mapSize.width = 4096;
light.shadow.mapSize.height = 4096; 
light.shadow.bias = -0.0001; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
light.position.set(1, 2, 4);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const objLoader = new OBJLoader();

let loadedObject = null;

function loadObjFromUrl(url) {
  objLoader.load(url, (root) => {
    root.traverse((node) => {
      if (node.isMesh) {
        node.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
      }
    });
    loadedObject = root;
    loadedObject.rotateX(-45);
    centerObjectInCameraFrame();
    scene.add(loadedObject);
  });
}
const fileInput = document.querySelector('#file-input');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    
    while(scene.children.length > 0){
      scene.remove(scene.children[0]);
    }
    scene.add(light);
    scene.add(ambientLight);
    loadObjFromUrl(url);
  }
});

function centerObjectInCameraFrame() {
  if (!loadedObject) {
    return;
  }
  // Calculate bounding box of the object
  const boundingBox = new THREE.Box3().setFromObject(loadedObject);
  const objectSize = boundingBox.getSize(new THREE.Vector3()).length();
  const objectCenter = boundingBox.getCenter(new THREE.Vector3());
  
  // Calculate distance from camera to fit object in the view
  const cameraDistance = objectSize / Math.tan(Math.PI * camera.fov / 360);
  
  // Set camera position and target
  camera.position.copy(objectCenter);
  camera.position.z += cameraDistance;
  controls.target.copy(objectCenter);
  controls.update();
}

document.addEventListener('keydown', (event) => {
  if (event.code === "KeyF") {
    centerObjectInCameraFrame();
  }
});

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
