import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARAnchorManager } from './ARAnchorManager.js';

// Initialisation de la scène Three.js
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

// Éclairage ambiant et directionnel pour environnement extérieur
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Groupe du modèle 3D désolidarisé
const modelGroup = new THREE.Group();
scene.add(modelGroup);

// Gestionnaire d'ancrage hybride
const anchorManager = new ARAnchorManager(scene, modelGroup);

// Chargement du modèle 3D du site en forêt
const loader = new GLTFLoader();
loader.load(
    'models/foret_site.glb',
    (gltf) => {
        modelGroup.add(gltf.scene);
        console.log('Modèle site forêt chargé avec succès.');
    },
    (xhr) => {
        console.log(`Chargement 3D: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
    },
    (error) => {
        console.warn('Fichier foret_site.glb non trouvé dans ./models/. Ajoutez votre fichier .glb.');
    }
);

// Noeud de tracking brut du marqueur 3D
const trackerNode = new THREE.Object3D();
scene.add(trackerNode);

// Variable d'état pour la détection
let trackerIsVisible = false;

// Redimensionnement réactif
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Boucle d'animation principale
function animate() {
    if (trackerIsVisible) {
        anchorManager.updateFromTracker(trackerNode);
        if (statusBadge) {
            statusBadge.textContent = 'Ancrage actif - Lissage 360°';
            statusBadge.className = 'badge-tracking';
        }
    }

    // Le lissage s'exécute à chaque frame
    anchorManager.updateFrame();

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
