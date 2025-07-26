export class UIController {
    constructor(app) {
        this.app = app;
        this.isCollapsed = false;
        this.setupEventListeners();
        this.setupPanelCollapse();
    }
    
    setupEventListeners() {
        // AR Button
        const arButton = document.getElementById('ar-button');
        if (arButton) {
            arButton.addEventListener('click', () => this.toggleAR());
        }
        
        // Calibration Button
        const calibrateButton = document.getElementById('calibrate-button');
        if (calibrateButton) {
            calibrateButton.addEventListener('click', () => this.toggleCalibration());
        }
        
        // Reset Position Button
        const resetButton = document.getElementById('reset-position');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetPosition());
        }
        
        // Save Calibration Button
        const saveButton = document.getElementById('save-calibration');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveCalibration());
        }
        
        // Close Calibration Button
        const closeButton = document.getElementById('close-calibration');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeCalibration());
        }
        
        // Apply Calibration Button
        const applyButton = document.getElementById('apply-calibration');
        if (applyButton) {
            applyButton.addEventListener('click', () => this.applyCalibration());
        }
        
        // Opacity Slider
        const opacitySlider = document.getElementById('opacity-slider');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => this.updateOpacity(e.target.value));
        }
        
        // Scale Slider
        const scaleSlider = document.getElementById('scale-slider');
        if (scaleSlider) {
            scaleSlider.addEventListener('input', (e) => this.updateScale(e.target.value));
        }
        
        // Calibration Sliders
        this.setupCalibrationSliders();
    }
    
    setupPanelCollapse() {
        const collapseBtn = document.getElementById('collapse-btn');
        const panelContent = document.getElementById('panel-content');
        const panelHeader = document.getElementById('panel-header');
        
        if (collapseBtn && panelContent) {
            // 点击折叠按钮
            collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePanelCollapse();
            });
            
            // 点击标题栏也可以折叠
            panelHeader.addEventListener('click', () => {
                this.togglePanelCollapse();
            });
        }
    }
    
    togglePanelCollapse() {
        const collapseBtn = document.getElementById('collapse-btn');
        const panelContent = document.getElementById('panel-content');
        
        this.isCollapsed = !this.isCollapsed;
        
        if (this.isCollapsed) {
            panelContent.classList.add('collapsed');
            collapseBtn.textContent = '+';
        } else {
            panelContent.classList.remove('collapsed');
            collapseBtn.textContent = '−';
        }
    }
    
    setupCalibrationSliders() {
        const sliders = [
            { id: 'offset-x', valueId: 'offset-x-value' },
            { id: 'offset-y', valueId: 'offset-y-value' },
            { id: 'offset-z', valueId: 'offset-z-value' },
            { id: 'rotation-y', valueId: 'rotation-y-value', suffix: '°' }
        ];
        
        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const valueElement = document.getElementById(slider.valueId);
            
            if (element && valueElement) {
                element.addEventListener('input', (e) => {
                    const value = e.target.value;
                    valueElement.textContent = value + (slider.suffix || '');
                });
            }
        });
    }
    
    async toggleAR() {
        try {
            if (this.app.isARActive) {
                this.app.arManager.endARSession();
            } else {
                await this.app.arManager.startARSession();
            }
        } catch (error) {
            console.error('AR toggle failed:', error);
            this.updateARStatus('AR启动失败');
        }
    }
    
    toggleCalibration() {
        const panel = document.getElementById('calibration-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    closeCalibration() {
        const panel = document.getElementById('calibration-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    applyCalibration() {
        const offsetX = parseFloat(document.getElementById('offset-x').value);
        const offsetY = parseFloat(document.getElementById('offset-y').value);
        const offsetZ = parseFloat(document.getElementById('offset-z').value);
        const rotationY = parseFloat(document.getElementById('rotation-y').value);
        
        // 应用标定参数
        this.app.calibrationManager.applyCalibration({
            offset: { x: offsetX, y: offsetY, z: offsetZ },
            rotation: { y: rotationY }
        });
        
        this.updateARStatus('标定已应用');
    }
    
    resetPosition() {
        this.app.calibrationManager.resetCalibration();
        this.updateARStatus('位置已重置');
        
        // 重置滑块值
        document.getElementById('offset-x').value = 0;
        document.getElementById('offset-y').value = 0;
        document.getElementById('offset-z').value = 0;
        document.getElementById('rotation-y').value = 0;
        
        // 更新显示值
        document.getElementById('offset-x-value').textContent = '0';
        document.getElementById('offset-y-value').textContent = '0';
        document.getElementById('offset-z-value').textContent = '0';
        document.getElementById('rotation-y-value').textContent = '0°';
    }
    
    saveCalibration() {
        this.app.calibrationManager.saveCalibration();
        this.updateARStatus('标定已保存');
    }
    
    updateOpacity(value) {
        const opacityValue = document.getElementById('opacity-value');
        if (opacityValue) {
            opacityValue.textContent = value;
        }
        // Apply opacity to 3D objects
        if (this.app.tilesManager && this.app.tilesManager.setOpacity) {
            this.app.tilesManager.setOpacity(parseFloat(value));
        }
    }
    
    updateScale(value) {
        const scaleValue = document.getElementById('scale-value');
        if (scaleValue) {
            scaleValue.textContent = value;
        }
        // Apply scale to 3D objects
        if (this.app.tilesManager && this.app.tilesManager.scaleModel) {
            this.app.tilesManager.scaleModel(parseFloat(value));
        }
    }
    
    updateARStatus(status) {
        const statusElement = document.getElementById('ar-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    updateTilesStatus(status) {
        const statusElement = document.getElementById('tiles-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    // 显示/隐藏控制面板
    showPanel() {
        const panel = document.getElementById('control-panel');
        if (panel) {
            panel.style.display = 'block';
        }
    }
    
    hidePanel() {
        const panel = document.getElementById('control-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
}