
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
//import asteroidPackUrl from './asteroids/asteroidPack.glb?url';
//import bgMusicUrl from './audio/young.mp3?url';
import bgTexture1 from '/images/1.jpg';
import bgTexture2 from '/images/2.jpg';
import bgTexture3 from '/images/3.jpg';
import bgTexture4 from '/images/4.jpg';
import sunTexture from '/images/sun.jpg';
import mercuryTexture from '/images/mercurymap.jpg';
import mercuryBump from '/images/mercurybump.jpg';
import venusTexture from '/images/venusmap.jpg';
import venusBump from '/images/venusmap.jpg';
import venusAtmosphere from '/images/venus_atmosphere.jpg';
import earthTexture from '/images/earth_daymap.jpg';
import earthNightTexture from '/images/earth_nightmap.jpg';
import earthAtmosphere from '/images/earth_atmosphere.jpg';
import earthMoonTexture from '/images/moonmap.jpg';
import earthMoonBump from '/images/moonbump.jpg';
import marsTexture from '/images/marsmap.jpg';
import marsBump from '/images/marsbump.jpg';
import jupiterTexture from '/images/jupiter.jpg';
import ioTexture from '/images/jupiterIo.jpg';
import europaTexture from '/images/jupiterEuropa.jpg';
import ganymedeTexture from '/images/jupiterGanymede.jpg';
import callistoTexture from '/images/jupiterCallisto.jpg';
import saturnTexture from '/images/saturnmap.jpg';
import satRingTexture from '/images/saturn_ring.png';
import uranusTexture from '/images/uranus.jpg';
import uraRingTexture from '/images/uranus_ring.png';
import neptuneTexture from '/images/neptune.jpg';
import plutoTexture from '/images/plutomap.jpg';






// ******  SETUP  ******
console.log("Create the scene");
const scene = new THREE.Scene();


console.log("Create a perspective projection camera");
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(-175, 115, 5);


// At the top of script.js


const listener = new THREE.AudioListener();
camera.add(listener);


const bgSound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();


// Use the imported file
/*audioLoader.load(bgMusicUrl, function(buffer) {
    bgSound.setBuffer(buffer);
    bgSound.setLoop(true);
    bgSound.setVolume(0.9);
    bgSound.play();
});
*/
audioLoader.load('/audio/young.mp3', function(buffer) {
    bgSound.setBuffer(buffer);
    bgSound.setLoop(true);
    bgSound.setVolume(0.9);
    bgSound.play();
});


// Browsers need user interaction before audio plays
window.addEventListener('click', () => {
  if (!bgSound.isPlaying) {
    bgSound.play();
  }
});


console.log("Create the renderer");
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;




console.log("Create an orbit control");
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;


console.log("Set up texture loader");
const cubeTextureLoader = new THREE.CubeTextureLoader();
const loadTexture = new THREE.TextureLoader();








// ******  POSTPROCESSING setup ******
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));








// ******  OUTLINE PASS  ******
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);








// ******  BLOOM PASS  ******
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = 1;
bloomPass.radius = 0.9;
composer.addPass(bloomPass);








// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
var lightAmbient = new THREE.AmbientLight(0x222222, 6);
scene.add(lightAmbient);








// ******  Star background  ******
scene.background = cubeTextureLoader.load([
  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);


// ****** STARFIELD BACKGROUND ******


// Geometry for stars
const starGeometry = new THREE.BufferGeometry();
const starCount = 2000; // number of stars


const starPositions = [];
for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starPositions.push(x, y, z);
}


starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starPositions, 3)
);


const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1.0,
  sizeAttenuation: true,
  transparent: true
});


// Create points object
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);






// ******  CONTROLS  ******
const gui = new dat.GUI({ autoPlace: false });
const customContainer = document.getElementById('gui-container');
customContainer.appendChild(gui.domElement);








// ****** SETTINGS FOR INTERACTIVE CONTROLS  ******
const settings = {
  accelerationOrbit: 1,
  acceleration: 1,
  sunIntensity: 1.9
};








gui.add(settings, 'accelerationOrbit', 0, 10).onChange(value => {
});
gui.add(settings, 'acceleration', 0, 10).onChange(value => {
});
gui.add(settings, 'sunIntensity', 1, 10).onChange(value => {
  sunMat.emissiveIntensity = value;
});








// mouse movement
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();




// ******  PLANET SPLITTING SYSTEM  ******
let planetSplitHalves = {}; // Store split hemisphere meshes
let planetIsSplit = {}; // Track split state


function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}








// ******  SELECT PLANET  ******
let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;








function onDocumentMouseDown(event) {
  event.preventDefault();








  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;








  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);








  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    selectedPlanet = identifyPlanet(clickedObject);
    if (selectedPlanet) {
      closeInfoNoZoomOut();
     
      settings.accelerationOrbit = 0; // Stop orbital movement








      // Update camera to look at the selected planet
      const planetPosition = new THREE.Vector3();
      selectedPlanet.planet.getWorldPosition(planetPosition);
      controls.target.copy(planetPosition);
      camera.lookAt(planetPosition); // Orient the camera towards the planet








      targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
      isMovingTowardsPlanet = true;
    }
  }
}








function identifyPlanet(clickedObject) {
  // Logic to identify which planet was clicked based on the clicked object, different offset for camera distance
        if (clickedObject.material === mercury.planet.material) {
          offset = 10;
          return mercury;
        } else if (clickedObject.material === venus.Atmosphere.material || clickedObject.material === venus.planet.material) {
          offset = 25;
          return venus;
        } else if (clickedObject.material === earth.Atmosphere.material || clickedObject.material === earth.planet.material) {
          offset = 25;
          return earth;
        } else if (clickedObject.material === mars.planet.material) {
          offset = 15;
          return mars;
        } else if (clickedObject.material === jupiter.Atmosphere.material || clickedObject.material === jupiter.planet.material) {
          offset = 50;
          return jupiter;
        } else if (clickedObject.material === saturn.Atmosphere.material || clickedObject.material === saturn.planet.material) {
          offset = 50;
          return saturn;
        } else if (clickedObject.material === uranus.Atmosphere.material || clickedObject.material === uranus.planet.material) {
          offset = 25;
          return uranus;
        } else if (clickedObject.material === neptune.Atmosphere.material || clickedObject.material === neptune.planet.material) {
          offset = 20;
          return neptune;
        } else if (clickedObject.material === pluto.planet.material) {
          offset = 10;
          return pluto;
        }








  return null;
}








// ******  SHOW PLANET INFO AFTER SELECTION  ******
function showPlanetInfo(planet) {
  var info = document.getElementById('planetInfo');
  var name = document.getElementById('planetName');
  var details = document.getElementById('planetDetails');








  name.innerText = planet;
  details.innerText = `Radius: ${planetData[planet].radius}\nTilt: ${planetData[planet].tilt}\nRotation: ${planetData[planet].rotation}\nOrbit: ${planetData[planet].orbit}\nDistance: ${planetData[planet].distance}\nMoons: ${planetData[planet].moons}\nInfo: ${planetData[planet].info}`;








  // Add split button for planets with layers
  const existingButton = document.getElementById('splitButton');
  if (existingButton) {
    existingButton.remove();
  }








  if (hasLayers(planet)) {
    const splitButton = document.createElement('button');
    splitButton.id = 'splitButton';
    splitButton.innerText = `Split ${planet}`;
    splitButton.style.cssText = `
      background: linear-gradient(135deg, #ff6b35, #ff8e53);
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 15px;
      transition: all 0.3s ease;
    `;
    splitButton.onclick = () => splitPlanet(planet);
    info.appendChild(splitButton);
  }








  info.style.display = 'block';
}








// ******  CHECK IF PLANET HAS LAYERS  ******
function hasLayers(planetName) {
  // All planets have internal layers now
  const planetsWithLayers = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  return planetsWithLayers.includes(planetName);
}








// ******  SPLIT PLANET FUNCTION  ******
function splitPlanet(planetName) {
  let planetObj;
 
  switch(planetName) {
    case 'Mercury':
      planetObj = mercury;
      break;
    case 'Venus':
      planetObj = venus;
      break;
    case 'Earth':
      planetObj = earth;
      break;
    case 'Mars':
      planetObj = mars;
      break;
    case 'Jupiter':
      planetObj = jupiter;
      break;
    case 'Saturn':
      planetObj = saturn;
      break;
    case 'Uranus':
      planetObj = uranus;
      break;
    case 'Neptune':
      planetObj = neptune;
      break;
    case 'Pluto':
      planetObj = pluto;
      break;
    default:
      return;
  }
 
  // Toggle layer separation
  const button = document.getElementById('splitButton');
  const isSplit = button.innerText.includes('Merge');
 
  if (isSplit) {
    // Merge layers back
    mergeLayers(planetObj, planetName);
    button.innerText = `Split ${planetName}`;
  } else {
    // Split layers
    splitLayers(planetObj, planetName);
    button.innerText = `Merge ${planetName}`;
  }
}








// ******  SPLIT LAYERS FUNCTION  ******
// ******  SPLIT LAYERS FUNCTION  ******






// ******  MERGE LAYERS FUNCTION  ******
function mergeLayers(planetObj, planetName) {
  const planetKey = planetName.toLowerCase();
 
  // Merge planet halves back together
  if (planetIsSplit[planetKey]) {
    mergePlanetHalves(planetObj, planetName, planetKey);
    planetIsSplit[planetKey] = false;
  }


  // Hide internal layers and return to original positions
  if (planetObj.internalLayers && planetObj.internalLayers.length > 0) {
    planetObj.internalLayers.forEach((layer, index) => {
      setTimeout(() => {
        animateLayerReturn(layer.mesh, 0, 1000 + index * 100);
        setTimeout(() => {
          layer.mesh.visible = false;
          layer.label.visible = false;
        }, 1000 + index * 100);
      }, index * 100);
    });
  }
 
  // Return atmosphere to original position
  if (planetObj.Atmosphere) {
    setTimeout(() => {
      animateLayerReturn(planetObj.Atmosphere, 0, 1000);
    }, 200);
  }
 
  // Return ring to original position
  if (planetObj.Ring) {
    setTimeout(() => {
      animateLayerReturn(planetObj.Ring, 0, 800);
    }, 300);
  }
 
  // Return moons to original positions
  if (planetObj.moons && planetObj.moons.length > 0) {
    planetObj.moons.forEach((moon, index) => {
      if (moon.mesh) {
        setTimeout(() => {
          animateLayerReturn(moon.mesh, 0, 600);
        }, 400 + index * 150);
      }
    });
  }
}




// ******  PLANET HEMISPHERE CREATION  ******
// ===== replace createPlanetHalves =====
function createPlanetHalves(planetObj, planetName, planetKey) {
  const planetSize = planetObj.planet.geometry.parameters.radius;


  // Reparent internal layers to planetSystem (keep them centered at planet center)
  if (planetObj.internalLayers) {
    planetObj.internalLayers.forEach(layer => {
      if (layer.mesh.parent !== planetObj.planetSystem) {
        // remove from planet (if present) and add to system
        try { planetObj.planet.remove(layer.mesh); } catch(e) {}
        planetObj.planetSystem.add(layer.mesh);
        // position relative to planetSystem so they're at the planet center
        layer.mesh.position.copy(planetObj.planet.position);
        layer.mesh.rotation.copy(planetObj.planet.rotation);
      }
    });
  }


  // hide the original planet mesh (we'll show hemispheres instead)
  planetObj.planet.visible = false;


  // build hemispheres
  const upperGeometry = new THREE.SphereGeometry(planetSize, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
  const lowerGeometry = new THREE.SphereGeometry(planetSize, 64, 64, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);


  let material;
  if (planetObj.planet.material && planetObj.planet.material.map) {
    material = new THREE.MeshPhongMaterial({
      map: planetObj.planet.material.map,
      bumpMap: planetObj.planet.material.bumpMap,
      bumpScale: planetObj.planet.material.bumpScale || 0.7,
      side: THREE.DoubleSide,
      shininess: 30
    });
  } else {
    material = planetObj.planet.material.clone();
    material.side = THREE.DoubleSide;
  }


  const upperHalf = new THREE.Mesh(upperGeometry, material);
  const lowerHalf = new THREE.Mesh(lowerGeometry, material);


  // align halves to the planet position/rotation in the system
// align halves to the planet position (but keep them straight, no tilt)
upperHalf.position.copy(planetObj.planet.position);
lowerHalf.position.copy(planetObj.planet.position);
upperHalf.rotation.set(0, 0, 0);
lowerHalf.rotation.set(0, 0, 0);


  planetObj.planetSystem.add(upperHalf);
  planetObj.planetSystem.add(lowerHalf);


  planetSplitHalves[planetKey] = {
    upper: upperHalf,
    lower: lowerHalf,
    originalPosition: planetObj.planet.position.clone()
  };


  // compute separation once (same formula we'll use in splitLayers)
  const baseSeparation = Math.max(planetSize * 0.6, 3);
  const separationDistance = Math.min(baseSeparation, planetSize * 1.2);


  // add extra gap for the upper half so it's not flush with top layer
  const extraGap = planetSize * 0.9;  // tweak factor (0.05–0.2) to adjust spacing


  // only animate the hemispheres here (no internal layer animation)
  setTimeout(() => {
    animateLayerSeparation(upperHalf, separationDistance, 1000);
    animateLayerSeparation(lowerHalf, -separationDistance, 1000);
  }, 100);
}


// ===== replace splitLayers =====
function splitLayers(planetObj, planetName) {
  const planetKey = planetName.toLowerCase();


  // ensure hemispheres exist
  if (!planetIsSplit[planetKey]) {
    createPlanetHalves(planetObj, planetName, planetKey);
    planetIsSplit[planetKey] = true;
  }


  const planetSize = planetObj.planet.geometry.parameters.radius;
  const baseSeparation = Math.max(planetSize * 0.6, 3);
  const separationDistance = Math.min(baseSeparation, planetSize * 1.2);
  const gapHeight = separationDistance * 2; // total open space between halves


  // Debugging help (comment out when stable)
  // console.log(`Split ${planetName} — size:${planetSize} sep:${separationDistance} gap:${gapHeight}`);


  // Internal layers: distribute them evenly across the gap (symmetrically)
  if (planetObj.internalLayers && planetObj.internalLayers.length > 0) {
    const layers = planetObj.internalLayers;
    const n = layers.length;
    const step = gapHeight / (n + 1); // positions inside (-gap/2, +gap/2)


    layers.forEach((layer, i) => {
      layer.mesh.visible = true;
      layer.label.visible = true;


      // make sure layer is parented to planetSystem and centered at planet center before animating
      if (layer.mesh.parent !== planetObj.planetSystem) {
        try { planetObj.planet.remove(layer.mesh); } catch(e) {}
        planetObj.planetSystem.add(layer.mesh);
        layer.mesh.position.copy(planetObj.planet.position);
      }


      // target absolute y inside gap (relative to planet center)
      const targetAbsoluteY = planetObj.planet.position.y + (-gapHeight / 2) + step * (i + 1);
      // compute relative offset from current position (animateLayerSeparation expects a relative yOffset)
      const relativeYOffset = targetAbsoluteY - layer.mesh.position.y;


      setTimeout(() => {
        animateLayerSeparation(layer.mesh, relativeYOffset, 1000 + i * 120);
      }, i * 120);
    });
  }


  // Atmosphere: move slightly above the top half (so it visually peeks above)
  if (planetObj.Atmosphere) {
    // place it just above the upper hemisphere edge
    const atmTargetAbsoluteY = planetObj.planet.position.y + separationDistance + planetSize * 0.12;
    const atmYOffset = atmTargetAbsoluteY - planetObj.Atmosphere.position.y;
    setTimeout(() => {
      animateLayerSeparation(planetObj.Atmosphere, atmYOffset, 1000);
    }, 300);
  }


  // Ring: nudge outward a bit (keep it readable)
  if (planetObj.Ring) {
    const ringTargetAbsoluteY = planetObj.planet.position.y + separationDistance * 0.6;
    const ringYOffset = ringTargetAbsoluteY - planetObj.Ring.position.y;
    setTimeout(() => {
      animateLayerSeparation(planetObj.Ring, ringYOffset, 800);
    }, 400);
  }


  // Moons: lift them a bit so they don't intersect with the opened halves
  if (planetObj.moons && planetObj.moons.length > 0) {
    planetObj.moons.forEach((moon, index) => {
      if (!moon.mesh) return;
      const moonTargetAbsoluteY = planetObj.planet.position.y + separationDistance + planetSize * 0.4 + index * 1.5;
      const moonYOffset = moonTargetAbsoluteY - moon.mesh.position.y;
      setTimeout(() => {
        animateLayerSeparation(moon.mesh, moonYOffset, 800);
      }, 500 + index * 150);
    });
  }
}






function mergePlanetHalves(planetObj, planetName, planetKey) {
  if (planetSplitHalves[planetKey]) {
    const halves = planetSplitHalves[planetKey];
   
    // Animate halves back together
    animateLayerReturn(halves.upper, 0, 1000);
    animateLayerReturn(halves.lower, 0, 1000);
   
    // Remove halves and restore original planet after animation
    setTimeout(() => {
      planetObj.planetSystem.remove(halves.upper);
      planetObj.planetSystem.remove(halves.lower);
     
      // Move internal layers back to planet
      if (planetObj.internalLayers) {
        planetObj.internalLayers.forEach(layer => {
          planetObj.planetSystem.remove(layer.mesh);
          planetObj.planet.add(layer.mesh);
          // Reset position since it's now relative to planet again
          layer.mesh.position.set(0, 0, 0);
          layer.mesh.rotation.set(0, 0, 0);
        });
      }
     
      planetObj.planet.visible = true;
      delete planetSplitHalves[planetKey];
    }, 1000);
  }
}






// ******  ANIMATE LAYER SEPARATION  ******
function animateLayerSeparation(layer, yOffset, duration) {
  const startY = layer.position.y;
  const targetY = startY + yOffset;
  const startTime = Date.now();
 
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
   
    // Smooth easing function
    const easeOut = 1 - Math.pow(1 - progress, 3);
   
    layer.position.y = startY + (targetY - startY) * easeOut;
   
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
 
  animate();
}








// ******  ANIMATE LAYER RETURN  ******
function animateLayerReturn(layer, targetY, duration) {
  const startY = layer.position.y;
  const startTime = Date.now();
 
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
   
    // Smooth easing function
    const easeOut = 1 - Math.pow(1 - progress, 3);
   
    layer.position.y = startY + (targetY - startY) * easeOut;
   
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
 
  animate();
}
let isZoomingOut = false;
let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);
// close 'x' button function
function closeInfo() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
  isZoomingOut = true;
  controls.target.set(0, 0, 0);
}
window.closeInfo = closeInfo;
// close info when clicking another planet
function closeInfoNoZoomOut() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
}
// ******  LAYER CLICK DETECTION  ******
function addLayerClickListeners(planetObj, planetName) {
  if (!planetObj.internalLayers) return;
 
  planetObj.internalLayers.forEach(layer => {
    layer.mesh.userData.planetName = planetName;
    layer.mesh.userData.layerName = layer.name;
    layer.mesh.userData.clickable = true;
  });
}


function checkLayerClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouseClick = new THREE.Vector2();
  mouseClick.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseClick.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
 
  raycaster.setFromCamera(mouseClick, camera);
 
  // Check all planets' internal layers
  const allLayers = [];
  [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto].forEach(planet => {
    if (planet.internalLayers) {
      planet.internalLayers.forEach(layer => {
        if (layer.mesh.visible) {
          allLayers.push(layer.mesh);
        }
      });
    }
  });
 
  const intersects = raycaster.intersectObjects(allLayers);
 
  if (intersects.length > 0) {
    const clickedLayer = intersects[0].object;
    if (clickedLayer.userData.clickable) {
      displayLayerDetails(clickedLayer.userData.planetName, clickedLayer.userData.layerName);
      event.stopPropagation();
    }
  }
}


function displayLayerDetails(planetName, layerName) {
  // Create or update the top tab
  let layerTab = document.getElementById('layerDetailsTab');
  if (!layerTab) {
    layerTab = document.createElement('div');
    layerTab.id = 'layerDetailsTab';
    layerTab.style.cssText = `
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      color: white;
      padding: 20px 30px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      font-family: 'Arial', sans-serif;
      max-width: 600px;
      z-index: 1000;
      display: none;
      border: 2px solid #4a90e2;
    `;
    document.body.appendChild(layerTab);
  }
 
  // Get layer info from your existing configs
  const layerConfigs = {
  'Mercury': [
    { name: 'Inner Core', info: 'Large iron core makes up 75% of Mercury\'s radius. Temperature: 1600-2000°C.' },
    { name: 'Outer Core', info: 'Thin molten iron layer. Creates Mercury\'s weak magnetic field.' },
    { name: 'Mantle', info: 'Silicate rock mantle, very thin compared to other terrestrial planets.' }
  ],
  'Venus': [
    { name: 'Inner Core', info: 'Iron-nickel core, possibly liquid. Temperature: 4000-5000°C.' },
    { name: 'Outer Core', info: 'Large molten metallic core. No magnetic field due to slow rotation.' },
    { name: 'Mantle', info: 'Hot silicate mantle drives intense volcanic activity.' },
    { name: 'Crust', info: 'Thick basaltic crust shaped by massive volcanic resurfacing.' }
  ],
  'Earth': [
    { name: 'Inner Core', info: 'Solid iron-nickel sphere. Temperature: 5150-6600°C. Creates Earth\'s magnetic field.' },
    { name: 'Outer Core', info: 'Liquid iron-nickel alloy. Generates Earth\'s magnetic field through convection.' },
    { name: 'Lower Mantle', info: 'Dense silicate minerals under extreme pressure. Flows very slowly.' },
    { name: 'Upper Mantle', info: 'Hot rock that drives tectonic plate movement through convection.' },
    { name: 'Crust', info: 'Thin rocky shell where we live. Only 1% of Earth\'s volume.' }
  ],
  'Mars': [
    { name: 'Core', info: 'Iron, nickel, and sulfur core, partly liquid. Generates only weak magnetism.' },
    { name: 'Mantle', info: 'Silicate mantle, thought to be less active than Earth\'s.' },
    { name: 'Crust', info: 'Thick crust with canyons, volcanoes, and evidence of past water flow.' }
  ],
  'Jupiter': [
    { name: 'Rocky Core', info: 'Dense rock and metal core, about 10–20 Earth masses.' },
    { name: 'Metallic Hydrogen', info: 'Layer of metallic hydrogen responsible for Jupiter’s strong magnetic field.' },
    { name: 'Liquid Hydrogen', info: 'Thick layer of liquid hydrogen surrounding the metallic region.' },
    { name: 'Gaseous Layer', info: 'Visible cloud tops made of ammonia and other compounds.' }
  ],
  'Saturn': [
    { name: 'Rocky Core', info: 'Rock and ice mixture under extreme pressure.' },
    { name: 'Metallic Hydrogen', info: 'Layer producing Saturn’s weaker magnetic field.' },
    { name: 'Liquid Hydrogen', info: 'Extensive liquid hydrogen envelope.' },
    { name: 'Gaseous Layer', info: 'Upper cloud layers composed of ammonia crystals.' }
  ],
  'Uranus': [
    { name: 'Rocky Core', info: 'Small rocky core at the center.' },
    { name: 'Ice Mantle', info: 'Mixture of water, methane, and ammonia ices.' },
    { name: 'Water Layer', info: 'Superionic water under high pressure.' },
    { name: 'Atmosphere', info: 'Hydrogen, helium, and methane atmosphere giving Uranus its blue-green color.' }
  ],
  'Neptune': [
    { name: 'Rocky Core', info: 'Dense rocky and metallic core.' },
    { name: 'Ice Mantle', info: 'Slushy mixture of water, ammonia, and methane ices.' },
    { name: 'Water Layer', info: 'Exotic high-pressure water states.' },
    { name: 'Atmosphere', info: 'Hydrogen, helium, and methane. Strong winds and storms.' }
  ],
  'Pluto': [
    { name: 'Rocky Core', info: 'Believed to be mostly rock and metal.' },
    { name: 'Ice Layer', info: 'Thick water-ice mantle around the core.' },
    { name: 'Surface Ice', info: 'Frozen nitrogen, methane, and carbon monoxide covering the surface.' }
  ]
};


 
  const planetLayers = layerConfigs[planetName] || [];
  const layerInfo = planetLayers.find(layer => layer.name === layerName);
 
  layerTab.innerHTML = `
    <button style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 18px; cursor: pointer; opacity: 0.7;" onclick="document.getElementById('layerDetailsTab').style.display='none'">×</button>
    <h2 style="margin: 0 0 10px 0; color: #4a90e2; font-size: 24px;">${planetName} - ${layerName}</h2>
    <p style="margin: 0; font-size: 16px; line-height: 1.5;">${layerInfo ? layerInfo.info : 'Layer information not available.'}</p>
  `;
 
  layerTab.style.display = 'block';
 
  // Auto-hide after 8 seconds
  setTimeout(() => {
    if (layerTab && layerTab.style.display === 'block') {
      layerTab.style.display = 'none';
    }
  }, 8000);
}






// ******  SUN  ******
let sunMat;








const sunSize = 697/40; // 40 times smaller scale than earth
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 20);
sunMat = new THREE.MeshStandardMaterial({
  emissive: 0xFFF88F,
  emissiveMap: loadTexture.load(sunTexture),
  emissiveIntensity: settings.sunIntensity
});
const sun = new THREE.Mesh(sunGeom, sunMat);
scene.add(sun);








//point light in the sun
const pointLight = new THREE.PointLight(0xFDFFD3 , 1200, 400, 1.4);
scene.add(pointLight);








// ******  PLANET CREATION FUNCTION  ******
function createPlanet(planetName, size, position, tilt, texture, bump, ring, atmosphere, moons){








  let material;
  if (texture instanceof THREE.Material){
    material = texture;
  }
  else if(bump){
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture),
    bumpMap: loadTexture.load(bump),
    bumpScale: 0.7
    });
  }
  else {
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture)
    });
  }








  const name = planetName;
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  const planet = new THREE.Mesh(geometry, material);
  const planet3d = new THREE.Object3D;
  const planetSystem = new THREE.Group();
 
  // ******  CREATE INTERNAL LAYERS  ******
  const internalLayers = createInternalLayers(planetName, size);
 
  // Add internal layers to planet
  internalLayers.forEach(layer => {
    planet.add(layer.mesh);
  });
 
  planetSystem.add(planet);
  let Atmosphere;
  let Ring;
  planet.position.x = position;
  planet.rotation.z = tilt * Math.PI / 180;








  // add orbit path
  const orbitPath = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    position, position, // xRadius, yRadius
    0, 2 * Math.PI,   // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
);








  const pathPoints = orbitPath.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.03 });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  planetSystem.add(orbit);








  //add ring
  if(ring)
  {
    const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius,30);
    const RingMat = new THREE.MeshStandardMaterial({
      map: loadTexture.load(ring.texture),
      side: THREE.DoubleSide
    });
    Ring = new THREE.Mesh(RingGeo, RingMat);
    planetSystem.add(Ring);
    Ring.position.x = position;
    Ring.rotation.x = -0.5 *Math.PI;
    Ring.rotation.y = -tilt * Math.PI / 180;
  }
 
  //add atmosphere
  if(atmosphere){
    const atmosphereGeom = new THREE.SphereGeometry(size+0.1, 32, 20);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map:loadTexture.load(atmosphere),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false
    })
    Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial)
   
    Atmosphere.rotation.z = 0.41;
    planet.add(Atmosphere);
  }








  //add moons
  if(moons){
    moons.forEach(moon => {
      let moonMaterial;
     
      if(moon.bump){
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
          bumpMap: loadTexture.load(moon.bump),
          bumpScale: 0.5
        });
      } else{
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture)
        });
      }
      const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const moonOrbitDistance = size * 1.5;
      moonMesh.position.set(moonOrbitDistance, 0, 0);
      planetSystem.add(moonMesh);
      moon.mesh = moonMesh;
    });
  }
  //add planet system to planet3d object and to the scene
  planet3d.add(planetSystem);
  scene.add(planet3d);
  return {name, planet, planet3d, Atmosphere, moons, planetSystem, Ring, internalLayers};
}








// ******  CREATE INTERNAL LAYERS FUNCTION  ******
function createInternalLayers(planetName, planetSize) {
  const layers = [];
 
  // Define layer configurations for different planet types
  const layerConfigs = {
    'Mercury': [
      { name: 'Inner Core', size: planetSize * 0.75, color: '#FF4444', opacity: 0.8 },
      { name: 'Outer Core', size: planetSize * 0.85, color: '#FF6666', opacity: 0.6 },
      { name: 'Mantle', size: planetSize * 0.95, color: '#CC4444', opacity: 0.4 }
    ],
    'Venus': [
      { name: 'Inner Core', size: planetSize * 0.3, color: '#FF2200', opacity: 0.9 },
      { name: 'Outer Core', size: planetSize * 0.55, color: '#FF4400', opacity: 0.7 },
      { name: 'Mantle', size: planetSize * 0.85, color: '#AA3300', opacity: 0.5 },
      { name: 'Crust', size: planetSize * 0.98, color: '#DD5500', opacity: 0.3 }
    ],
    'Earth': [
      { name: 'Inner Core', size: planetSize * 0.2, color: '#FFFF00', opacity: 0.9 },
      { name: 'Outer Core', size: planetSize * 0.35, color: '#FF8800', opacity: 0.8 },
      { name: 'Lower Mantle', size: planetSize * 0.55, color: '#FF4400', opacity: 0.6 },
      { name: 'Upper Mantle', size: planetSize * 0.85, color: '#CC3300', opacity: 0.4 },
      { name: 'Crust', size: planetSize * 0.98, color: '#8B4513', opacity: 0.2 }
    ],
    'Mars': [
      { name: 'Core', size: planetSize * 0.5, color: '#FF3300', opacity: 0.8 },
      { name: 'Mantle', size: planetSize * 0.85, color: '#AA2200', opacity: 0.5 },
      { name: 'Crust', size: planetSize * 0.98, color: '#CC5500', opacity: 0.3 }
    ],
    'Jupiter': [
      { name: 'Rocky Core', size: planetSize * 0.15, color: '#8B4513', opacity: 0.9 },
      { name: 'Metallic Hydrogen', size: planetSize * 0.45, color: '#555555', opacity: 0.7 },
      { name: 'Liquid Hydrogen', size: planetSize * 0.75, color: '#4444FF', opacity: 0.5 },
      { name: 'Gaseous Layer', size: planetSize * 0.95, color: '#D2B48C', opacity: 0.3 }
    ],
    'Saturn': [
      { name: 'Rocky Core', size: planetSize * 0.2, color: '#8B4513', opacity: 0.9 },
      { name: 'Metallic Hydrogen', size: planetSize * 0.5, color: '#444444', opacity: 0.7 },
      { name: 'Liquid Hydrogen', size: planetSize * 0.8, color: '#6666FF', opacity: 0.5 },
      { name: 'Gaseous Layer', size: planetSize * 0.96, color: '#F4A460', opacity: 0.3 }
    ],
    'Uranus': [
      { name: 'Rocky Core', size: planetSize * 0.2, color: '#654321', opacity: 0.9 },
      { name: 'Ice Mantle', size: planetSize * 0.6, color: '#87CEEB', opacity: 0.7 },
      { name: 'Water Layer', size: planetSize * 0.85, color: '#4682B4', opacity: 0.5 },
      { name: 'Atmosphere', size: planetSize * 0.98, color: '#40E0D0', opacity: 0.3 }
    ],
    'Neptune': [
      { name: 'Rocky Core', size: planetSize * 0.25, color: '#2F4F4F', opacity: 0.9 },
      { name: 'Ice Mantle', size: planetSize * 0.65, color: '#4169E1', opacity: 0.7 },
      { name: 'Water Layer', size: planetSize * 0.88, color: '#1E90FF', opacity: 0.5 },
      { name: 'Atmosphere', size: planetSize * 0.98, color: '#0000CD', opacity: 0.3 }
    ],
    'Pluto': [
      { name: 'Rocky Core', size: planetSize * 0.6, color: '#696969', opacity: 0.8 },
      { name: 'Ice Layer', size: planetSize * 0.9, color: '#B0C4DE', opacity: 0.5 },
      { name: 'Surface Ice', size: planetSize * 0.98, color: '#F0F8FF', opacity: 0.3 }
    ]
  };
 
  const config = layerConfigs[planetName] || [];
 
  config.forEach((layerConfig, index) => {
    const layerGeometry = new THREE.SphereGeometry(layerConfig.size, 24, 16);
    const layerMaterial = new THREE.MeshBasicMaterial({
      color: layerConfig.color,
      transparent: true,
      opacity: layerConfig.opacity,
      side: THREE.BackSide
    });
   
    const layerMesh = new THREE.Mesh(layerGeometry, layerMaterial);
    layerMesh.visible = false; // Hidden by default
   
    // Create text label for the layer
    const label = createLayerLabel(layerConfig.name, layerConfig.color);
    label.position.set(layerConfig.size + 2, 0, 0);
    label.visible = false;
    layerMesh.add(label);
   
    layers.push({
      name: layerConfig.name,
      mesh: layerMesh,
      label: label,
      originalSize: layerConfig.size,
      color: layerConfig.color
    });
  });
 
  return layers;
}








// ******  CREATE LAYER LABEL FUNCTION  ******
function createLayerLabel(text, color) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
 
  context.fillStyle = 'rgba(0, 0, 0, 0.8)';
  context.fillRect(0, 0, canvas.width, canvas.height);
 
  context.font = 'Bold 16px Arial';
  context.fillStyle = color;
  context.textAlign = 'center';
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 6);
 
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(8, 2, 1);
 
  return sprite;
}








// ******  LOADING OBJECTS METHOD  ******
function loadObject(path, position, scale, callback) {
  const loader = new GLTFLoader();








  loader.load(path, function (gltf) {
      const obj = gltf.scene;
      obj.position.set(position, 0, 0);
      obj.scale.set(scale, scale, scale);
      scene.add(obj);
      if (callback) {
        callback(obj);
      }
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}








// ******  ASTEROIDS  ******
const asteroids = [];
function loadAsteroids(path, numberOfAsteroids, minOrbitRadius, maxOrbitRadius) {
  const loader = new GLTFLoader();
  loader.load(path, function (gltf) {
      gltf.scene.traverse(function (child) {
          if (child.isMesh) {
              for (let i = 0; i < numberOfAsteroids / 12; i++) { // 12 asteroids per pack
                  const asteroid = child.clone();
                 
                  // Random orbit placement
                  const orbitRadius = THREE.MathUtils.randFloat(minOrbitRadius, maxOrbitRadius);
                  const angle = Math.random() * Math.PI * 2;
                  const x = orbitRadius * Math.cos(angle);
                  const z = orbitRadius * Math.sin(angle);
                  const y = THREE.MathUtils.randFloatSpread(10); // spread vertically a little


                  asteroid.position.set(x, y, z);


                  // Random size
                  asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.5, 2.0));


                  // Add small random rotation
                  asteroid.rotation.x = Math.random() * Math.PI;
                  asteroid.rotation.y = Math.random() * Math.PI;


                  scene.add(asteroid);
                  asteroids.push(asteroid);
              }
          }
      });
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}


// Main asteroid belt (between Mars & Jupiter)
// Main asteroid belt (between Mars & Jupiter)
//loadAsteroids(asteroidPackUrl, 3000, 130, 160);


// Kuiper belt (beyond Neptune)
//loadAsteroids(asteroidPackUrl, 6000, 352, 370);


loadAsteroids('/asteroids/asteroidPack.glb', 3000, 130, 160);
loadAsteroids('/asteroids/asteroidPack.glb', 6000, 352, 370);


// Earth day/night effect shader material
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { type: "t", value: loadTexture.load(earthTexture) },
    nightTexture: { type: "t", value: loadTexture.load(earthNightTexture) },
    sunPosition: { type: "v3", value: sun.position }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;








    uniform vec3 sunPosition;








    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      vSunDirection = normalize(sunPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;








    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;








    void main() {
      float intensity = max(dot(vNormal, vSunDirection), 0.0);
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv)* 0.2;
      gl_FragColor = mix(nightColor, dayColor, intensity);
    }
  `
});








// ******  MOONS  ******
// Earth
const earthMoon = [{
  size: 1.6,
  texture: earthMoonTexture,
  bump: earthMoonBump,
  orbitSpeed: 0.001 * settings.accelerationOrbit,
  orbitRadius: 10
}]








// Mars' moons with path to 3D models (phobos & deimos)
const marsMoons = [
  {
    modelPath: '/images/mars/phobos.glb',
    scale: 0.1,
    orbitRadius: 5,
    orbitSpeed: 0.002 * settings.accelerationOrbit,
    position: 100,
    mesh: null
  },
  {
    modelPath: '/images/mars/deimos.glb',
    scale: 0.1,
    orbitRadius: 9,
    orbitSpeed: 0.0005 * settings.accelerationOrbit,
    position: 120,
    mesh: null
  }
];








// Jupiter
const jupiterMoons = [
  {
    size: 1.6,
    texture: ioTexture,
    orbitRadius: 20,
    orbitSpeed: 0.0005 * settings.accelerationOrbit
  },
  {
    size: 1.4,
    texture: europaTexture,
    orbitRadius: 24,
    orbitSpeed: 0.00025 * settings.accelerationOrbit
  },
  {
    size: 2,
    texture: ganymedeTexture,
    orbitRadius: 28,
    orbitSpeed: 0.000125 * settings.accelerationOrbit
  },
  {
    size: 1.7,
    texture: callistoTexture,
    orbitRadius: 32,
    orbitSpeed: 0.00006 * settings.accelerationOrbit
  }
];








// ******  TEXT LABEL CREATION FUNCTION  ******
function createTextLabel(text, color = '#ffffff') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;
 
  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.fillRect(0, 0, canvas.width, canvas.height);
 
  context.font = 'Bold 36px Arial';
  context.fillStyle = color;
  context.textAlign = 'center';
  context.strokeStyle = '#000000';
  context.lineWidth = 2;
  context.strokeText(text, canvas.width / 2, canvas.height / 2 + 12);
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 12);
 
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(20, 5, 1);
 
  return sprite;
}








// ******  PLANET CREATIONS  ******
const mercury = new createPlanet('Mercury', 2.4, 40, 0, mercuryTexture, mercuryBump);
const venus = new createPlanet('Venus', 6.1, 65, 3, venusTexture, venusBump, null, venusAtmosphere);
const earth = new createPlanet('Earth', 6.4, 90, 23, earthMaterial, null, null, earthAtmosphere, earthMoon);
const mars = new createPlanet('Mars', 3.4, 115, 25, marsTexture, marsBump)








// ******  ADD PLANET LABELS  ******
// Sun label
const sunLabel = createTextLabel('Sun', '#ffff00');
sunLabel.position.set(0, sunSize + 5, 0);
scene.add(sunLabel);








// Planet labels
const mercuryLabel = createTextLabel('Mercury', '#8c7853');
mercuryLabel.position.set(40, 7, 0);
mercury.planetSystem.add(mercuryLabel);








const venusLabel = createTextLabel('Venus', '#ffc649');
venusLabel.position.set(65, 12, 0);
venus.planetSystem.add(venusLabel);








const earthLabel = createTextLabel('Earth', '#6b93d6');
earthLabel.position.set(90, 12, 0);
earth.planetSystem.add(earthLabel);








// Earth Moon label
const moonLabel = createTextLabel('Moon', '#cccccc');
moonLabel.position.set(90 + 10, 8, 0);
earth.planetSystem.add(moonLabel);








const marsLabel = createTextLabel('Mars', '#cd5c5c');
marsLabel.position.set(115, 9, 0);
mars.planetSystem.add(marsLabel);








// Load Mars moons
marsMoons.forEach(moon => {
  loadObject(moon.modelPath, moon.position, moon.scale, function(loadedModel) {
    moon.mesh = loadedModel;
    mars.planetSystem.add(moon.mesh);
    moon.mesh.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
});








// Create atmosphere textures for gas giants
const jupiterAtmosphere = jupiterTexture; // Jupiter has thick atmosphere
const saturnAtmosphere = saturnTexture;   // Saturn has thick atmosphere  
const uranusAtmosphere = uranusTexture;   // Uranus has thick atmosphere
const neptuneAtmosphere = neptuneTexture; // Neptune has thick atmosphere








const jupiter = new createPlanet('Jupiter', 69/4, 200, 3, jupiterTexture, null, null, jupiterAtmosphere, jupiterMoons);
const saturn = new createPlanet('Saturn', 58/4, 270, 26, saturnTexture, null, {
  innerRadius: 18,
  outerRadius: 29,
  texture: satRingTexture
}, saturnAtmosphere);
const uranus = new createPlanet('Uranus', 25/4, 320, 82, uranusTexture, null, {
  innerRadius: 6,
  outerRadius: 8,
  texture: uraRingTexture
}, uranusAtmosphere);
const neptune = new createPlanet('Neptune', 24/4, 340, 28, neptuneTexture, null, null, neptuneAtmosphere);
const pluto = new createPlanet('Pluto', 1, 350, 57, plutoTexture);


// ******  ADD REMAINING PLANET LABELS  ******
const jupiterLabel = createTextLabel('Jupiter', '#d8ca9d');
jupiterLabel.position.set(200, 25, 0);
jupiter.planetSystem.add(jupiterLabel);




const saturnLabel = createTextLabel('Saturn', '#fad5a5');
saturnLabel.position.set(270, 20, 0);
saturn.planetSystem.add(saturnLabel);




const uranusLabel = createTextLabel('Uranus', '#4fd0e3');
uranusLabel.position.set(320, 15, 0);
uranus.planetSystem.add(uranusLabel);




const neptuneLabel = createTextLabel('Neptune', '#4169e1');
neptuneLabel.position.set(340, 15, 0);
neptune.planetSystem.add(neptuneLabel);




const plutoLabel = createTextLabel('Pluto', '#8c7853');
plutoLabel.position.set(350, 8, 0);
pluto.planetSystem.add(plutoLabel);




// Add click listeners for all planets
addLayerClickListeners(mercury, 'Mercury');
addLayerClickListeners(venus, 'Venus');
addLayerClickListeners(earth, 'Earth');
addLayerClickListeners(mars, 'Mars');
addLayerClickListeners(jupiter, 'Jupiter');
addLayerClickListeners(saturn, 'Saturn');
addLayerClickListeners(uranus, 'Uranus');
addLayerClickListeners(neptune, 'Neptune');
addLayerClickListeners(pluto, 'Pluto');


// ******  PLANETS DATA  ******
const planetData = {
    'Mercury': {
        radius: '2,439.7 km',
        tilt: '0.034°',
        rotation: '58.6 Earth days',
        orbit: '88 Earth days',
        distance: '57.9 million km',
        moons: '0',
        info: 'The smallest planet in our solar system and nearest to the Sun.'
    },
    'Venus': {
        radius: '6,051.8 km',
        tilt: '177.4°',
        rotation: '243 Earth days',
        orbit: '225 Earth days',
        distance: '108.2 million km',
        moons: '0',
        info: 'Second planet from the Sun, known for its extreme temperatures and thick atmosphere.'
    },
    'Earth': {
        radius: '6,371 km',
        tilt: '23.5°',
        rotation: '24 hours',
        orbit: '365 days',
        distance: '150 million km',
        moons: '1 (Moon)',
        info: 'Third planet from the Sun and the only known planet to harbor life.'
    },
    'Mars': {
        radius: '3,389.5 km',
        tilt: '25.19°',
        rotation: '1.03 Earth days',
        orbit: '687 Earth days',
        distance: '227.9 million km',
        moons: '2 (Phobos and Deimos)',
        info: 'Known as the Red Planet, famous for its reddish appearance and potential for human colonization.'
    },
    'Jupiter': {
        radius: '69,911 km',
        tilt: '3.13°',
        rotation: '9.9 hours',
        orbit: '12 Earth years',
        distance: '778.5 million km',
        moons: '95 known moons (Ganymede, Callisto, Europa, Io are the 4 largest)',
        info: 'The largest planet in our solar system, known for its Great Red Spot.'
    },
    'Saturn': {
        radius: '58,232 km',
        tilt: '26.73°',
        rotation: '10.7 hours',
        orbit: '29.5 Earth years',
        distance: '1.4 billion km',
        moons: '146 known moons',
        info: 'Distinguished by its extensive ring system, the second-largest planet in our solar system.'
    },
    'Uranus': {
        radius: '25,362 km',
        tilt: '97.77°',
        rotation: '17.2 hours',
        orbit: '84 Earth years',
        distance: '2.9 billion km',
        moons: '27 known moons',
        info: 'Known for its unique sideways rotation and pale blue color.'
    },
    'Neptune': {
        radius: '24,622 km',
        tilt: '28.32°',
        rotation: '16.1 hours',
        orbit: '165 Earth years',
        distance: '4.5 billion km',
        moons: '14 known moons',
        info: 'The most distant planet from the Sun in our solar system, known for its deep blue color.'
    },
    'Pluto': {
        radius: '1,188.3 km',
        tilt: '122.53°',
        rotation: '6.4 Earth days',
        orbit: '248 Earth years',
        distance: '5.9 billion km',
        moons: '5 (Charon, Styx, Nix, Kerberos, Hydra)',
        info: 'Originally classified as the ninth planet, Pluto is now considered a dwarf planet.'
    }
};


// Array of planets and atmospheres for raycasting
const raycastTargets = [
  mercury.planet,
  venus.planet, venus.Atmosphere,
  earth.planet, earth.Atmosphere,
  mars.planet,
  jupiter.planet, jupiter.Atmosphere,
  saturn.planet, saturn.Atmosphere,
  uranus.planet, uranus.Atmosphere,
  neptune.planet, neptune.Atmosphere,
  pluto.planet
];




// ******  SHADOWS  ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;




//properties for the point light
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 20;




//casting and receiving shadows for all planets
mercury.planet.castShadow = true;
mercury.planet.receiveShadow = true;




venus.planet.castShadow = true;
venus.planet.receiveShadow = true;
venus.Atmosphere.castShadow = true;
venus.Atmosphere.receiveShadow = true;




earth.planet.castShadow = true;
earth.planet.receiveShadow = true;
earth.Atmosphere.castShadow = true;
earth.Atmosphere.receiveShadow = true;
earth.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
});


mars.planet.castShadow = true;
mars.planet.receiveShadow = true;


jupiter.planet.castShadow = true;
jupiter.planet.receiveShadow = true;
if(jupiter.Atmosphere) {
  jupiter.Atmosphere.castShadow = true;
  jupiter.Atmosphere.receiveShadow = true;
}
jupiter.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
});


saturn.planet.castShadow = true;
saturn.planet.receiveShadow = true;
if(saturn.Atmosphere) {
  saturn.Atmosphere.castShadow = true;
  saturn.Atmosphere.receiveShadow = true;
}
if(saturn.Ring) {
  saturn.Ring.castShadow = true;
  saturn.Ring.receiveShadow = true;
}


uranus.planet.castShadow = true;
uranus.planet.receiveShadow = true;
if(uranus.Atmosphere) {
  uranus.Atmosphere.castShadow = true;
  uranus.Atmosphere.receiveShadow = true;
}
if(uranus.Ring) {
  uranus.Ring.castShadow = true;
  uranus.Ring.receiveShadow = true;
}


neptune.planet.castShadow = true;
neptune.planet.receiveShadow = true;
if(neptune.Atmosphere) {
  neptune.Atmosphere.castShadow = true;
  neptune.Atmosphere.receiveShadow = true;
}


pluto.planet.castShadow = true;
pluto.planet.receiveShadow = true;


// ******  ORBITAL ANIMATION VARIABLES  ******
let time = 0;
const orbitSpeeds = {
  mercury: 0.004,
  venus: 0.003,
  earth: 0.002,
  mars: 0.001,
  jupiter: 0.0008,
  saturn: 0.0006,
  uranus: 0.0004,
  neptune: 0.0003,
  pluto: 0.0002
};


// ******  ANIMATION LOOP  ******
function animate() {
  requestAnimationFrame(animate);
 
  time += 0.01;
 
  // Update controls
  controls.update();
 
  // Planet rotations
  if (settings.acceleration > 0) {
    sun.rotation.y += 0.001 * settings.acceleration;
    mercury.planet.rotation.y += 0.01 * settings.acceleration;
    venus.planet.rotation.y += 0.005 * settings.acceleration;
    earth.planet.rotation.y += 0.02 * settings.acceleration;
    mars.planet.rotation.y += 0.018 * settings.acceleration;
    jupiter.planet.rotation.y += 0.04 * settings.acceleration;
    saturn.planet.rotation.y += 0.038 * settings.acceleration;
    uranus.planet.rotation.y += 0.03 * settings.acceleration;
    neptune.planet.rotation.y += 0.032 * settings.acceleration;
    pluto.planet.rotation.y += 0.008 * settings.acceleration;
  }
 
  // Planet orbital motion
  if (settings.accelerationOrbit > 0) {
    mercury.planet3d.rotation.y += orbitSpeeds.mercury * settings.accelerationOrbit;
    venus.planet3d.rotation.y += orbitSpeeds.venus * settings.accelerationOrbit;
    earth.planet3d.rotation.y += orbitSpeeds.earth * settings.accelerationOrbit;
    mars.planet3d.rotation.y += orbitSpeeds.mars * settings.accelerationOrbit;
    jupiter.planet3d.rotation.y += orbitSpeeds.jupiter * settings.accelerationOrbit;
    saturn.planet3d.rotation.y += orbitSpeeds.saturn * settings.accelerationOrbit;
    uranus.planet3d.rotation.y += orbitSpeeds.uranus * settings.accelerationOrbit;
    neptune.planet3d.rotation.y += orbitSpeeds.neptune * settings.accelerationOrbit;
    pluto.planet3d.rotation.y += orbitSpeeds.pluto * settings.accelerationOrbit;
  }
 
  // Moon orbital motion
  if (earth.moons) {
    earth.moons.forEach((moon, index) => {
      const angle = time * (moon.orbitSpeed || 0.01) + index * Math.PI / 2;
      const radius = moon.orbitRadius || 10;
      moon.mesh.position.x = earth.planet.position.x + Math.cos(angle) * radius;
      moon.mesh.position.z = Math.sin(angle) * radius;
    });
  }
 
  if (jupiter.moons) {
    jupiter.moons.forEach((moon, index) => {
      const angle = time * (moon.orbitSpeed || 0.005) + index * Math.PI / 4;
      const radius = moon.orbitRadius || 20;
      moon.mesh.position.x = jupiter.planet.position.x + Math.cos(angle) * radius;
      moon.mesh.position.z = Math.sin(angle) * radius;
    });
  }
 
  // Mars moons orbital motion
  marsMoons.forEach((moon, index) => {
    if (moon.mesh) {
      const angle = time * (moon.orbitSpeed || 0.01) + index * Math.PI;
      moon.mesh.position.x = mars.planet.position.x + Math.cos(angle) * moon.orbitRadius;
      moon.mesh.position.z = Math.sin(angle) * moon.orbitRadius;
    }
  });
 
  // Camera movement towards selected planet
  if (isMovingTowardsPlanet && selectedPlanet) {
    camera.position.lerp(targetCameraPosition, 0.02);
   
    if (camera.position.distanceTo(targetCameraPosition) < 1) {
      isMovingTowardsPlanet = false;
      showPlanetInfo(selectedPlanet.name);
    }
  }
 
  // Camera zoom out animation
  if (isZoomingOut) {
    camera.position.lerp(zoomOutTargetPosition, 0.02);
   
    if (camera.position.distanceTo(zoomOutTargetPosition) < 5) {
      isZoomingOut = false;
    }
  }
 
  // Render
  composer.render();
}


// ******  EVENT LISTENERS  ******
// Update the mouse event listener to include layer clicks
function onDocumentMouseDownUpdated(event) {
  // First check for layer clicks
  checkLayerClick(event);
 
  // Then proceed with existing planet selection logic
  onDocumentMouseDown(event);
}


// Replace the existing event listener
document.removeEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mousedown', onDocumentMouseDownUpdated, false);


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});


// ******  START ANIMATION  ******
animate();


