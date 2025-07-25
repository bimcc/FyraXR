import * as THREE from 'three';

export class CalibrationManager {
    constructor() {
        this.calibrationData = {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(1, 1, 1)
        };
        
        this.loadCalibrationData();
    }
    
    applyCalibration(scene, data) {
        if (data) {
            this.calibrationData = { ...this.calibrationData, ...data };
        }
        
        // 查找tiles组并应用变换
        const tilesGroup = scene.getObjectByName('tilesGroup');
        if (tilesGroup) {
            tilesGroup.position.copy(this.calibrationData.position);
            tilesGroup.rotation.copy(this.calibrationData.rotation);
            tilesGroup.scale.copy(this.calibrationData.scale);
        }
    }
    
    resetPosition(scene) {
        this.calibrationData = {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(1, 1, 1)
        };
        this.applyCalibration(scene);
    }
    
    saveCalibrationData() {
        localStorage.setItem('fyraxr-calibration', JSON.stringify({
            position: this.calibrationData.position.toArray(),
            rotation: this.calibrationData.rotation.toArray(),
            scale: this.calibrationData.scale.toArray()
        }));
    }
    
    loadCalibrationData() {
        const saved = localStorage.getItem('fyraxr-calibration');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.calibrationData.position.fromArray(data.position);
                this.calibrationData.rotation.fromArray(data.rotation);
                this.calibrationData.scale.fromArray(data.scale);
            } catch (error) {
                console.warn('加载标定数据失败:', error);
            }
        }
    }
}