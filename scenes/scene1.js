// =====================================================
// Element 1 - Blockout
// The astronaut adrift near TON 618, built from simple grey shapes.
// Click the scene, then press:
//   1 = lighting    2 = textures    3 = shadows
// =====================================================


// ----- SETTING UP -----
// Find the canvas (the drawing area) on the web page
const canvas = document.getElementById("renderCanvas");

// Create the Babylon engine. It draws our scene onto the canvas.
// "true" turns on antialiasing, which smooths jagged edges.
const engine = new BABYLON.Engine(canvas, true);


// ----- BUILDING THE SCENE -----
const createScene = function () {

    // ----- THE SCENE -----
    // The scene is the "world" that holds everything we create.
    const scene = new BABYLON.Scene(engine);

    // Make the background almost black, like space
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.04, 1);


    // ----- THE CAMERA -----
    // A camera that circles around a point, like a satellite.
    // The numbers are: side angle, up/down angle, distance, and the point it looks at.
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 14, BABYLON.Vector3.Zero(), scene);

    // Let the mouse control the camera (drag to orbit, scroll to zoom)
    camera.attachControl(canvas, true);

    // Stop the camera zooming too close or too far away
    camera.lowerRadiusLimit = 6;
    camera.upperRadiusLimit = 40;


    // ----- BASE LIGHT -----
    // A soft light that shines on everything evenly.
    // Without any light, the whole scene would be pitch black.
    const baseLight = new BABYLON.HemisphericLight("baseLight", new BABYLON.Vector3(0, 1, 0), scene);
    baseLight.intensity = 0.7;

    // Light from below matches light from above, so everything looks flat: the raw greybox look
    baseLight.groundColor = new BABYLON.Color3(1, 1, 1);


    // ----- THE SUN (switched on with key 1) -----
    // A light shining in one direction, like a distant star.
    // It gives shapes a bright side and a dark side.
    const sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.3, -1, 0.3), scene);
    sun.position = new BABYLON.Vector3(10, 20, -10);
    sun.intensity = 1.2;

    // Start with the sun switched off
    sun.setEnabled(false);


    // ----- GREY MATERIAL -----
    // A material is the "paint" on a shape. One plain grey paint for all the greybox shapes.
    const greyMat = new BABYLON.StandardMaterial("greyMat", scene);
    const plainGrey = new BABYLON.Color3(0.6, 0.6, 0.6);
    const white = new BABYLON.Color3(1, 1, 1);
    greyMat.diffuseColor = plainGrey;

    // Turn down the shine so it looks like matte clay
    greyMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);


    // ----- GRID TEXTURE (switched on with key 2) -----
    // A texture is an image wrapped around a shape.
    // Instead of loading an image file, we draw a simple grid ourselves.
    const gridTexture = new BABYLON.DynamicTexture("gridTexture", 256, scene);
    const drawing = gridTexture.getContext();

    // Fill the square with light grey
    drawing.fillStyle = "#b5b5b5";
    drawing.fillRect(0, 0, 256, 256);

    // Draw darker lines every 32 pixels, across and down, to make a grid
    drawing.strokeStyle = "#5a5a5a";
    drawing.lineWidth = 2;
    for (let i = 0; i <= 256; i += 32) {
        drawing.beginPath(); drawing.moveTo(i, 0); drawing.lineTo(i, 256); drawing.stroke();
        drawing.beginPath(); drawing.moveTo(0, i); drawing.lineTo(256, i); drawing.stroke();
    }

    // Send the finished drawing to the graphics card so it can be used
    gridTexture.update();


    // ----- THE ASTRONAUT -----
    // An empty "holder" that the astronaut's body parts are attached to.
    // Moving or spinning the holder moves the whole astronaut together.
    // The astronaut faces the camera, with the backpack on the far side.
    const astronaut = new BABYLON.TransformNode("astronaut", scene);

    // Body: a capsule (a cylinder with rounded ends)
    const body = BABYLON.MeshBuilder.CreateCapsule("body", { height: 2, radius: 0.5 }, scene);
    body.parent = astronaut;

    // Helmet: a sphere sitting on top of the body
    const helmet = BABYLON.MeshBuilder.CreateSphere("helmet", { diameter: 1.1 }, scene);
    helmet.position.y = 1.3;
    helmet.parent = astronaut;

    // Backpack: a box on the astronaut's back (later, the jetpack)
    const backpack = BABYLON.MeshBuilder.CreateBox("backpack", { width: 0.8, height: 1, depth: 0.4 }, scene);
    backpack.position = new BABYLON.Vector3(0, 0.2, 0.45);
    backpack.parent = astronaut;

    // Arms: thin capsules on each side of the body,
    // angled slightly outwards like they're floating limp in zero gravity.
    // Each entry is: which side (-1 = left, 1 = right)
    [-1, 1].forEach(side => {
        const arm = BABYLON.MeshBuilder.CreateCapsule("arm" + side, { height: 1.4, radius: 0.18 }, scene);
        arm.position = new BABYLON.Vector3(0.75 * side, 0.05, 0);
        arm.rotation.z = 0.35 * side; // tilt away from the body
        arm.parent = astronaut;
    });

    // Legs: slightly thicker capsules under the body, spread a little apart
    [-1, 1].forEach(side => {
        const leg = BABYLON.MeshBuilder.CreateCapsule("leg" + side, { height: 1.5, radius: 0.22 }, scene);
        leg.position = new BABYLON.Vector3(0.28 * side, -1.45, 0);
        leg.rotation.z = 0.12 * side; // tilt the feet slightly outwards
        leg.parent = astronaut;
    });

    // Paint every part of the astronaut grey
    astronaut.getChildMeshes().forEach(part => part.material = greyMat);


    // ----- THE SHUTTLE -----
    // Another empty "holder", this time for the shuttle's parts.
    // The shuttle points along the x direction: nose to the right, engines to the left.
    const shuttle = new BABYLON.TransformNode("shuttle", scene);

    // Body: a long cylinder, turned on its side
    const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", { height: 10, diameter: 2 }, scene);
    fuselage.rotation.z = Math.PI / 2; // tip it over so it lies flat
    fuselage.parent = shuttle;

    // Nose: a cone (a cylinder with a top width of zero) on the front of the body
    const nose = BABYLON.MeshBuilder.CreateCylinder("nose", { height: 2, diameterTop: 0, diameterBottom: 2 }, scene);
    nose.rotation.z = -Math.PI / 2; // point the tip forwards
    nose.position.x = 6;
    nose.parent = shuttle;

    // Wings: one wide, thin slab underneath the body
    const wings = BABYLON.MeshBuilder.CreateBox("wings", { width: 4, height: 0.2, depth: 9 }, scene);
    wings.position = new BABYLON.Vector3(-1.5, -0.6, 0);
    wings.parent = shuttle;

    // Tail fin: a thin upright slab at the back, leaning backwards slightly
    const tailFin = BABYLON.MeshBuilder.CreateBox("tailFin", { width: 2.5, height: 2.5, depth: 0.2 }, scene);
    tailFin.position = new BABYLON.Vector3(-4, 1.8, 0);
    tailFin.rotation.z = 0.3;
    tailFin.parent = shuttle;

    // Cargo bay doors: a low, flat box along the top of the body
    const cargoBay = BABYLON.MeshBuilder.CreateBox("cargoBay", { width: 6, height: 0.3, depth: 1.4 }, scene);
    cargoBay.position = new BABYLON.Vector3(0.5, 1, 0);
    cargoBay.parent = shuttle;

    // Engines: three short cylinders sticking out of the back
    const enginePositions = [
        new BABYLON.Vector3(-5.5, 0.4, 0.5),
        new BABYLON.Vector3(-5.5, 0.4, -0.5),
        new BABYLON.Vector3(-5.5, -0.3, 0)
    ];
    enginePositions.forEach((position, index) => {
        const engineNozzle = BABYLON.MeshBuilder.CreateCylinder("engine" + index, { height: 1, diameter: 0.7 }, scene);
        engineNozzle.rotation.z = Math.PI / 2;
        engineNozzle.position = position;
        engineNozzle.parent = shuttle;
    });

    // Paint every part of the shuttle grey
    shuttle.getChildMeshes().forEach(part => part.material = greyMat);

    // Place the whole shuttle directly behind the astronaut, side-on to the camera.
    // Change these numbers to move it around.
    shuttle.position = new BABYLON.Vector3(0, -1, 14);
    shuttle.rotation.y = 0.2;  // turned very slightly, so it doesn't look too flat
    shuttle.rotation.z = 0.15; // tilted, like it's drifting out of control
    shuttle.scaling = new BABYLON.Vector3(1.6, 1.6, 1.6); // a bit bigger, so the astronaut looks small next to it


    // ----- THE HULL PANEL -----
    // A big flat slab of broken ship below the astronaut.
    // It gives the shadows something to land on.
    const hull = BABYLON.MeshBuilder.CreateBox("hull", { width: 8, height: 0.4, depth: 5 }, scene);
    hull.position.y = -3.5;
    hull.rotation.z = 0.1; // tilted slightly, like it's drifting too
    hull.material = greyMat;


    // ----- DEBRIS -----
    // Small boxes floating around the astronaut.
    // Each piece remembers its starting height and how fast it spins.
    const debris = [];
    const debrisSettings = [
        { size: 0.6, position: new BABYLON.Vector3(3, 1, -1),   spin: 0.4 },
        { size: 0.4, position: new BABYLON.Vector3(-3, -1, 1),  spin: 0.7 },
        { size: 0.9, position: new BABYLON.Vector3(-2, 2.5, 2), spin: 0.25 }
    ];

    debrisSettings.forEach((setting, index) => {
        const piece = BABYLON.MeshBuilder.CreateBox("debris" + index, { size: setting.size }, scene);
        piece.position = setting.position;
        piece.material = greyMat;
        debris.push({ mesh: piece, startY: setting.position.y, spin: setting.spin });
    });


    // ----- TON 618 -----
    // How big the black hole is, and how far away. Change these two numbers
    // to resize or move it: the rings grow and move with it automatically.
    const tonSize = 60;
    const tonPosition = new BABYLON.Vector3(0, 0, 120);

    // The black hole itself: a black sphere...
    const blackHoleMat = new BABYLON.StandardMaterial("blackHoleMat", scene);
    blackHoleMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    blackHoleMat.specularColor = new BABYLON.Color3(0, 0, 0); // no shine at all

    const blackHole = BABYLON.MeshBuilder.CreateSphere("blackHole", { diameter: tonSize, segments: 48 }, scene);
    blackHole.position = tonPosition.clone();
    blackHole.material = blackHoleMat;

    // ...a flat ring around its middle: the disk of gas spinning around it.
    // Its size is worked out from tonSize, so it always fits the black hole.
    const disk = BABYLON.MeshBuilder.CreateTorus("disk", { diameter: tonSize * 1.9, thickness: tonSize * 0.09, tessellation: 96 }, scene);
    disk.position = tonPosition.clone();
    disk.rotation.x = 0.15; // tipped slightly towards the camera
    disk.material = greyMat;

    // ...and a vertical ring hugging the sphere. This is the BACK of the disk,
    // whose light gets bent over the top and under the bottom by the black hole's gravity
    // (called "gravitational lensing").
    // Because it is light bent towards whoever is watching, it should always face the camera.
    // An empty holder with "billboard mode" turns itself to face the camera every frame...
    const lensingHolder = new BABYLON.TransformNode("lensingHolder", scene);
    lensingHolder.position = tonPosition.clone();
    lensingHolder.billboardMode = BABYLON.TransformNode.BILLBOARDMODE_ALL;

    // ...and the ring sits inside it, stood upright so it faces the holder's front
    const lensingRing = BABYLON.MeshBuilder.CreateTorus("lensingRing", { diameter: tonSize * 1.2, thickness: tonSize * 0.06, tessellation: 96 }, scene);
    lensingRing.rotation.x = Math.PI / 2; // stand the ring upright
    lensingRing.parent = lensingHolder;
    lensingRing.material = greyMat;


    // ----- SHADOWS (switched on with key 3) -----
    // A shadow generator works out where the sun's light is blocked.
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, sun);

    // Choose which shapes cast shadows: the astronaut (including arms and legs) and the debris.
    // (The shuttle doesn't cast shadows. It's so big that the shadows would
    // have to stretch over a huge area, which makes them blurry.)
    astronaut.getChildMeshes().forEach(part => shadowGenerator.addShadowCaster(part));
    debris.forEach(piece => shadowGenerator.addShadowCaster(piece.mesh));

    // Choose which shapes can have shadows land on them
    hull.receiveShadows = true;
    debris.forEach(piece => piece.mesh.receiveShadows = true);
    shuttle.getChildMeshes().forEach(part => part.receiveShadows = true);

    // Start with shadows switched off
    sun.shadowEnabled = false;


    // ----- MOTION -----
    // This runs every frame (around 60 times a second) just before the scene is drawn.
    let time = 0;

    scene.onBeforeRenderObservable.add(() => {
        // Seconds since the last frame. Using this keeps the speed the same on fast and slow computers.
        const delta = engine.getDeltaTime() / 1000;
        time += delta;

        // The astronaut slowly tumbles and bobs, weightless
        astronaut.rotation.x += 0.15 * delta;
        astronaut.rotation.z += 0.1 * delta;
        astronaut.position.y = Math.sin(time * 0.5) * 0.3;

        // Each debris piece spins at its own speed and floats gently up and down
        debris.forEach(piece => {
            piece.mesh.rotation.x += piece.spin * delta;
            piece.mesh.rotation.y += piece.spin * 0.6 * delta;
            piece.mesh.position.y = piece.startY + Math.sin(time * piece.spin) * 0.4;
        });

        // The shuttle sways gently back and forth, so it always stays behind the astronaut
        shuttle.rotation.y = 0.2 + Math.sin(time * 0.1) * 0.1;
    });


    // ----- KEYBOARD CONTROLS -----
    // Remember whether each feature is currently on or off
    let lightingOn = false;
    let texturesOn = false;
    let shadowsOn = false;

    // Listen for key presses
    scene.onKeyboardObservable.add((keyInfo) => {

        // Only react when a key is pressed down, not when it is released
        if (keyInfo.type !== BABYLON.KeyboardEventTypes.KEYDOWN) return;

        const key = keyInfo.event.key;

        // KEY 1: switch the sun on or off.
        // Dim the base light when the sun is on, so the light and dark sides stand out.
        if (key === "1") {
            lightingOn = !lightingOn;
            sun.setEnabled(lightingOn);
            baseLight.intensity = lightingOn ? 0.3 : 0.7;
        }

        // KEY 2: wrap the grid texture around the shapes, or remove it.
        // The colour goes white when textured so the grid shows at full brightness.
        if (key === "2") {
            texturesOn = !texturesOn;
            greyMat.diffuseTexture = texturesOn ? gridTexture : null;
            greyMat.diffuseColor = texturesOn ? white : plainGrey;
        }

        // KEY 3: switch shadows on or off.
        // Shadows come from the sun, so they only show when lighting (key 1) is on too.
        if (key === "3") {
            shadowsOn = !shadowsOn;
            sun.shadowEnabled = shadowsOn;
        }
    });


    // Hand the finished scene back so it can be drawn
    return scene;
};


// ----- STARTING THE SCENE -----
// Build the scene
const scene = createScene();

// Draw the scene over and over, around 60 times a second, so it moves
engine.runRenderLoop(() => {
    scene.render();
});

// If the browser window changes size, resize the scene to fit
window.addEventListener("resize", () => {
    engine.resize();
});