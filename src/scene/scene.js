import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Player } from '../player/player.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class SceneSetup {
	constructor(canvas, onLoadingChange) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1300);
		// this.camera.fov = 30; // Adjust as necessary
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
		this.player = new Player(this.camera, this.scene);
		this.loadingManager = new THREE.LoadingManager();
		this.boundary = new THREE.Box3(
			new THREE.Vector3(-250, 0, -514), // Min corner (left, bottom, back)
			new THREE.Vector3(550, 200, -65) // Max corner (right, top, front)
		);
		this.sound = null;

		this.loadingManager.onLoad = () => {
			onLoadingChange(false);
			// console.log('All assets loaded!');
		};

		this.loadingManager.onProgress = (url, loaded, total) => {
			// console.log(`Loaded ${loaded}/${total}: ${url}`);
		};
		// this.setupGlassdoor();
		this.init();
	}

	checkCollision() {
		const playerPos = this.player.getPosition();
		// Clamp the player's position to stay within the boundary
		if (playerPos.x < this.boundary.min.x) playerPos.x = this.boundary.min.x;
		if (playerPos.x > this.boundary.max.x) playerPos.x = this.boundary.max.x;

		if (playerPos.y < this.boundary.min.y) playerPos.y = this.boundary.min.y;
		if (playerPos.y > this.boundary.max.y) playerPos.y = this.boundary.max.y;

		if (playerPos.z < this.boundary.min.z) playerPos.z = this.boundary.min.z;
		if (playerPos.z > this.boundary.max.z) playerPos.z = this.boundary.max.z;
	}

	setupGradientSky() {
		const skyGeo = new THREE.SphereGeometry(700, 32, 32);
		const skyMat = new THREE.ShaderMaterial({
			uniforms: {
				topColor: { value: new THREE.Color(0x87ceeb) },
				bottomColor: { value: new THREE.Color(0xffffff) },
				offset: { value: 33 },
				exponent: { value: 0.6 },
			},
			vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
      `,
			fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
			side: THREE.BackSide,
		});

		const sky = new THREE.Mesh(skyGeo, skyMat);
		// Move the sphere along the Z-axis (for example, to position Z = -500)
		sky.position.z = -300;
		this.scene.add(sky);

		// Add mountains
		const mountainMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22, flatShading: true }); // Green material

		for (let i = 0; i < 4; i++) {
			const mountain = new THREE.Mesh(
				new THREE.ConeGeometry(150, 300, 4), // Cone geometry for a mountain
				mountainMaterial
			);
			mountain.position.set(-550, 150, -700 + i * 300); // Spread mountains along the horizon
			mountain.rotation.y = Math.random() * Math.PI; // Randomize rotation for variety
			this.scene.add(mountain);
		}
	}

	setupAudio() {
		const listener = new THREE.AudioListener();
		this.camera.add(listener);

		const sound = new THREE.Audio(listener);
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load('./assets/music/homeDepotSong.mp3', (buffer) => {
			sound.setBuffer(buffer);
			sound.setLoop(true);
			sound.setVolume(0.3);
			this.sound = sound;
		});
	}

	playMusic() {
		if (this.sound) {
			this.sound.play();
		}
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

	setupFloor() {
		const texture = new THREE.TextureLoader(this.loadingManager).load('./assets/textures/floor_store2.jpg');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		// Adjust texture repetition to fit the scaled floor
		const scaleFactor = 0.3; // Scale down the floor
		texture.repeat.set(100 * scaleFactor, 150 * scaleFactor); // Adjust repeat to fit the new floor size

		// Adjust the floor size based on the new scene scale
		const floorWidth = 1000 * scaleFactor; // Scale the width
		const floorHeight = 1500 * scaleFactor; // Scale the height

		const meshFloor = new THREE.Mesh(
			new THREE.PlaneGeometry(floorWidth, floorHeight, 10, 10), // Adjusted dimensions based on scale
			new THREE.MeshPhongMaterial({ map: texture, wireframe: false })
		);

		meshFloor.rotation.x = -Math.PI / 2; // 90 degrees, make it flat
		meshFloor.receiveShadow = true;

		// Push the floor further away from the parking lot along the Z-axis, keeping relative position
		const zOffset = -1000 * scaleFactor; // Adjust Z position according to scaling
		meshFloor.position.set(-340 * scaleFactor, 0, zOffset); // Scale position as well

		this.scene.add(meshFloor);
	}

	loadParkingLot() {
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(
			'/assets/models/parking-lot/scene.gltf', // Path to your model
			(gltf) => {
				const parkingLot = gltf.scene;
				parkingLot.scale.set(0.3, 0.3, 0.3); // Adjust size as needed
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
				shelves.scale.set(0.2, 0.2, 0.2); // Adjust size as needed
				shelves.position.set(-60, 0, -270); // Adjust position
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

	loadShelves2() {
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(
			'./assets/models/modular_shelves/scene.gltf', // Path to your model
			(gltf) => {
				const shelves = gltf.scene;
				shelves.scale.set(0.2, 0.2, 0.2); // Adjust size as needed
				shelves.position.set(-60, 0, -390); // Adjust position
				shelves.rotation.y = Math.PI / 2;
				shelves.receiveShadow = true;
				this.scene.add(shelves);
			},
			undefined,
			(error) => {
				console.error('Error loading shelves 2 model:', error);
			}
		);
	}

	loadPaintAisle() {
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(
			'./assets/models/paint_aisle/scene.gltf', // Path to your model
			(gltf) => {
				const paintAisle = gltf.scene;
				paintAisle.scale.set(9, 9, 9); // Adjust size as needed
				paintAisle.position.set(-60, 0, -522); // Adjust position
				// paintAisle.rotation.y = Math.PI / 2;
				paintAisle.receiveShadow = true;
				this.scene.add(paintAisle);
			},
			undefined,
			(error) => {
				console.error('Error loading paint aisle:', error);
			}
		);
	}

	loadCashRegister(position, scale) {
		const loader = new GLTFLoader(this.loadingManager);
		loader.load(
			'./assets/models/SuperMarket/cash-register/cash-register.glb', // Path to your model
			(gltf) => {
				const cashRegister = gltf.scene;
				cashRegister.scale.set(scale.x, scale.y, scale.z); // Apply scale factor to cash register
				cashRegister.position.set(position.x, position.y, position.z); // Apply scale factor to position
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
				cashRegister.scale.set(30, 30, 30); // Use the passed scale
				cashRegister.position.set(6, 0, -129); // Adjust position
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
		this.loadCashRegister(new THREE.Vector3(-120, 0, -120), new THREE.Vector3(30, 30, 30));

		// Load second cash register
		this.loadCashRegister(new THREE.Vector3(-60, 0, -120), new THREE.Vector3(30, 30, 30));

		// Load third cash register
		this.loadCashRegister(new THREE.Vector3(0, 0, -120), new THREE.Vector3(30, 30, 30));
	}

	setupWalls() {
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
		texture.repeat.set(0.6, 0.6); // Adjust repeat for new scale

		const wallMaterial = new THREE.MeshPhongMaterial({
			map: texture,
			side: THREE.DoubleSide,
		});

		const walls = [
			{ width: 300, height: 60, depth: 0.5, x: -102, y: 30, z: -525 }, // Back wall
			{ width: 0.15, height: 60, depth: 450, x: -252, y: 30, z: -300 }, // Left wall
			{ width: 0.15, height: 60, depth: 450, x: 48, y: 30, z: -300 }, // Right wall
			{ width: 300, height: 60, depth: 0.5, x: -102, y: 30, z: -75 }, // Front wall
		];

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
				size: 12, // Scale text size
				depth: 0.6,
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 0.3,
				bevelSize: 0.3,
				bevelSegments: 3,
			});

			const textMaterial = new THREE.MeshPhongMaterial({
				color: 0xff6600,
				side: THREE.FrontSide,
			});
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);

			textMesh.position.set(50, 45, -255);
			textMesh.rotation.y = Math.PI / 2;
			this.scene.add(textMesh);
		});
	}

	setupGlassDoor() {
		// Create the glass part of the door (transparent material)
		const glassGeometry = new THREE.PlaneGeometry(50, 50); // Slightly smaller to fit inside the frame
		const glassMaterial = new THREE.MeshPhongMaterial({
			color: 0xadd8e6, // Light blue color for glass
			opacity: 0.5, // Transparent glass
			transparent: true,
			reflectivity: 0.5, // Give it a shiny, reflective surface
			shininess: 100,
			side: THREE.DoubleSide,
		});
		const glassDoor = new THREE.Mesh(glassGeometry, glassMaterial);
		glassDoor.rotation.y = -Math.PI / 2; // 90 degrees, make it flat

		glassDoor.position.set(50, 0, -305); // Position the glass inside the frame
		glassDoor.castShadow = true;
		glassDoor.receiveShadow = true;
		this.scene.add(glassDoor);
	}

	init() {
		document.body.appendChild(this.renderer.domElement);
		this.camera.position.set(270, this.player.player.height, -180);
		// this.camera.position.set(0, 70, 0); // Adjust to view the parking lot
		this.camera.lookAt(-1800, 0, 0); // Ensure the camera looks at the scene center

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.setupAudio();
		this.setupGradientSky();
		this.loadParkingLot();
		this.loadShelves();
		this.loadShelves2();
		this.loadPaintAisle();
		this.loadMultipleCashRegisters();
		this.loadCashier();
		this.setupLights();
		this.setupFloor();
		this.setupWalls();
		this.setupGlassDoor();
		this.animate();
	}

	animate() {
		this.player.updateMovement();
		// Check for collision and prevent going out of bounds
		// this.checkCollision();
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.animate.bind(this));
	}
}
