import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARAnchorManager } from './ARAnchorManager.js';

const canvas = document.querySelector('#ar-canvas');
const statusBadge = document.querySelector('#status-badge');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Éclairage
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Modèle 3D et Ancrage
const modelGroup = new THREE.Group();
scene.add(modelGroup);

const anchorManager = new ARAnchorManager(scene, modelGroup);

const loader = new GLTFLoader();
loader.load(
    'models/foret_site.glb',
    (gltf) => { modelGroup.add(gltf.scene); },
    null,
    (err) => { console.warn('Ajoutez votre fichier foret_site.glb dans /models/'); }
);

const trackerNode = new THREE.Object3D();
scene.add(trackerNode);
let trackerIsVisible = false;

// -------------------------------------------------------------
// Activation de la caméra arrière et injection en fond Three.js
// -------------------------------------------------------------
async function initWebcam() {
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false
        });
        
        video.srcObject = stream;
        await video.play();

        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        scene.background = videoTexture;

        if (statusBadge) {
            statusBadge.textContent = 'Caméra active - Recherche du cube...';
        }
    } catch (err) {
        console.error('Erreur d\'accès à la caméra :', err);
        if (statusBadge) {
            statusBadge.textContent = 'Erreur : Caméra refusée ou non supportée';
            statusBadge.className = 'badge-searching';
        }
    }
}

initWebcam();

// Redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Boucle d'animation
function animate() {
    if (trackerIsVisible) {
        anchorManager.updateFromTracker(trackerNode);
        if (statusBadge) {
            statusBadge.textContent = 'Ancrage actif - Lissage 360°';
            statusBadge.className = 'badge-tracking';
        }
    }

    anchorManager.updateFrame();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
