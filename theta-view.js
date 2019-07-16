import * as THREE from '/three.module.js';
var camera, scene, renderer;

var canvas = document.getElementById("v1");
var video = document.getElementById("video" );

var isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

init();
renderLoop();

function init() {
	var mesh, i;
	
	scene = new THREE.Scene();
	var width  = canvas.clientWidth;
	var height = canvas.clientHeight - 100;
	var fov    = 75;
	var aspect = width / height;
	var near   = 1;
	var far    = 1100;
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.target = new THREE.Vector3( 0, 0, 0 );

	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );

	var element = renderer.domElement;
	document.body.appendChild( element );
	
	var texture = new THREE.VideoTexture( video );
	texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;
	
	var geometry = new THREE.SphereGeometry(100, 32, 32, 0);
	geometry.scale(-1, 1, 1);

  var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
  for ( i = 0; i < faceVertexUvs.length; i++ ) {
    var uvs = faceVertexUvs[ i ];
    var face = geometry.faces[ i ];
    for ( var j = 0; j < 3; j ++ ) {
      var x = face.vertexNormals[ j ].x;
	    var y = face.vertexNormals[ j ].y;
	    var z = face.vertexNormals[ j ].z;

      if (i < faceVertexUvs.length / 2) {
        var correction = (x == 0 && z == 0) ? 1 : (Math.acos(y) / Math.sqrt(x * x + z * z)) * (2 / Math.PI);
        uvs[ j ].x = x * (443 / 1920) * correction + (480 / 1920);
        uvs[ j ].y = z * (443 / 1080) * correction + (600 / 1080);

      } else {
        var correction = ( x == 0 && z == 0) ? 1 : (Math.acos(-y) / Math.sqrt(x * x + z * z)) * (2 / Math.PI);
        uvs[ j ].x = -1 * x * (443 / 1920) * correction + (1440 / 1920);
        uvs[ j ].y = z * (443 / 1080) * correction + (600 / 1080);
      }
    }
  }

    geometry.rotateZ(90 * Math.PI / 180);//radians
	geometry.rotateX(270 * Math.PI / 180);

	var material = new THREE.MeshBasicMaterial( { map: texture } );
	var mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	document.addEventListener( 'mousedown', onPointerStart, false );
	document.addEventListener( 'mousemove', onPointerMove, false );
	document.addEventListener( 'mouseup', onPointerUp, false );

	document.addEventListener( 'wheel', onDocumentMouseWheel, false );

	document.addEventListener( 'touchstart', onPointerStart, false );
	document.addEventListener( 'touchmove', onPointerMove, false );
	document.addEventListener( 'touchend', onPointerUp, false );

	//

	document.addEventListener( 'dragover', function ( event ) {

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

	}, false );

	document.addEventListener( 'dragenter', function () {

		document.body.style.opacity = 0.5;

	}, false );

	document.addEventListener( 'dragleave', function () {

		document.body.style.opacity = 1;

	}, false );

	document.addEventListener( 'drop', function ( event ) {

		event.preventDefault();

		var reader = new FileReader();
		reader.addEventListener( 'load', function ( event ) {

			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;

		}, false );
		reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

		document.body.style.opacity = 1;

	}, false );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	canvas.style.width = '100%';
	canvas.style.height = '100%';
	var width  = canvas.clientWidth;
	var height = canvas.clientHeight - 100;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize( width, height );
}

function onPointerStart( event ) {
	isUserInteracting = true;

	var clientX = event.clientX || event.touches[ 0 ].clientX;
	var clientY = event.clientY || event.touches[ 0 ].clientY;

	onMouseDownMouseX = clientX;
	onMouseDownMouseY = clientY;

	onMouseDownLon = lon;
	onMouseDownLat = lat;
}

function onPointerMove( event ) {
	if ( isUserInteracting === true ) {
		var clientX = event.clientX || event.touches[ 0 ].clientX;
		var clientY = event.clientY || event.touches[ 0 ].clientY;

		lon = ( onMouseDownMouseX - clientX ) * 0.1 + onMouseDownLon;
		lat = ( clientY - onMouseDownMouseY ) * 0.1 + onMouseDownLat;
	}
}

function onPointerUp() {
	isUserInteracting = false;
}

function onDocumentMouseWheel( event ) {
	var fov = camera.fov + event.deltaY * 0.05;
	camera.fov = THREE.Math.clamp( fov, 10, 75 );
	camera.updateProjectionMatrix();
}

function renderLoop() {
	requestAnimationFrame( renderLoop );
	update();
}

function update() {
	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );

	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.y = 500 * Math.cos( phi );
	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

	camera.lookAt( camera.target );

	/*
	// distortion
	camera.position.copy( camera.target ).negate();
	*/

	renderer.render( scene, camera );

}