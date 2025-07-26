export class ARManager extends EventTarget {
    constructor(renderer, scene, camera) {
        super();
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.session = null;
        this.isSupported = false;
        
        this.checkARSupport();
    }
    
    async checkARSupport() {
        if ('xr' in navigator) {
            this.isSupported = await navigator.xr.isSessionSupported('immersive-ar');
            console.log('AR Support:', this.isSupported);
        } else {
            console.log('WebXR not supported');
        }
    }
    
    async startARSession() {
        if (!this.isSupported) {
            throw new Error('AR not supported');
        }
        
        try {
            this.session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local-floor'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.getElementById('ui-overlay') }
            });
            
            await this.renderer.xr.setSession(this.session);
            this.dispatchEvent(new Event('sessionstart'));
            
        } catch (error) {
            console.error('Failed to start AR session:', error);
            throw error;
        }
    }
    
    endARSession() {
        if (this.session) {
            this.session.end();
            this.session = null;
            this.dispatchEvent(new Event('sessionend'));
        }
    }
}