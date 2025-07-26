import * as THREE from 'three';
import { TilesRenderer } from '3d-tiles-renderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ARManager } from './ar/ARManager.js';
import { CalibrationManager } from './calibration/CalibrationManager.js';
import { UIController } from './ui/uicontroller.js';
import { TilesManager } from './tiles/TilesManager.js';

class FyraXRApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null; // 添加控制器
        this.arManager = null;
        this.calibrationManager = null;
        this.uiController = null;
        this.tilesManager = null;
        
        this.isARActive = false;
        this.animationId = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.setupThreeJS();
            this.setupManagers();
            this.setupEventListeners();
            await this.loadDefaultTileset();
            this.startRenderLoop();
            
            console.log('FyraXR应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
        }
    }
    
    setupThreeJS() {
        // 创建场景
        this.scene = new THREE.Scene();
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 5, 10);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.xr.enabled = true;
        
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // 添加轨道控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // 启用阻尼效果
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 1000;
        this.controls.maxPolarAngle = Math.PI; // 允许完全旋转
        
        // 添加基础光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    setupManagers() {
        // 初始化各个管理器
        this.arManager = new ARManager(this.renderer, this.scene, this.camera);
        this.calibrationManager = new CalibrationManager();
        this.uiController = new UIController(this);
        this.tilesManager = new TilesManager(this.scene, this.camera, this.renderer);
    }
    
    setupEventListeners() {
        // 窗口大小调整
        window.addEventListener('resize', () => this.onWindowResize());
        
        // AR状态变化监听
        this.arManager.addEventListener('sessionstart', () => {
            this.isARActive = true;
            this.uiController.updateARStatus('AR已启动');
            console.log('AR会话已启动');
        });
        
        this.arManager.addEventListener('sessionend', () => {
            this.isARActive = false;
            this.uiController.updateARStatus('AR已结束');
            console.log('AR会话已结束');
        });
    }
    
    async loadDefaultTileset() {
        // 获取基础路径
        const basePath = window.location.pathname.includes('/FyraXR/') 
            ? '/FyraXR' 
            : '';
        
        console.log('🌐 Tileset加载基础路径:', basePath);
        
        // 修正路径指向正确的mj模型位置
        const tilesetUrls = [
            // 基于当前环境的模型数据
            `${basePath}/models/mj/tileset.json`,
            
            // 相对路径尝试
            './models/mj/tileset.json',
            
            // 备用绝对路径
            '/models/mj/tileset.json',
            
            // Cesium Ion示例数据（需要访问令牌）
            // 'https://assets.cesium.com/43978/tileset.json',
        ];
        
        for (const url of tilesetUrls) {
            try {
                console.log(`尝试加载tileset: ${url}`);
                await this.tilesManager.loadTileset(url);
                this.uiController.updateTilesStatus(`3D Tiles加载完成: ${url}`);
                console.log('3D Tiles模型加载成功!');
                return;
            } catch (error) {
                console.warn(`Tileset ${url} 加载失败:`, error);
            }
        }
        
        // 如果所有URL都失败，使用示例几何体
        console.warn('所有tileset加载失败，使用示例几何体');
        this.createExampleGeometry();
        this.uiController.updateTilesStatus('使用示例几何体');
    }
    
    createExampleGeometry() {
        // 创建示例几何体用于演示
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 1, -5);
        this.scene.add(cube);
        
        // 添加一些额外的几何体
        for (let i = 0; i < 5; i++) {
            const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const sphereMaterial = new THREE.MeshLambertMaterial({ 
                color: Math.random() * 0xffffff,
                transparent: true,
                opacity: 0.7
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 3,
                -5 + (Math.random() - 0.5) * 5
            );
            this.scene.add(sphere);
        }
    }
    
    onWindowResize() {
        // 更新相机宽高比
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // 更新渲染器尺寸
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // 更新控制器（OrbitControls会自动适应，只需要调用update）
        if (this.controls) {
            this.controls.update();
        }
    }
    
    startRenderLoop() {
        const animate = () => {
            this.animationId = this.renderer.setAnimationLoop(animate);
            
            // 更新控制器（仅在非AR模式下）
            if (this.controls && !this.isARActive) {
                this.controls.update();
            }
            
            // 更新3D Tiles
            if (this.tilesManager.tilesRenderer) {
                this.camera.updateMatrixWorld();
                this.tilesManager.tilesRenderer.update();
            }
            
            // 渲染场景
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
    
    // 公共方法供UI控制器调用
    async startAR() {
        try {
            // 在启动AR时禁用控制器
            if (this.controls) {
                this.controls.enabled = false;
            }
            await this.arManager.startARSession();
        } catch (error) {
            console.error('启动AR失败:', error);
            alert('启动AR失败: ' + error.message);
            // 如果AR启动失败，重新启用控制器
            if (this.controls) {
                this.controls.enabled = true;
            }
        }
    }
    
    stopAR() {
        this.arManager.stopARSession();
        // 停止AR时重新启用控制器
        if (this.controls) {
            this.controls.enabled = true;
        }
    }
    
    applyCalibration(calibrationData) {
        this.calibrationManager.applyCalibration(this.scene, calibrationData);
    }
    
    resetPosition() {
        this.calibrationManager.resetPosition(this.scene);
    }
}

// 启动应用
const app = new FyraXRApp();
window.fyraxrApp = app; // 全局访问