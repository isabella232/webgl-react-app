import { TweenLite } from 'gsap/gsap-core';
import { Mesh, RingBufferGeometry, ShaderMaterial } from 'three';
import BaseScene from '../base/base-scene';
import { TWO_PI, VECTOR_ZERO } from '../../utils/math';

export default class PreloaderScene extends BaseScene {
  constructor() {
    super({ id: 'preloader' });
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(VECTOR_ZERO);
  }

  /**
   * Create and setup any objects for the scene
   *
   * @memberof PreloaderScene
   */
  createSceneObjects = (resolve: Function, reject: Function) => {
    try {
      // Create a spinner mesh to show loading progression
      this.spinner = new Mesh(
        new RingBufferGeometry(0.9, 1, 32, 1, 0, TWO_PI * 0.75),
        new ShaderMaterial({
          transparent: true,
          uniforms: {
            opacity: { value: 0 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float opacity;
            varying vec2 vUv;
            void main() {
              gl_FragColor = vec4(vUv, 1.0, vUv.y * opacity);
            }
        `
        })
      );
      this.scene.add(this.spinner);
      this.animateInit();
      resolve();
    } catch (error) {
      reject(error);
    }
  };

  animateInit = () => {
    TweenLite.killTweensOf(this.spinner.material.uniforms.opacity);
    this.spinner.material.uniforms.opacity.value = 0;
  };

  animateIn = () => {
    return new Promise((resolve, reject) => {
      TweenLite.to(this.spinner.material.uniforms.opacity, 1, {
        value: 1,
        onComplete: () => {
          resolve();
        }
      });
    });
  };

  animateOut = () => {
    return new Promise((resolve, reject) => {
      TweenLite.to(this.spinner.material.uniforms.opacity, 1, {
        value: 0,
        onComplete: () => {
          resolve();
        }
      });
    });
  };

  /**
   * Update loop
   *
   * @memberof PreloaderScene
   */
  update = (delta: Number) => {
    this.spinner.rotation.z -= delta * 2;
  };
}
