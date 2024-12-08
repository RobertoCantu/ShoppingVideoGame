// player.js
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.controls = new PointerLockControls(camera, document.body);
        this.player = { height: 60, speed: 6 }; // Example player properties
        this.keyboard = {};
        // this.lockPointer();
        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
        this.keyboard[event.code] = true;
    }

    onKeyUp(event) {
        this.keyboard[event.code] = false;
    }

    updateMovement() {
        if (this.keyboard["KeyW"]) {
            this.controls.moveForward(this.player.speed);
        }
        if (this.keyboard["KeyS"]) {
            this.controls.moveForward(-this.player.speed);
        }
        if (this.keyboard["KeyA"]) {
            this.controls.moveRight(-this.player.speed);
        }
        if (this.keyboard["KeyD"]) {
            this.controls.moveRight(this.player.speed);
        }
    }

    lockPointer() {
        document.body.addEventListener('click', () => {
            this.controls.lock();
        });
    }
}
