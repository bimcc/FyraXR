export class UIController {
    constructor(app) {
        this.app = app;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // AR控制
        document.getElementById('ar-button').addEventListener('click', () => {
            if (this.app.isARActive) {
                this.app.stopAR();
            } else {
                this.app.startAR();
            }
        });
        
        // 标定控制
        document.getElementById('calibrate-button').addEventListener('click', () => {
            this.toggleCalibrationPanel();
        });
        
        // 透明度控制
        const opacitySlider = document.getElementById('opacity-slider');
        opacitySlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('opacity-value').textContent = value;
            this.app.tilesManager.setOpacity(value);
        });
        
        // 其他控制...
    }
    
    updateARStatus(status) {
        document.getElementById('ar-status').textContent = status;
        const button = document.getElementById('ar-button');
        const calibrateButton = document.getElementById('calibrate-button');
        
        if (this.app.isARActive) {
            button.textContent = '停止AR';
            calibrateButton.disabled = false;
        } else {
            button.textContent = '启动AR';
            calibrateButton.disabled = true;
        }
    }
    
    updateTilesStatus(status) {
        document.getElementById('tiles-status').textContent = status;
    }
    
    toggleCalibrationPanel() {
        const panel = document.getElementById('calibration-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
    
    // 添加iOS设备检测和提示方法
    showIOSInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
            const instructions = document.createElement('div');
            instructions.id = 'ios-instructions';
            instructions.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                z-index: 1000;
                max-width: 300px;
            `;
            
            instructions.innerHTML = `
                <h3>iOS设备WebXR使用说明</h3>
                <p>• 确保iOS版本14.3+</p>
                <p>• 使用Safari浏览器</p>
                <p>• 允许相机权限</p>
                <p>• 设备需支持ARKit</p>
                <button onclick="this.parentElement.remove()">我知道了</button>
            `;
            
            document.body.appendChild(instructions);
            
            // 3秒后自动消失
            setTimeout(() => {
                if (instructions.parentElement) {
                    instructions.remove();
                }
            }, 5000);
        }
    }
}