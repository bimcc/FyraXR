import * as THREE from 'three';

export class ARManager extends THREE.EventDispatcher {
    constructor(renderer, scene, camera) {
        super();
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.session = null;
        this.referenceSpace = null;
        this.hitTestSource = null;
        
        this.setupXR();
    }
    
    setupXR() {
        // 检查WebXR支持
        if ('xr' in navigator) {
            navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
                if (supported) {
                    console.log('设备支持WebXR AR');
                } else {
                    console.warn('设备不支持WebXR AR');
                }
            });
        } else {
            console.warn('浏览器不支持WebXR');
        }
    }
    
    // 修改startARSession方法，添加iOS优化
    // 修改startARSession方法，添加iOS优化
    async startARSession() {
        if (!navigator.xr) {
            throw new Error('WebXR不可用');
        }
        
        try {
            // iOS设备的特殊配置
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const sessionOptions = {
                requiredFeatures: ['local'],
                optionalFeatures: ['hit-test', 'dom-overlay']
            };
            
            // iOS设备可能需要不同的配置
            if (isIOS) {
                console.log('为iOS设备配置WebXR会话');
                // iOS可能对某些功能支持有限，使用更保守的配置
                sessionOptions.optionalFeatures = ['hit-test'];
            }
            
            // 添加dom-overlay配置（如果UI元素存在）
            const uiOverlay = document.getElementById('ui-overlay');
            if (uiOverlay) {
                sessionOptions.domOverlay = { root: uiOverlay };
            }
            
            // 请求AR会话
            this.session = await navigator.xr.requestSession('immersive-ar', sessionOptions);
            
            // 设置渲染器的XR会话
            await this.renderer.xr.setSession(this.session);
            
            // 获取参考空间
            this.referenceSpace = await this.session.requestReferenceSpace('local');
            
            // 设置hit test（iOS可能需要特殊处理）
            await this.setupHitTest();
            
            // 设置会话事件监听
            this.session.addEventListener('end', () => {
                this.onSessionEnd();
            });
            
            this.dispatchEvent({ type: 'sessionstart' });
            
        } catch (error) {
            console.error('启动AR会话失败:', error);
            
            // iOS特定的错误提示
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                console.error('iOS设备AR启动失败，请检查：');
                console.error('1. iOS版本是否为14.3+');
                console.error('2. 是否使用Safari或支持WebXR的浏览器');
                console.error('3. 设备是否支持ARKit');
                console.error('4. 是否授予了相机权限');
            }
            
            throw error;
        }
    }
    
    async setupHitTest() {
        if (this.session.requestHitTestSource) {
            const viewerSpace = await this.session.requestReferenceSpace('viewer');
            this.hitTestSource = await this.session.requestHitTestSource({ space: viewerSpace });
        }
    }
    
    stopARSession() {
        if (this.session) {
            this.session.end();
        }
    }
    
    onSessionEnd() {
        this.session = null;
        this.referenceSpace = null;
        this.hitTestSource = null;
        this.dispatchEvent({ type: 'sessionend' });
    }
    
    // 获取hit test结果
    getHitTestResults(frame) {
        if (!this.hitTestSource) return [];
        
        try {
            return frame.getHitTestResults(this.hitTestSource);
        } catch (error) {
            console.warn('获取hit test结果失败:', error);
            return [];
        }
    }
    
    // 将hit test结果转换为Three.js坐标
    hitResultToPosition(hitResult) {
        const hitPose = hitResult.getPose(this.referenceSpace);
        if (hitPose) {
            const position = new THREE.Vector3();
            position.setFromMatrixPosition(new THREE.Matrix4().fromArray(hitPose.transform.matrix));
            return position;
        }
        return null;
    }
    
    // 检查WebXR支持的方法
    // 在ARManager类中添加iOS设备检测方法
    async checkiOSSupport() {
        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        
        if (isIOS) {
            console.log('检测到iOS设备');
            
            // 检查iOS版本
            const iOSVersion = userAgent.match(/OS (\d+)_(\d+)/);
            if (iOSVersion) {
                const majorVersion = parseInt(iOSVersion[1]);
                const minorVersion = parseInt(iOSVersion[2]);
                
                if (majorVersion >= 14 && minorVersion >= 3) {
                    console.log(`iOS版本 ${majorVersion}.${minorVersion} 支持WebXR`);
                    return true;
                } else {
                    console.warn(`iOS版本 ${majorVersion}.${minorVersion} 不支持WebXR，需要14.3+`);
                    return false;
                }
            }
        }
        
        return !isIOS; // 非iOS设备返回true继续检查
    }
    
    // 修改checkWebXRSupport方法
    async checkWebXRSupport() {
        console.log('检查WebXR支持...');
        
        // 首先检查iOS支持
        const iOSSupported = await this.checkiOSSupport();
        if (!iOSSupported) {
            return false;
        }
        
        if (!navigator.xr) {
            console.error('WebXR不可用');
            return false;
        }
        
        try {
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            console.log('AR会话支持:', supported);
            
            if (!supported) {
                // 检查可能的原因
                console.log('用户代理:', navigator.userAgent);
                console.log('平台:', navigator.platform);
                
                // iOS设备特殊提示
                if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
                    console.log('iOS设备检测到：');
                    console.log('- 确保iOS 14.3+');
                    console.log('- 使用Safari或支持WebXR的Chrome');
                    console.log('- 设备支持ARKit');
                    console.log('- 在Safari设置中启用WebXR（如果需要）');
                }
            }
            
            return supported;
        } catch (error) {
            console.error('检查WebXR支持时出错:', error);
            return false;
        }
    }
}
