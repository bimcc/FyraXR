import { TilesRenderer } from '3d-tiles-renderer';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export class TilesManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.tilesRenderer = null;
        this.tilesGroup = new THREE.Group();
        this.tilesGroup.name = 'tilesGroup';
        this.scene.add(this.tilesGroup);
        
        this.setupLoaders();
    }
    
    setupLoaders() {
        // 设置DRACO解压缩支持（按照官方文档）
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://unpkg.com/three@0.166.0/examples/js/libs/draco/gltf/');
        
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);
        
        // 这将在创建TilesRenderer时使用
        this.gltfLoader = gltfLoader;
    }
    
    async loadTileset(url) {
        try {
            // 清理之前的tileset
            if (this.tilesRenderer) {
                this.tilesRenderer.dispose();
                this.tilesGroup.clear();
            }
            
            // 创建新的TilesRenderer（按照官方API）
            this.tilesRenderer = new TilesRenderer(url);
            this.tilesRenderer.setCamera(this.camera);
            this.tilesRenderer.setResolutionFromRenderer(this.camera, this.renderer);
            
            // 性能优化设置（可选）
            this.tilesRenderer.errorTarget = 6; // 降低错误阈值
            this.tilesRenderer.maxDepth = 15; // 限制最大深度
            this.tilesRenderer.loadSiblings = false; // 禁用兄弟节点加载
            
            // 添加GLTF加载器支持
            this.tilesRenderer.manager.addHandler(/\.(gltf|glb)$/g, this.gltfLoader);
            
            // 设置事件监听（按照官方示例）
            this.tilesRenderer.addEventListener('load-tile-set', () => {
                console.log('Tileset加载完成');
                
                // 可选：居中tileset（官方推荐方式）
                const sphere = new THREE.Sphere();
                this.tilesRenderer.getBoundingSphere(sphere);
                
                if (sphere.radius > 0) {
                    // 将tileset居中
                    this.tilesRenderer.group.position.copy(sphere.center).multiplyScalar(-1);
                }
            });
            
            this.tilesRenderer.addEventListener('load-model', ({ scene, tile }) => {
                console.log('模型加载:', tile.content.uri);
                
                // 按照官方文档处理材质
                scene.traverse((child) => {
                    if (child.isMesh && child.material) {
                        // 保存原始材质引用
                        child.originalMaterial = child.material;
                        
                        // 设置透明度支持
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.transparent = true;
                                mat.opacity = 0.8;
                            });
                        } else {
                            child.material.transparent = true;
                            child.material.opacity = 0.8;
                        }
                    }
                });
            });
            
            this.tilesRenderer.addEventListener('dispose-model', ({ scene }) => {
                // 清理自定义材质（按照官方建议）
                scene.traverse((child) => {
                    if (child.material && child.originalMaterial) {
                        // 恢复原始材质
                        child.material = child.originalMaterial;
                    }
                });
            });
            
            // 将tilesRenderer的group添加到场景
            this.tilesGroup.add(this.tilesRenderer.group);
            
            return this.tilesRenderer;
            
        } catch (error) {
            console.error('加载tileset失败:', error);
            throw error;
        }
    }
    
    // 更新tiles渲染（按照官方API）
    update() {
        if (this.tilesRenderer) {
            // 确保相机矩阵是最新的
            this.camera.updateMatrixWorld();
            this.tilesRenderer.update();
        }
    }
    
    // 设置tiles的可见性
    setVisible(visible) {
        this.tilesGroup.visible = visible;
    }
    
    // 设置tiles的透明度
    setOpacity(opacity) {
        this.tilesGroup.traverse((object) => {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => {
                        mat.transparent = true;
                        mat.opacity = opacity;
                    });
                } else {
                    object.material.transparent = true;
                    object.material.opacity = opacity;
                }
            }
        });
    }
    
    // 清理资源
    dispose() {
        if (this.tilesRenderer) {
            this.tilesRenderer.dispose();
            this.tilesRenderer = null;
        }
        this.tilesGroup.clear();
    }
}

