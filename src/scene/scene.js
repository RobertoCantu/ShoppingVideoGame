import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Player } from '../player/player.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class SceneSetup {
	constructor(canvas, onLoadingChange) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
		this.camera.fov = 75; // Adjust as necessary
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
		this.player = new Player(this.camera, this.scene);
		this.loadingManager = new THREE.LoadingManager();

		this.loadingManager.onLoad = () => {
      onLoadingChange(false)
			console.log('All assets loaded!');
		};

		this.loadingManager.onProgress = (url, loaded, total) => {
			console.log(`Loaded ${loaded}/${total}: ${url}`);
		};
		// this.setupGlassdoor();
		this.init();
	}

	setupAudio() {
		const listener = new THREE.AudioListener();
		this.camera.add(listener);

		const sound = new THREE.Audio(listener);
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load('music/Rain.ogg', (buffer) => {
			sound.setBuffer(buffer);
			sound.setLoop(true);
			sound.setVolume(0.5);
			sound.play();
		});
	}

	setupLights() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increased ambient light intensity
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(10, 400, 10);
		directionalLight.castShadow = true; // Make sure the light casts shadows
		directionalLight.target.position.set(0, 0, 0); // Ensure the light targets the center of the scene
		this.scene.add(directionalLight);

		// Optional: Add a helper to visualize the light direction
		const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
		this.scene.add(lightHelper);
	}

	//  setupGlassdoor() {
	//   const doorGeometry = new THREE.BoxGeometry(200, 100, 0.1);
	//   const glassMaterial = new THREE.MeshPhysicalMaterial({
	//     color: '#29C5F6', // Light blue color (sky blue shade)
	//     metalness: 0.05,
	//     roughness: 0.05,
	//     transmission: 0.95,
	//     opacity: 0.85,
	//     // transparent: true,
	//     side: THREE.DoubleSide,
	//     emissive: 0x4682B4, // Slight blue emissive color
	//     emissiveIntensity: 0.2
	// });
	//   const glassDoor = new THREE.Mesh(doorGeometry, glassMaterial);
	//   // Rotate the door 90 degrees to the side
	//   glassDoor.rotation.y = Math.PI / 2;
	//   glassDoor.position.set(900, 100, 0); // Adjust position
	//   this.scene.add(glassDoor);
	// }

	// setupGlassdoor() {
	//   // Glass door geometry and material
	//   const doorGeometry = new THREE.BoxGeometry(200, 100, 0.1);
	//   const glassMaterial = new THREE.MeshPhysicalMaterial({
	//     color: 0x87CEEB, // Light blue color
	//     metalness: 0.05,
	//     roughness: 0.05,
	//     transmission: 0.95,
	//     opacity: 0.85,
	//     // transparent: true,
	//     side: THREE.DoubleSide,
	//     emissive: 0x4682B4, // Slight blue emissive color
	//     emissiveIntensity: 0.2,
	//   });
	//   const glassDoor = new THREE.Mesh(doorGeometry, glassMaterial);
	//   glassDoor.rotation.y = Math.PI / 2; // Rotate 90 degrees
	//   glassDoor.position.set(900, 100, 0); // Adjust position

	//   // Border frame
	//   const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
	//   const borderGeometry = new THREE.BoxGeometry(204, 104, 0.2); // Slightly larger than the door
	//   const border = new THREE.Mesh(borderGeometry, frameMaterial);
	//   border.position.copy(glassDoor.position);
	//   border.rotation.copy(glassDoor.rotation);

	//   // Thin frame inside to simulate two panels
	//   const dividerGeometry = new THREE.BoxGeometry(4, 100, 0.15); // Thin vertical divider
	//   const divider = new THREE.Mesh(dividerGeometry, frameMaterial);
	//   // divider.position.set(900, 100, 0); // Center it along the glass door
	//   // divider.rotation.copy(glassDoor.rotation);

	//   // Door knobs
	//   const knobGeometry = new THREE.SphereGeometry(2, 32, 32); // Small spheres
	//   const knobMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Golden knobs

	//   const leftKnob = new THREE.Mesh(knobGeometry, knobMaterial);
	//   leftKnob.position.set(899, 100, 5); // Adjust for the left panel
	//   const rightKnob = new THREE.Mesh(knobGeometry, knobMaterial);
	//   rightKnob.position.set(901, 100, 5); // Adjust for the right panel

	//   // Add all to the scene
	//   this.scene.add(border);
	//   this.scene.add(glassDoor);
	//   this.scene.add(divider);
	//   this.scene.add(leftKnob);
	//   this.scene.add(rightKnob);
	// }

	// setupGlassdoor() {
	//   // Glass door geometry and material
	//   const doorGeometry = new THREE.BoxGeometry(200, 100, 0.1);
	//   const glassMaterial = new THREE.MeshPhysicalMaterial({
	//     color: 0x87CEEB, // Light blue color
	//     metalness: 0.05,
	//     roughness: 0.05,
	//     transmission: 0.95,
	//     opacity: 0.85,
	//     transparent: true,
	//     side: THREE.DoubleSide,
	//     emissive: 0x4682B4, // Slight blue emissive color
	//     emissiveIntensity: 0.2,
	//   });
	//   const glassDoor = new THREE.Mesh(doorGeometry, glassMaterial);
	//   glassDoor.rotation.y = Math.PI / 2; // Rotate 90 degrees
	//   glassDoor.position.set(900, 100, 0); // Adjust position

	//   // Frame material
	//   const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

	//   // Frame thickness and depth
	//   const frameThickness = 5; // Adjust thickness
	//   const frameDepth = 0.15; // Depth to match the door

	//   // Top and Bottom frame
	//   const horizontalFrameGeometry = new THREE.BoxGeometry(200 + frameThickness * 2, frameThickness, frameDepth);
	//   const topFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
	//   const bottomFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);

	//   // Left and Right frame
	//   const verticalFrameGeometry = new THREE.BoxGeometry(frameThickness, 100 + frameThickness * 2, frameDepth);
	//   const leftFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
	//   const rightFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);

	//   // Rotate frames to align with the door
	//   topFrame.rotation.y = Math.PI / 2;
	//   bottomFrame.rotation.y = Math.PI / 2;
	//   leftFrame.rotation.y = Math.PI / 2;
	//   rightFrame.rotation.y = Math.PI / 2;

	//   // Position frame components
	//   topFrame.position.set(900, 100 + 50 + frameThickness / 2, 0); // Above door
	//   bottomFrame.position.set(900, 100 - 50 - frameThickness / 2, 0); // Below door
	//   leftFrame.position.set(900, 100, -50 - frameThickness / 2); // Left side of door
	//   rightFrame.position.set(900, 100, 50 + frameThickness / 2); // Right side of door

	//   // Divider to simulate two panels
	//   const dividerGeometry = new THREE.BoxGeometry(frameThickness, 100, frameDepth);
	//   const divider = new THREE.Mesh(dividerGeometry, frameMaterial);
	//   divider.rotation.y = Math.PI / 2; // Align with rotated door
	//   divider.position.set(900, 100, 0); // Center along the door

	//   // Door knobs
	//   const knobGeometry = new THREE.SphereGeometry(2, 32, 32); // Small spheres
	//   const knobMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Golden knobs

	//   const leftKnob = new THREE.Mesh(knobGeometry, knobMaterial);
	//   leftKnob.position.set(900, 100, -50 + 2); // Adjust for the left panel
	//   const rightKnob = new THREE.Mesh(knobGeometry, knobMaterial);
	//   rightKnob.position.set(900, 100, 50 - 2); // Adjust for the right panel

	//   // Add all components to the scene
	//   this.scene.add(glassDoor);
	//   this.scene.add(topFrame);
	//   this.scene.add(bottomFrame);
	//   this.scene.add(leftFrame);
	//   this.scene.add(rightFrame);
	//   this.scene.add(divider);
	//   this.scene.add(leftKnob);
	//   this.scene.add(rightKnob);
	// }

	// setupGlassdoor() {
	//   const mtlLoader = new MTLLoader();
	//   const objLoader = new OBJLoader();

	//   // Path to the .mtl file
	//   const materialPath = 'assets/models/glassdoor/vitrosca3001.mtl';
	//   const objectPath = 'assets/models/glassdoor/vitrosca3001.obj';

	//   // Load materials first
	//   // mtlLoader.load(materialPath, (materials) => {
	//   //     materials.preload(); // Prepare materials
	//   //     objLoader.setMaterials(materials); // Attach materials to the OBJLoader

	//   //     // Load the OBJ model
	//   //     objLoader.load(
	//   //         objectPath,
	//   //         (door) => {
	//   //             // Adjust scale, rotation, and position as needed
	//   //             door.scale.set(1, 1, 1); // Scale the model
	//   //             door.rotation.y = Math.PI / 2; // Rotate 90 degrees
	//   //             door.position.set(900, 0, 0); // Position the door

	//   //             // Add the door to the scene
	//   //             this.scene.add(door);
	//   //         },
	//   //         (xhr) => {
	//   //             console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
	//   //         },
	//   //         (error) => {
	//   //             console.error('An error occurred while loading the OBJ model:', error);
	//   //         }
	//   //     );
	//   // });
	// }

	setupFloor() {
		const texture = new THREE.TextureLoader(this.loadingManager).load('./assets/textures/floor.jpg');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(10, 10); // Adjust for a larger floor area

		// Adjust the floor size based on the parking lot's scale
		const meshFloor = new THREE.Mesh(
			new THREE.PlaneGeometry(1000, 1500, 10, 10), // Larger dimensions
			new THREE.MeshPhongMaterial({ map: texture, wireframe: false })
		);
		meshFloor.rotation.x = -Math.PI / 2; // 90 degrees
		meshFloor.receiveShadow = true;

		// Push the floor further away from the parking lot along the Z-axis
		meshFloor.position.set(-340, 0, -1000); // Adjust the z-value to move the floor further

		this.scene.add(meshFloor);
	}

	loadParkingLot() {
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(
			'/assets/models/parking-lot/scene.gltf', // Path to your model
			(gltf) => {
				const parkingLot = gltf.scene;
				parkingLot.scale.set(1, 1, 1); // Adjust size as needed
				parkingLot.position.set(0, 0, 0); // Adjust position as needed
				const light = new THREE.DirectionalLight(0xffffff, 1);
				light.position.set(10, 20, 10);
				// this.scene.add(light);
				parkingLot.receiveShadow = true;
				this.scene.add(parkingLot);
			},
			undefined,
			(error) => {
				console.error('Error loading parking lot model:', error);
			}
		);
	}

	loadShelves() {
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(
			'./assets/models/modular_shelves/scene.gltf', // Path to your model
			(gltf) => {
				const shelves = gltf.scene;
				shelves.scale.set(0.7, 0.7, 0.7); // Adjust size as needed
				shelves.position.set(-200, 0, -900); // Adjust position as needed
				shelves.rotation.y = Math.PI / 2;
				shelves.receiveShadow = true;
				this.scene.add(shelves);
			},
			undefined,
			(error) => {
				console.error('Error loading shelves model:', error);
			}
		);
	}

	loadCashRegister(position, scale) {
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(
			'./assets/models/SuperMarket/cash-register/cash-register.glb', // Path to your model
			(gltf) => {
				const cashRegister = gltf.scene;
				cashRegister.scale.set(scale.x, scale.y, scale.z); // Use the passed scale
				cashRegister.position.set(position.x, position.y, position.z); // Use the passed position
				cashRegister.receiveShadow = true;
				this.scene.add(cashRegister);
			},
			undefined,
			(error) => {
				console.error('Error loading cash register model:', error);
			}
		);
	}

	loadCashier() {
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(
			'./assets/models/SuperMarket/cashier/character-employee.glb', // Path to your model
			(gltf) => {
				const cashRegister = gltf.scene;
				cashRegister.scale.set(100, 100, 100); // Use the passed scale
				cashRegister.position.set(20, 12, -430); // Use the passed position
				cashRegister.receiveShadow = true;
				this.scene.add(cashRegister);
			},
			undefined,
			(error) => {
				console.error('Error loading cashier model:', error);
			}
		);
	}

	loadMultipleCashRegisters() {
		// Load first cash register
		this.loadCashRegister(new THREE.Vector3(-400, 12, -400), new THREE.Vector3(100, 100, 100));

		// Load second cash register
		this.loadCashRegister(new THREE.Vector3(-200, 12, -400), new THREE.Vector3(100, 100, 100));

		// Load third cash register
		this.loadCashRegister(new THREE.Vector3(0, 12, -400), new THREE.Vector3(100, 100, 100));
	}

	setupWalls() {
		// Load and configure the texture for the walls
		// const texture = new THREE.TextureLoader().load('../assets/textures/wall.jpg');

		const texture = new THREE.TextureLoader(this.loadingManager).load(
			'./assets/textures/wall.jpg',
			() => {
				console.log('Texture loaded successfully');
			},
			undefined,
			(err) => {
				console.error('Error loading texture:', err);
			}
		);
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(2, 2); // Adjust for repeating effect

		// Create the material using the configured texture
		const wallMaterial = new THREE.MeshPhongMaterial({
			map: texture,
			side: THREE.DoubleSide, // Ensure both sides are textured
		});

		// Dimensions and positions for the walls - Adjust to fit the new layout
		const walls = [
			// Back wall: Position it behind the floor and match width to floor's length
			{ width: 1000, height: 200, depth: 0.5, x: -340, y: 100, z: -1750 }, // Adjusted z to fit with the floor

			// Left wall: Position it along the floor's width and depth
			{ width: 0.5, height: 200, depth: 1500, x: -840, y: 100, z: -1000 }, // Left wall (on the left side of the floor)

			// Right wall: Same positioning as left wall but on the opposite side
			{ width: 0.5, height: 200, depth: 1500, x: 160, y: 100, z: -1000 }, // Right wall (on the right side of the floor)

			// Front wall: Positioned in front of the floor
			{ width: 1000, height: 200, depth: 0.5, x: -340, y: 100, z: -250 }, // Front wall (aligned to floor's length)
		];

		// Create and position the walls
		walls.forEach((wall) => {
			const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(wall.width, wall.height, wall.depth), wallMaterial);
			wallMesh.position.set(wall.x, wall.y, wall.z);
			wallMesh.receiveShadow = true;
			wallMesh.castShadow = true;
			this.scene.add(wallMesh);
		});

		// Add "Home Depot" text to the right wall
		const fontLoader = new FontLoader(this.loadingManager);
		fontLoader.load('./assets/fonts/helvetiker_regular.typeface.json', (font) => {
			const textGeometry = new TextGeometry('Home Depot', {
				font: font,
				size: 40, // Adjust size as needed
				depth: 2, // Depth of the text
				curveSegments: 12, // Smoothness of the text curves
				bevelEnabled: true,
				bevelThickness: 1,
				bevelSize: 1,
				bevelSegments: 3,
			});

			const textMaterial = new THREE.MeshPhongMaterial({
				color: 0xff6600, // Orange color for Home Depot
				side: THREE.FrontSide, // Only show text on the front side
			});
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);

			// Position the text on the right wall
			textMesh.position.set(165, 150, -850); // Adjust position as needed
			textMesh.rotation.y = Math.PI / 2; // Rotate to face outward from the wall
			this.scene.add(textMesh);
		});
	}

	init() {
		document.body.appendChild(this.renderer.domElement);
		this.camera.position.set(900, this.player.player.height, -600);
		// this.camera.position.set(0, 70, 0); // Adjust to view the parking lot
		this.camera.lookAt(-6000, 60, 0); // Ensure the camera looks at the scene center

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.loadParkingLot();
		this.loadShelves();
		this.loadMultipleCashRegisters();
		this.loadCashier();
    this.setupLights();
		this.setupFloor();
		this.setupWalls();
		this.animate();
	}

	animate() {
		this.player.updateMovement();
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.animate.bind(this));
	}
}
