import * as mat4 from "./lib/gl-matrix/mat4.js"
import * as vec3 from "./lib/gl-matrix/vec3.js"

"use strict";

const positionAttributeLocation = 3;
const colorAttributeLocation = 8;

const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
layout(location=${positionAttributeLocation}) in vec4 a_Position;
layout(location=${colorAttributeLocation}) in vec4 a_Color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// a varying the color to the fragment shader
out vec4 v_color;

// all shaders have a main function
void main(){
    // Multiply the position by the matrix.
    gl_Position = u_matrix * a_Position;

    // Pass the color to the fragment shader.
    v_color = a_Color;
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

// the varied color passed from the vertex shader
in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 fColor;

void main(){
        fColor = v_color;
}
`;

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector("#project2");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    //compile the shaders and link into a program
    let shader_one = gl.createShader(gl.VERTEX_SHADER);
    let shader_two = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader_one, vertexShaderSource);
    gl.compileShader(shader_one);
    gl.shaderSource(shader_two, fragmentShaderSource);
    gl.compileShader(shader_two);
    let link_program = gl.createProgram();
    gl.attachShader(link_program, shader_one);
    gl.attachShader(link_program, shader_two);
    gl.linkProgram(link_program);
    gl.useProgram(link_program);

    //이벤트 리스너로 경도 위도 변경
    document.getElementById("longitude").oninput = function(ev) {
        make_new(gl, canvas, link_program); document.getElementById("longitude_text").innerText=document.getElementById("longitude").value;};
    document.getElementById("latitude").oninput = function(ev) {
        make_new(gl, canvas, link_program); document.getElementById("latitude_text").innerText=document.getElementById("latitude").value;};
    make_new(gl, canvas, link_program); //화면 업데이트
}

function degToRad(d) {
    return d * Math.PI / 180;
}

//화면 업데이트
function make_new(gl, canvas, link_program){
    var longitude = parseInt(document.getElementById("longitude").value);
    var latitude = parseInt(document.getElementById("latitude").value);

    // look up where the vertex data needs to go.
    const vao = createVertexBuffer({gl, positionAttributeLocation, colorAttributeLocation, longitude, latitude});
    gl.enable(gl.DEPTH_TEST);

    //Clear the canvas (화면초기화)
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const matrixLocation = gl.getUniformLocation(link_program, 'u_matrix');

    //Multi ViewPort
    //첫번째 화면
    const w = canvas.width;
    const h = canvas.height;
    gl.viewport(0, 0, w/2, h);
    //카메라 설정
    const P = mat4.create();
    const V = mat4.create();
    var MVP = mat4.create();
    mat4.perspective(P, degToRad(30), 1, 1, 100);
    mat4.lookAt(V, [35, 35, 55], [0, 0, 0], [0, 1, 0]);
    mat4.multiply(MVP, P, V);

    //Set the matrix
    gl.uniformMatrix4fv(matrixLocation, false, MVP);

    //Draw the geometry.
    gl.bindVertexArray(vao); 
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.drawArrays(gl.LINE_STRIP, 36, 6);
    gl.drawArrays(gl.LINE_LOOP, 42, 24);
    gl.drawArrays(gl.LINE_LOOP, 66, 24);
    gl.drawArrays(gl.LINE_STRIP, 90, 2);
    gl.bindVertexArray(null); 

    //두번째 화면
    gl.viewport(w/2, 0, w/2, h);
    //카메라 설정
    mat4.perspective(MVP, degToRad(30), 1, 1, 100);
    mat4.translate(MVP, MVP, [0, 0, -10]);
    mat4.rotate(MVP, MVP, degToRad(longitude), [0, -1, 0]);
    mat4.rotate(MVP, MVP, degToRad(latitude), [1, 0, 0]);

    //Set the matrix
    gl.uniformMatrix4fv(matrixLocation, false, MVP);

    //Draw the geometry.
    gl.bindVertexArray(vao); 
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.drawArrays(gl.LINE_STRIP, 36, 6);
    gl.bindVertexArray(null); 
}

//create Vertex and Buffer
function createVertexBuffer({gl, positionAttributeLocation, colorAttributeLocation, longitude, latitude})
{
    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray();
    // and make it the one we're currently working with
    gl.bindVertexArray(vao); 

    //큐브, x축, y축, z축, 경도, 위도, 카메라
    var positionsColors = new Float32Array([
    //cube단면
    -1.0, -1.0,  -1.0, 0.8, 0.2, 0.7,
    -1.0,  1.0,  -1.0,  0.8, 0.2, 0.7,
     1.0, -1.0,  -1.0,  0.8, 0.2, 0.7,
    -1.0,  1.0,  -1.0,  0.8, 0.2, 0.7,
     1.0,  1.0,  -1.0,  0.8, 0.2, 0.7,
     1.0, -1.0,  -1.0,  0.8, 0.2, 0.7,

    -1.0, -1.0, 1.0,  0.3, 0.9, 1.0, 
     1.0, -1.0, 1.0,  0.3, 0.9, 1.0,
    -1.0, 1.0, 1.0,  0.3, 0.9, 1.0,
    -1.0, 1.0, 1.0,  0.3, 0.9, 1.0,
     1.0, -1.0, 1.0,  0.3, 0.9, 1.0,
     1.0, 1.0, 1.0,  0.3, 0.9, 1.0,

    -1.0, 1.0, -1.0,  0.2, 0.6, 0.4,
    -1.0, 1.0,  1.0,  0.2, 0.6, 0.4,
     1.0, 1.0, -1.0,  0.2, 0.6, 0.4,
    -1.0, 1.0,  1.0,  0.2, 0.6, 0.4,
     1.0, 1.0,  1.0,  0.2, 0.6, 0.4,
     1.0, 1.0, -1.0,  0.2, 0.6, 0.4,

    -1.0,  -1.0, -1.0,        0.8, 0.3, 0.1,
     1.0,  -1.0, -1.0,         0.8, 0.3, 0.1,
    -1.0,  -1.0,  1.0,         0.8, 0.3, 0.1,
    -1.0,  -1.0,  1.0,         0.8, 0.3, 0.1,
     1.0,  -1.0, -1.0,         0.8, 0.3, 0.1,
     1.0,  -1.0,  1.0,         0.8, 0.3, 0.1,

    -1.0,  -1.0, -1.0,        0.8, 0.5, 0.1,
    -1.0,  -1.0,  1.0,        0.8, 0.5, 0.1,
    -1.0,   1.0, -1.0,        0.8, 0.5, 0.1,
    -1.0,  -1.0,  1.0,        0.8, 0.5, 0.1,
    -1.0,   1.0,  1.0,        0.8, 0.5, 0.1,
    -1.0,   1.0, -1.0,        0.8, 0.5, 0.1,

     1.0,  -1.0, -1.0,        0.1, 0.3, 0.9,
     1.0,   1.0, -1.0,        0.1, 0.3, 0.9,
     1.0,  -1.0,  1.0,        0.1, 0.3, 0.9,
     1.0,  -1.0,  1.0,        0.1, 0.3, 0.9,
     1.0,   1.0, -1.0,        0.1, 0.3, 0.9,
     1.0,   1.0,  1.0,        0.1, 0.3, 0.9,

     //x축
     0, 0, 0, 1, 0, 0,
     10, 0, 0, 1, 0, 0,
     //y축
     0, 0, 0, 0, 1, 0,
     0, 10, 0, 0, 1, 0,

     //z축
     0, 0, 0, 0, 0, 1,
     0, 0, 10, 0, 0, 1,

     //위도
     0, 0, 10, 1, 1, 1,
     2.59, 0, 9.66, 1, 1, 1,
     5, 0, 8.7, 1, 1, 1,
     7.07, 0, 7.07, 1, 1, 1,
     8.7, 0, 5, 1, 1, 1,
     9.66, 0, 2.59, 1, 1, 1,
     10, 0, 0, 1, 1, 1,
     9.66, 0, -2.59, 1, 1, 1,
     8.7, 0, -5, 1, 1, 1,
     7.07, 0, -7.07, 1, 1, 1,
     5, 0, -8.7, 1, 1, 1,
     2.59, 0, -9.66, 1, 1, 1,
     0, 0, -10, 1, 1, 1,
     -2.59, 0, -9.66, 1, 1, 1,
     -5, 0, -8.7, 1, 1, 1,
     -7.07, 0, -7.07, 1, 1, 1,
     -8.7, 0, -5, 1, 1, 1,
     -9.66, 0, -2.59, 1, 1, 1,
     -10, 0, 0, 1, 1, 1,
     -9.66, 0, 2.59, 1, 1, 1,
     -8.7, 0, 5, 1, 1, 1,
     -7.07, 0, 7.07, 1, 1, 1,
     -5, 0, 8.7, 1, 1, 1,
     -2.59, 0, 9.66, 1, 1, 1,

     //경도
     0, 10, 0, 1, 0.7, 0,
     0, 9.66, 2.59, 1, 0.7, 0,
     0, 8.7, 5, 1, 0.7, 0,
     0, 7.07, 7.07, 1, 0.7, 0,
     0, 5, 8.7, 1, 0.7, 0,
     0, 2.59, 9.66, 1, 0.7, 0,
     0, 0, 10, 1, 0.7, 0,
     0, -2.59, 9.66, 1, 0.7, 0,
     0, -5, 8.7, 1, 0.7, 0,
     0, -7.07, 7.07, 1, 0.7, 0,
     0, -8.7, 5, 1, 0.7, 0,
     0, -9.66, 2.59, 1, 0.7, 0,
     0, -10, 0, 1, 0.7, 0,
     0, -9.66, -2.59, 1, 0.7, 0,
     0, -8.7, -5, 1, 0.7, 0,
     0, -7.07, -7.07, 1, 0.7, 0,
     0, -5, -8.7, 1, 0.7, 0,
     0, -2.59, -9.66, 1, 0.7, 0,
     0, 0, -10, 1, 0.7, 0,
     0, 2.59, -9.66, 1, 0.7, 0,
     0, 5, -8.7, 1, 0.7, 0,
     0, 7.07, -7.07, 1, 0.7, 0,
     0, 8.7, -5, 1, 0.7, 0,
     0, 9.66, -2.59, 1, 0.7, 0,

     0, 0, 0, 0.7, 0.4, 0.8,
     0, 0, 10, 0.7, 0.4, 0.8,
    ]);
    
    

    //경도 선 변화
    for(var i = 0; i < 24; i++){
        var x = positionsColors[396+6*i];
        var y =  positionsColors[397+6*i];
        var z = positionsColors[398+6*i];
        var compare = vec3.create();
        vec3.set(compare, x,y,z);
        vec3.rotateY(compare, compare, [0, y, 0], degToRad(longitude));
        positionsColors[396+6*i] = compare[0];
        positionsColors[397+6*i] = compare[1];
        positionsColors[398+6*i] = compare[2];
    }

    //카메라 선
    var camera_x = positionsColors[546];
    var camera_y = positionsColors[547];
    var camera_z = positionsColors[548];
    var camera_compare = vec3.create();
    vec3.set(camera_compare, camera_x,camera_y,camera_z);
    vec3.rotateX(camera_compare, camera_compare, [camera_x, 0, 0], degToRad(-latitude));
    vec3.rotateY(camera_compare, camera_compare, [0, camera_y, 0], degToRad(longitude));
    positionsColors[546] = camera_compare[0];
    positionsColors[547] = camera_compare[1];
    positionsColors[548] = camera_compare[2];


    // Create a buffer object
    const vbo = gl.createBuffer();
    
    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, positionsColors, gl.STATIC_DRAW);
    
    const FSIZE = positionsColors.BYTES_PER_ELEMENT;


    // 위치 Vertex
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = FSIZE * 6;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);
    
    // 색상 Vertex
    // Turn on the attribute
    gl.enableVertexAttribArray(colorAttributeLocation);
    
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = true; // normalize the data
    var stride = FSIZE * 6;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = FSIZE * 3;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        colorAttributeLocation, size, type, normalize, stride, offset);

    gl.bindVertexArray(null); 
    gl.disableVertexAttribArray(positionAttributeLocation);
    gl.disableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return vao;
}
main();
