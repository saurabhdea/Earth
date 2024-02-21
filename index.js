import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

import starsTexture from './img/star2.jpg';
import earthTexture from './img/earthm.jpg';
import lunarTexture from './img/lunar.jpg';

const ShuttleUrl = new URL('./discovery_space_shuttle/scene.gltf', import.meta.url);
const SatelliteUrl = new URL('./Satellite/scene.gltf', import.meta.url);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-80, 10, 90);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture
]);

const textureLoader = new THREE.TextureLoader();

const earthGeo = new THREE.SphereGeometry(16, 30, 30);
const earthMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(earthTexture)
});
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

function createPlanete(size, texture, position) {
    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(texture)
    });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    scene.add(obj);
    mesh.position.x = position;
    return { mesh, obj };
}

const lunar = createPlanete(2.8, lunarTexture, 50);

const pointLight = new THREE.PointLight(0xFFFFFF, 2, 300);
scene.add(pointLight);

const shuttleOrbitRadius = 40; 
const shuttleOrbitSpeed = 0.001;
const shuttleOrbitCenter = new THREE.Vector3(0, 0, 0); 
let angle = 0; 

const assetLoader = new GLTFLoader();
let model; 
assetLoader.load(ShuttleUrl.href, function (gltf) {
    model = gltf.scene;
    scene.add(model);
   
    model.scale.set(0.1, 0.1, 0.1);
    // Position the shuttle near the moon
    model.position.set(52, 0, 0);

    // Add a point light to illuminate the
    const modelPointLight = new THREE.PointLight(0xffffff, 2);
    modelPointLight.position.set(-5, 30, 10);
    model.add(modelPointLight); 
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
}, undefined, function (error) {
    console.error(error);
});


// Define variables for satellite orbit
const satelliteOrbitRadius = 20; // Radius of the orbit around the Earth
const satelliteOrbitSpeed = 0.02; // Speed of the orbit
let satelliteAngle = 0; // Initialize angle for satellite's orbit
const satellitetCenter = new THREE.Vector3(0, 0, 0); 

// Load the satellite model
const satelliteAssetLoader = new GLTFLoader();
let satelliteModel; // Declare satellite model variable globally


satelliteAssetLoader.load(SatelliteUrl.href, function (gltf) {
    satelliteModel = gltf.scene;
    scene.add(satelliteModel);
    // Scale down the satellite
    satelliteModel.scale.set(0.1, 0.1, 0.1);
    
    
}, undefined, function (error) {
    console.error(error);
});


function animate() {
    // Self-rotation of earth and lunar
    earth.rotateY(0.004);
    lunar.mesh.rotateY(0.009);

    raycaster.setFromCamera(mouse, camera);

    // Around-earth-rotation of lunar
    lunar.obj.rotateY(0.001);

    // Update angle for shuttle's orbit
    angle -= shuttleOrbitSpeed; // Change the direction of orbit

    // Calculate the new position of the shuttle
    const shuttleX = shuttleOrbitCenter.x + shuttleOrbitRadius * Math.cos(angle);
    const shuttleZ = shuttleOrbitCenter.z + shuttleOrbitRadius * Math.sin(angle);

    // Update the position of the space shuttle
    if (model) { // Ensure the model is loaded
        model.position.set(shuttleX, 0, shuttleZ);
    }

    // Update angle for satellite's orbit
    satelliteAngle -= satelliteOrbitSpeed;

    // Calculate the new position of the satellite
    const satelliteX = satellitetCenter.x + satelliteOrbitRadius * Math.cos(satelliteAngle);
    const satelliteZ = satellitetCenter.z + satelliteOrbitRadius * Math.sin(satelliteAngle);

    // Update the position of the satellite
    if (satelliteModel) { // Ensure the model is loaded
        satelliteModel.position.set(satelliteX, 0, satelliteZ);
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
