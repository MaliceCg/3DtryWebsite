import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import gsap from 'gsap'

import { Vector2 } from 'three'



/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI()
gui.hide()
debugObject.clearColor = '#00d5ff'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
self.scene = scene;
/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()
const bakedTexture = textureLoader.load('bak.jpg')
bakedTexture.flipY = false


// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Materials 
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })

//Model 
gltfLoader.load(
    'tiki.glb',
    (gltf) =>
    {  gltf.scene.traverse((child) =>
        {
            child.material = bakedMaterial
        })
        scene.add(gltf.scene)
    }
)
/**
  * Labels
 */   
const raycaster = new THREE.Raycaster()
const points = [
    {
        position: new THREE.Vector3(-2.8, 4, 3.5),
        element: document.querySelector('.point--rezo'),
       
    },
    {
        position: new THREE.Vector3(1.2, 5, 0.9),
        element: document.querySelector('.point--defis'),
        
    },
    {
        position: new THREE.Vector3(3, 2, 1.1),
        element: document.querySelector('.point--presentation'),
    },
    {
        position: new THREE.Vector3(3.8, 2, -3),
        element: document.querySelector('.point--cagnotte'),
    },

]

    

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 8
camera.position.z = 15
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
window.addEventListener('keydown',(event) => 
{
    if (event.key === 'h')
    { if (gui._hidden) gui.show()
      else gui.hide()} 

})
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(debugObject.clearColor)

/**
 * Animate
 */
const clock = new THREE.Clock()

/** Animation caméra debut à l'arrivé sur le site */
document.body.classList.add('camera-moving');
gsap.to(camera.position, {
        duration: 4,
        x:  5,
        y: 5,
        z: 14,
  delay: 1.5,
        onUpdate: () => {
    controls.target.set(defaultControlsPosition.x, defaultControlsPosition.y, defaultControlsPosition.z);
        },
  onComplete: () => {
    document.body.classList.remove('camera-moving');
  },
    });





const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()
    //Follow points
    for(const point of points)
    {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)

        raycaster.setFromCamera(screenPosition, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)

        if(intersects.length === 0)
        {
            point.element.classList.add('visible')
        }
        else
        {
            const intersectionDistance = intersects[0].distance
            const pointDistance = point.position.distanceTo(camera.position)

            if(intersectionDistance < pointDistance)
            {
                point.element.classList.remove('visible')
            }
            else
            {
                point.element.classList.add('visible')
            }
        
            }
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`

        }
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick();
