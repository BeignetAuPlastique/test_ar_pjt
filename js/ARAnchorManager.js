import * as THREE from 'three';

/**
 * Gestionnaire d'ancrage WebAR hybride
 * Dissocie le modèle 3D du marqueur brut pour éviter les décrochages à 360°,
 * applique un lissage temporel LERP/SLERP et gère un filtre par zone morte anti-dérive.
 */
export class ARAnchorManager {
    /**
     * @param {THREE.Scene} scene - Scène principale Three.js
     * @param {THREE.Object3D} modelGroup - Groupe contenant le modèle 3D
     */
    constructor(scene, modelGroup) {
        this.scene = scene;
        this.modelGroup = modelGroup;
        
        // Poses cibles vers lesquelles le modèle glisse
        this.targetPosition = new THREE.Vector3();
        this.targetQuaternion = new THREE.Quaternion();
        
        // Configuration des seuils & vitesse d'amortissement
        this.lerpFactor = 0.08;         // Vitesse d'amortissement (0.05 à 0.12)
        this.positionThreshold = 0.03;  // Zone morte position (3 cm)
        this.rotationThreshold = 0.05;  // Zone morte rotation (~2.8 deg)
        
        this.isAnchored = false;
        
        // Objets temporaires réutilisés pour préserver le GC
        this._tmpPos = new THREE.Vector3();
        this._tmpQuat = new THREE.Quaternion();
        this._tmpScale = new THREE.Vector3();
    }

    /**
     * Mis à jour depuis la détection de la cible AR
     * @param {THREE.Object3D} trackerNode - Repère brut du marqueur
     */
    updateFromTracker(trackerNode) {
        trackerNode.getWorldPosition(this._tmpPos);
        trackerNode.getWorldQuaternion(this._tmpQuat);

        // Ancrage initial instantané
        if (!this.isAnchored) {
            this.modelGroup.position.copy(this._tmpPos);
            this.modelGroup.quaternion.copy(this._tmpQuat);
            this.targetPosition.copy(this._tmpPos);
            this.targetQuaternion.copy(this._tmpQuat);
            this.isAnchored = true;
            return;
        }

        // Évaluation de la dérive par rapport à la pose cible
        const deltaDist = this.targetPosition.distanceTo(this._tmpPos);
        const deltaAngle = this.targetQuaternion.angleTo(this._tmpQuat);

        // Application du filtre de zone morte
        if (deltaDist > this.positionThreshold || deltaAngle > this.rotationThreshold) {
            this.targetPosition.copy(this._tmpPos);
            this.targetQuaternion.copy(this._tmpQuat);
        }
    }

    /**
     * Exécuté à chaque frame de rendu
     */
    updateFrame() {
        if (!this.isAnchored) return;

        // Lissage continu de la position et de la rotation
        this.modelGroup.position.lerp(this.targetPosition, this.lerpFactor);
        this.modelGroup.quaternion.slerp(this.targetQuaternion, this.lerpFactor);
    }
}
