import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Turtle from '../lsystem/Turtle';

class LSystemMesh extends Drawable {
  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.indices = [];
    this.positions = [];
    this.normals = [];
    this.colors = [];    
  }

  create() {
    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateCol();    

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint32Array.from(this.indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.colors), gl.STATIC_DRAW);

    console.log(`Created lsystem`);

    this.indices = [];
    this.positions = [];
    this.normals = [];
    this.colors = [];
  }

  addShape(shape: Drawable, transformation: mat4, color: vec4) {
    var indicesEnd = this.positions.length/4;
    for (var i = 0; i < shape.indices.length; i++) {
      this.indices.push(indicesEnd + shape.indices[i]);
    }
    for (var i = 0; i < shape.positions.length; i += 4) {
      var posVec: vec4 = vec4.fromValues(shape.positions[i], shape.positions[i+1], shape.positions[i+2], shape.positions[i+3]);
      vec4.transformMat4(posVec, posVec, transformation);
      this.positions.push(posVec[0]);
      this.positions.push(posVec[1]);
      this.positions.push(posVec[2]);
      this.positions.push(posVec[3]);
    }
    for (var i = 0; i < shape.normals.length; i += 4) {
      var normVec: vec4 = vec4.fromValues(shape.normals[i], shape.normals[i+1], shape.normals[i+2], shape.normals[i+3]);
      vec4.transformMat4(normVec, normVec, transformation);
      this.normals.push(normVec[0]);
      this.normals.push(normVec[1]);
      this.normals.push(normVec[2]);
      this.normals.push(normVec[3]);
    }
    for (var i = 0; i < shape.normals.length; i += 4) {
      this.colors.push(color[0]);
      this.colors.push(color[1]);
      this.colors.push(color[2]);
      this.colors.push(color[3]);
    }
  }
};

export default LSystemMesh;
