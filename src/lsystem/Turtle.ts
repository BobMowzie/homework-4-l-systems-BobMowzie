import { vec3, vec4, mat4, quat } from "gl-matrix";

class Turtle {
    depth: number;
    trans: mat4;
    pitch: number;
  
    constructor() {
        this.depth = 0;
        this.trans = mat4.create();
        this.pitch = 0.;
    }
}

export default Turtle;