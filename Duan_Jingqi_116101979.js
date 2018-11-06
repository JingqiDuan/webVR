
//global variables
var renderer;
var scene;
var camera;
var cameraControl;
var video, videoImage, videoImageContext, videoTexture;
var bulbLight, bulbMat, hemiLight, object, loader, stats;
var previousShadowMap = false;

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

            // ref for lumens: http://www.power-sure.com/lumens.htm
            var bulbLuminousPowers = {
                "110000 lm (1000W)": 110000,
                "3500 lm (300W)": 3500,
                "1700 lm (100W)": 1700,
                "800 lm (60W)": 800,
                "400 lm (40W)": 400,
                "180 lm (25W)": 180,
                "20 lm (4W)": 20,
                "Off": 0
            };
            // ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
            var hemiLuminousIrradiances = {
                "0.0001 lx (Moonless Night)": 0.0001,
                "0.002 lx (Night Airglow)": 0.002,
                "0.5 lx (Full Moon)": 0.5,
                "3.4 lx (City Twilight)": 3.4,
                "50 lx (Living Room)": 50,
                "100 lx (Very Overcast)": 100,
                "350 lx (Office Room)": 350,
                "400 lx (Sunrise/Sunset)": 400,
                "1000 lx (Overcast)": 1000,
                "18000 lx (Daylight)": 18000,
                "50000 lx (Direct Sun)": 50000
            };
            var params = {
                shadows: true,
                exposure: 0.68,
                bulbPower: Object.keys( bulbLuminousPowers )[ 4 ],
                hemiIrradiance: Object.keys( hemiLuminousIrradiances )[0]
            };
            var clock = new THREE.Clock();


init();
animate();
//init() gets executed once
function init() {
    scene = new THREE.Scene();

//bulb
    var container = document.getElementById( 'container' );
                stats = new Stats();
                container.appendChild( stats.domElement);

        ballMat = new THREE.MeshStandardMaterial( {
                    color: 0xffffff,
                    roughness: 0.5,
                    metalness: 1.0
                });

                var bulbGeometry = new THREE.SphereBufferGeometry( 100, 60, 30 );
                bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );
                bulbMat = new THREE.MeshStandardMaterial( {
                    emissive: 0xffffee,
                    emissiveIntensity: 1,
                    color: 0x000000
                });

                bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
                bulbLight.position.set( 0, 100, 0 );
                bulbLight.castShadow = true;
                scene.add( bulbLight );
                hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
                scene.add( hemiLight );

                floorMat = new THREE.MeshStandardMaterial( {
                    roughness: 0.8,
                    color: 0xffffff,
                    metalness: 0.2,
                    bumpScale: 0.0005
                });
                var textureLoader = new THREE.TextureLoader();




                ballMat = new THREE.MeshStandardMaterial( {
                    color: 0xffffff,
                    roughness: 0.5,
                    metalness: 1.0
                });
                // textureLoader.load( "textures/planets/earth_atmos_2048.jpg", function( map ) {
                //     map.anisotropy = 4;
                //     ballMat.map = map;
                //     ballMat.needsUpdate = true;
                // } );
                // textureLoader.load( "textures/planets/earth_specular_2048.jpg", function( map ) {
                //     map.anisotropy = 4;
                //     ballMat.metalnessMap = map;
                //     ballMat.needsUpdate = true;
                // } );
                var floorGeometry = new THREE.PlaneBufferGeometry( 20, 20 );
                var floorMesh = new THREE.Mesh( floorGeometry, floorMat );
                floorMesh.receiveShadow = true;
                floorMesh.rotation.x = -Math.PI / 2.0;
                scene.add( floorMesh );
                //var ballGeometry = new THREE.SphereBufferGeometry( 0.5, 32, 32 );
                // var ballMesh = new THREE.Mesh( ballGeometry, ballMat );
                // ballMesh.position.set( 1, 0.5, 1 );
                // ballMesh.rotation.y = Math.PI;
                // ballMesh.castShadow = true;
                //scene.add( ballMesh );
                // var boxGeometry = new THREE.BoxBufferGeometry( 0.5, 0.5, 0.5 );
                // var boxMesh = new THREE.Mesh( boxGeometry, cubeMat );
                // boxMesh.position.set( -0.5, 0.25, -1 );
                // boxMesh.castShadow = true;
                // scene.add( boxMesh );
                // var boxMesh2 = new THREE.Mesh( boxGeometry, cubeMat );
                // boxMesh2.position.set( 0, 0.25, -5 );
                // boxMesh2.castShadow = true; 
                // scene.add( boxMesh2 ); 
                // var boxMesh3 = new THREE.Mesh( boxGeometry, cubeMat );
                // boxMesh3.position.set( 7, 0.25, 0 );  //OrbitControls
                // boxMesh3.castShadow = true;    //planets
                // scene.add( boxMesh3 );
                // renderer = new THREE.WebGLRenderer();
                // renderer.physicallyCorrectLights = true;
                // renderer.gammaInput = true;
                // renderer.gammaOutput = true;
                // renderer.shadowMap.enabled = true;
                // renderer.toneMapping = THREE.ReinhardToneMapping;
                // renderer.setPixelRatio( window.devicePixelRatio );
                // renderer.setSize( window.innerWidth, window.innerHeight );
                // container.appendChild( renderer.domElement );
                // var controls = new THREE.OrbitControls( camera, renderer.domElement );
                // window.addEventListener( 'resize', onWindowResize, false );
                var gui = new dat.GUI();
                gui.add( params, 'hemiIrradiance', Object.keys( hemiLuminousIrradiances ) );
                gui.add( params, 'bulbPower', Object.keys( bulbLuminousPowers ) );
                gui.add( params, 'exposure', 0, 1 );
                gui.add( params, 'shadows' );
                gui.open();


//update
    
    createRenderer();
    createCamera();
    createLight();
    createFog();

    loadUCC();
    playVideo();
    createGrass();

    createSky();

    loadBillboard();
    loadHarry();
    loadVoldemort();

    document.body.appendChild(renderer.domElement);

    //render() gets called at end of init
    //as it looped forever
    render();
}


// function createBulb(){

 
// }

function animate() {



                requestAnimationFrame( animate );
                render();
            }
          

function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
}

function createCamera() {
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( -100, 200, 3000 );
    camera.lookAt(scene.position);
    camera.lookAt(scene.position);
    //camera control
    cameraControl = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControl.maxPolarAngle = Math.PI * 0.6;
    cameraControl.minDistance = 1000;
    cameraControl.maxDistance = 8000;
}

function loadUCC() {

    var loader = new THREE.ColladaLoader();
    loader.load('assets/ucc.dae', function(object){
        var campus = object.scene;
        campus.scale.set(1,1,1);
        campus.traverse(function(child){
        child.castShadow = true; 
        child.receiveShadow = true;
        });
        scene.add(campus);
    });

}

function loadBillboard() {

    var loader = new THREE.ColladaLoader();
    loader.load('assets/billboards.dae', function(object){
        var billboard = object.scene;
        billboard.scale.set(1,1,1);
        billboard.rotateZ(Math.PI*6/4);
        billboard.position.set(800,-600,-1200);
        billboard.traverse(function(child){
        child.castShadow = true; 
        child.receiveShadow = true;
        });
        scene.add(billboard);
    });

}

function playVideo(){

    // create the video element
    video = document.createElement( 'video' );
    // video.id = 'video';
    // video.type = ' video/ogg; codecs="theora, vorbis" ';
    video.src = "assets/theSong.mp4";
    video.load(); // must call after setting/changing source
    video.play();
    
    // alternative method -- 
    // create DIV in HTML:
    // <video id="myVideo" autoplay style="display:none">
    //      <source src="videos/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
    // </video>
    // and set JS variable:
    // video = document.getElementById( 'myVideo' );
    
    videoImage = document.createElement( 'canvas' );
    videoImage.width = 480;
    videoImage.height = 204;
    videoImageContext = videoImage.getContext( '2d' );
    // background color if no video present
    videoImageContext.fillStyle = '#000000';
    videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
    videoTexture = new THREE.Texture( videoImage );
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
    // the geometry on which the movie will be displayed;
    //      movie image will be scaled to fit these dimensions.
    var movieGeometry = new THREE.PlaneGeometry( 550, 224, 4, 4 );
    var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    movieScreen.position.set(835,620,-1240);
    scene.add(movieScreen);

}

function loadHarry() {

    var loader = new THREE.ColladaLoader();
    loader.load('assets/Harry.dae', function(object){
        var harry = object.scene;
        harry.scale.set(2,2,2);
        harry.position.set(-400,0,0);
        harry.traverse(function(child){
        child.castShadow = true; 
        child.receiveShadow = true;
        });
        scene.add(harry);
    });

}


function loadVoldemort() {

    var loader = new THREE.ColladaLoader();
    loader.load('assets/Voldemort.dae', function(object){
        var voldemort = object.scene;
        voldemort.scale.set(0.02,0.02,0.02);
        voldemort.rotateX(Math.PI/2);
        voldemort.rotateY(Math.PI*6/4);
        voldemort.position.set(200,0,-80);
        voldemort.traverse(function(child){
        child.castShadow = true; 
        child.receiveShadow = true;
        });
        scene.add(voldemort);
    });

}

function createGrass() {

    var texture = new THREE.TextureLoader().load("assets/grass.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30,30);

    var geo = new THREE.PlaneBufferGeometry(30000, 30000);
    var mat = new THREE.MeshLambertMaterial( { map: texture } );
    var plane = new THREE.Mesh(geo,mat);
    plane.receiveShadow = true;
    plane.rotateX( -Math.PI/2); 
    scene.add(plane);
} 


function createLight() {
                var dayLight;
                scene.add( new THREE.AmbientLight( 0x666666 ) );
                dayLight = new THREE.DirectionalLight( 0xdfebff, 1 );
                dayLight.position.set( 0, 100, 50 );
                dayLight.position.multiplyScalar( 1.3 );
                dayLight.castShadow = true;
                dayLight.shadow.mapSize.width = 1024;
                dayLight.shadow.mapSize.height = 1024;
                var d = 1000;
                dayLight.shadow.camera.left = - d;
                dayLight.shadow.camera.right = d;
                dayLight.shadow.camera.top = d;
                dayLight.shadow.camera.bottom = - d;
                dayLight.shadow.camera.far = 1000;
                scene.add(dayLight);
}

function createSky(){
                
                var r = 'assets/skyPics/';
                var urls = [ r + 'x1.jpg', r + 'x2.jpg',
                             r + 'y1.jpg', r + 'y2.jpg',
                             r + 'z1.jpg', r + 'z2.jpg' ];
                var textureCube = new THREE.CubeTextureLoader().load( urls );
                textureCube.format = THREE.RGBFormat;
                scene.background = textureCube;
}

function createFog(){

                scene.background = new THREE.Color( 0xcce0ff );
                scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

}



//infinite loop
function render() {
    cameraControl.update();

    if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
    {
        videoImageContext.drawImage( video, 0, 0 );
        if ( videoTexture ) 
            videoTexture.needsUpdate = true;
    }

    //render bulb
    renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 ); // to allow for very bright scenes.
                renderer.shadowMap.enabled = params.shadows;
                bulbLight.castShadow = params.shadows;
                if( params.shadows !== previousShadowMap ) {
                    //ballMat.needsUpdate = true;
                    //cubeMat.needsUpdate = true;
                    //floorMat.needsUpdate = true;
                    previousShadowMap = params.shadows;
                }
                bulbLight.power = bulbLuminousPowers[ params.bulbPower ];
                bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow( 0.02, 2.0 ); // convert from intensity to irradiance at bulb surface
                hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ];
                var time = Date.now() * 0.0005;
                var delta = clock.getDelta();
                bulbLight.position.y = Math.cos( time ) * 200 + 315;


    renderer.render(scene, camera);
    requestAnimationFrame(render);
    stats.update();
}




