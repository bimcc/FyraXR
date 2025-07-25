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
            // 创建带错误处理的资源加载器
            const loadWithErrorHandling = async (resourceUrl) => {
                try {
                    const response = await fetch(resourceUrl, { 
                        method: 'HEAD',
                        cache: 'no-cache' 
                    });
                    
                    if (response.ok) {
                        console.log(`✅ 资源可访问: ${resourceUrl}`);
                        
                        // 优先使用全局对象以支持GitHub Pages环境
                        let TilesRendererClass = window.TilesRenderer || TilesRenderer;
                        
                        // 创建TilesRenderer实例
                        const tileRenderer = new TilesRendererClass(resourceUrl);
                        return tileRenderer;
                    } else {
                        console.warn(`❌ 资源不可访问 (${response.status}): ${resourceUrl}`);
                        return null;
                    }
                } catch (err) {
                    console.warn(`❌ 检查资源失败: ${resourceUrl}`, err);
                    return null;
                }
            };
            
            // 先尝试直接使用提供的URL
            this.tilesRenderer = await loadWithErrorHandling(url);
            
            // 如果直接URL失败，尝试备用路径
            if (!this.tilesRenderer) {
                console.log('直接URL加载失败，尝试其他路径...');
                
                // 尝试各种可能的路径组合
                const pathCombinations = [];
                
                // 检测GitHub Pages环境
                const isGitHubPages = window.location.hostname.includes('github.io');
                const repoName = isGitHubPages ? '/FyraXR' : '';
                
                // 获取基础路径
                const basePath = window.location.pathname.includes('/FyraXR/') 
                    ? '/FyraXR/' 
                    : '/';
                
                // 生成可能的替代路径
                const alternativePaths = [
                    // 相对路径
                    './models/mj/tileset.json',
                    '../models/mj/tileset.json',
                    
                    // 基于当前环境的绝对路径
                    `${basePath}models/mj/tileset.json`,
                    
                    // GitHub Pages特定路径
                    '/FyraXR/models/mj/tileset.json',
                    
                    // GitHub Pages根路径
                    `${repoName}/models/mj/tileset.json`,
                    
                    // 完整URL
                    `${window.location.origin}${repoName}/models/mj/tileset.json`,
                ];
                
                // 尝试每一个备用路径
                for (const path of alternativePaths) {
                    console.log(`尝试备用路径: ${path}`);
                    this.tilesRenderer = await loadWithErrorHandling(path);
                    if (this.tilesRenderer) {
                        console.log(`✅ 成功使用备用路径: ${path}`);
                        break;
                    }
                }
                
                if (!this.tilesRenderer) {
                    throw new Error('所有路径尝试失败');
                }
            }
            
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