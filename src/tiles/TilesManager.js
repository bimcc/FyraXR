import { TilesRenderer } from '3d-tiles-renderer';
import * as THREE from 'three';

export class TilesManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.tilesRenderer = null;
        this.group = new THREE.Group();
        this.scene.add(this.group);
    }

    async loadTileset(url) {
        console.log('开始加载tileset:', url);
        
        try {
            // 创建TilesRenderer实例
            this.tilesRenderer = new TilesRenderer(url);
            
            // 设置相机和分辨率
            this.tilesRenderer.setCamera(this.camera);
            this.tilesRenderer.setResolutionFromRenderer(this.camera, this.renderer);
            
            // 监听tileset加载完成事件
            this.tilesRenderer.addEventListener('load-tile-set', () => {
                console.log('Tileset加载完成!');
                
                // 获取边界球并优化显示
                this.optimizeModelView();
            });
            
            // 监听加载错误
            this.tilesRenderer.addEventListener('load-tile-set-failed', (error) => {
                console.error('Tileset加载失败:', error);
            });
            
            // 将tilesRenderer的group添加到场景
            this.group.add(this.tilesRenderer.group);
            
            console.log('TilesRenderer已创建并添加到场景');
            
            return Promise.resolve();
            
        } catch (error) {
            console.error('创建TilesRenderer时出错:', error);
            throw error;
        }
    }
    
    // 优化模型视图的方法
    optimizeModelView() {
        if (!this.tilesRenderer) return;
        
        const sphere = new THREE.Sphere();
        this.tilesRenderer.getBoundingSphere(sphere);
        
        console.log('模型边界球:', sphere);
        
        // 将模型居中到原点
        this.tilesRenderer.group.position.copy(sphere.center).multiplyScalar(-1);
        
        // 计算合适的相机距离和位置
        const radius = sphere.radius;
        
        // 如果模型太小，增加一个最小显示半径
        const minRadius = 50;
        const effectiveRadius = Math.max(radius, minRadius);
        
        // 设置相机距离为模型半径的3-4倍，确保能看到完整模型
        const cameraDistance = effectiveRadius * 3.5;
        
        // 设置一个倾斜的俯视角度，更好地展示建筑模型
        const cameraHeight = effectiveRadius * 2;
        const cameraOffset = effectiveRadius * 2;
        
        this.camera.position.set(
            cameraOffset,
            cameraHeight,
            cameraDistance
        );
        
        // 相机看向模型中心（现在在原点）
        this.camera.lookAt(0, 0, 0);
        
        // 调整相机的近远裁剪面
        this.camera.near = effectiveRadius * 0.01;
        this.camera.far = effectiveRadius * 100;
        this.camera.updateProjectionMatrix();
        
        console.log('相机位置已优化:', this.camera.position);
        console.log('模型半径:', radius, '有效半径:', effectiveRadius);
        console.log('相机距离:', cameraDistance);
    }
    
    // 在渲染循环中调用此方法
    update() {
        if (this.tilesRenderer) {
            // 确保相机矩阵是最新的
            this.camera.updateMatrixWorld();
            // 更新tiles渲染器
            this.tilesRenderer.update();
        }
    }
    
    // 手动调整相机到模型中心的方法
    centerCamera() {
        this.optimizeModelView();
        console.log('相机已手动重新居中到模型');
    }
    
    // 缩放模型的方法
    scaleModel(scaleFactor) {
        if (this.tilesRenderer) {
            this.tilesRenderer.group.scale.setScalar(scaleFactor);
            console.log('模型缩放因子设置为:', scaleFactor);
        }
    }
    
    // 重置视图的方法
    resetView() {
        if (this.tilesRenderer) {
            this.tilesRenderer.group.scale.setScalar(1);
            this.optimizeModelView();
            console.log('视图已重置');
        }
    }
}