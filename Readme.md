## Gear 360 html5 viewer (based on RICOH THETA Dualfisheye three.js and three.js panorama equirectangular example)

## Notes
- Script to convert Gear 360 videos to a dash format is in dash_encode_script\dash_convert_x264.ps1. It expects ffmpeg and mp4box folders to be in the PATH environment variable.
- Make sure smarty/templates_c is writeable
- Update website path in config.php


### References
[Origional Japanese Source](http://qiita.com/mechamogera/items/b6eb59912748bbbd7e5d)  
[English translated source](https://community.theta360.guide/t/displaying-thetas-dual-fisheye-video-with-three-js/1160)  
[three.js webgl - equirectangular panorama example](https://threejs.org/examples/webgl_panorama_equirectangular.html)  

### Code Explanation, from the English translated source
Overview
Referencing Completely Understandable [WebGL Programming Even for Beginners, Taking the First Step with Three.js](https://html5experts.jp/yomotsu/5225/) I implemented three.js.


The configuration is as follows.

- Three.module.js: Main processing of Three.js Files you have acquired
- Index.html: HTML created to watch Dualfisheye video
- Theta-view.js: Dualfisheye JS created to watch videos
- test.mp4: Dualfisheye sample movie to display

I created a sphere, placed the camera inside, pasted and pasted a video texture with the video tag as the source.

Paste the Texture
In theta-view.js the following part sets the UV.

```
if (i < faceVertexUvs.length / 2) {
  var correction = (x == 0 && z == 0) ? 1 : (Math.acos(y) / Math.sqrt(x * x + z * z)) * (2 / Math.PI);
  uvs[ j ].x = x * (404 / 1920) * correction + (447 / 1920);
  uvs[ j ].y = z * (404 / 1080) * correction + (582 / 1080);
} else {
  var correction = ( x == 0 && z == 0) ? 1 : (Math.acos(-y) / Math.sqrt(x * x + z * z)) * (2 / Math.PI);
  uvs[ j ].x = -1 * x * (404 / 1920) * correction + (1460 / 1920);
  uvs[ j ].y = z * (404 / 1080) * correction + (582 / 1080);
}
```
Magic numbers of 404 and 447 correspond to the following sizes.
However, it is a rough value because it does not measure exactly.

![alt text](https://github.com/acalcutt/Gear360_html5_viewer/raw/master/doc/Arrangement.jpg "Arrangement of Dualfisheye")

The base code refers to this code in the answer to the following question.
[Javascript - Mapping image onto a sphere in Three.js - Stack Overflow](https://stackoverflow.com/questions/21663923/mapping-image-onto-a-sphere-in-three-js)

```
faceVertexUvs[ face ][ j ].x = face.vertexNormals[ j ].x * 0.5 + 0.5;
faceVertexUvs[ face ][ j ].y = face.vertexNormals[ j ].y * 0.5 + 0.5;
```

However, if you keep the above code, the image will be distorted.

![alt text](https://github.com/acalcutt/Gear360_html5_viewer/raw/master/doc/calculation_orig.png "Calcuiation Origional")

Therefore, we calculate and correct as follows.

Correction calculation

![alt text](https://github.com/acalcutt/Gear360_html5_viewer/raw/master/doc/calculation.jpg "Calcuiation Origional")