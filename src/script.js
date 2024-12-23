import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"
import { GroundedSkybox } from "three/addons/objects/GroundedSkybox.js"
import GUI from 'lil-gui'

/**
 * Loaders
 */

const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Environment Map
 */

scene.environmentIntensity = 1
scene.backgroundBlurriness = 0
scene.backgroundIntensity = 5

// LDR Cube
// const environmentMap = cubeTextureLoader.load([
//     '/environmentMaps/0/px.png',
//     '/environmentMaps/0/nx.png',
//     '/environmentMaps/0/py.png',
//     '/environmentMaps/0/ny.png',
//     '/environmentMaps/0/pz.png',
//     '/environmentMaps/0/nz.png',
// ])

// scene.environment = environmentMap
// scene.background = environmentMap

// HDR (RGBE) Equirectangular
// rgbeLoader.load("/environmentMaps/2/2k.hdr", (envMap) => {
//     envMap.mapping = THREE.EquirectangularReflectionMapping

//     scene.environment = envMap
//     // scene.background = envMap

//     // Skybox
//     const skybox = new GroundedSkybox(envMap, 15, 70)
//     skybox.position.y = 15
//     scene.add(skybox)
// })

// HDR (EXR) Equirectangular

// LDR Equirectangular
// const envMap = textureLoader.load("/environmentMaps/blockadesLabsSkybox/fantasy_lands_castles_at_night.jpg")
// envMap.mapping = THREE.EquirectangularReflectionMapping
// envMap.colorSpace = THREE.SRGBColorSpace

// scene.environment = envMap
// scene.background = envMap

// Real-Time Environment Map
const envMap = textureLoader.load("/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg")
envMap.mapping = THREE.EquirectangularReflectionMapping
envMap.colorSpace = THREE.SRGBColorSpace

scene.background = envMap

// Holy Donut
const holyDonut = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.5),
    new THREE.MeshBasicMaterial({color: new THREE.Color(10, 4, 2)})
)

holyDonut.position.y = 3.5
holyDonut.layers.enable(1)
scene.add(holyDonut)

// Cube Render Target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType })
scene.environment = cubeRenderTarget.texture

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget)
cubeCamera.layers.set(1)

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001)
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001)
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001)
gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('backgroundRotationY')
gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('environmentRotationY')

// Lights
const ambiantLight = new THREE.AmbientLight( 0x404040 )
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(5, -5, 5)

// scene.add(ambiantLight)
// scene.add(directionalLight)

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 64),
    new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.1,
        metalness: 1,
        wireframe: false
    })
)
torusKnot.position.y = 4
torusKnot.position.x = -4
scene.add(torusKnot)

gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf",
    (object) => {
        object.scene.scale.set(10, 10, 10)
        scene.add(object.scene)
    },
    (progress) => {},
    (err) => {
        console.log("Error", err)
    },
)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()

    if (holyDonut) {
        
        holyDonut.rotation.x = Math.sin(elapsedTime);
        cubeCamera.update(renderer, scene)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()