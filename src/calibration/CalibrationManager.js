export class CalibrationManager {
    constructor() {
        this.calibrationData = {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        };
        
        this.loadCalibration();
    }
    
    setPosition(x, y, z) {
        this.calibrationData.position = { x, y, z };
    }
    
    setRotation(x, y, z) {
        this.calibrationData.rotation = { x, y, z };
    }
    
    setScale(x, y, z) {
        this.calibrationData.scale = { x, y, z };
    }
    
    getCalibrationData() {
        return this.calibrationData;
    }
    
    saveCalibration() {
        localStorage.setItem('fyraxr-calibration', JSON.stringify(this.calibrationData));
        console.log('Calibration saved:', this.calibrationData);
    }
    
    loadCalibration() {
        const saved = localStorage.getItem('fyraxr-calibration');
        if (saved) {
            this.calibrationData = JSON.parse(saved);
            console.log('Calibration loaded:', this.calibrationData);
        }
    }
    
    resetCalibration() {
        this.calibrationData = {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        };
        this.saveCalibration();
    }
}