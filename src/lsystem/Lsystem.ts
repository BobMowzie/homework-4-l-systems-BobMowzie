import LSystemMesh from '../geometry/LSystemMesh';
import Cube from '../geometry/Cube';
import Mesh from '../geometry/Mesh';
import Turtle from './Turtle';
import { vec3, vec4 } from 'gl-matrix';
import { mat4, quat } from 'gl-matrix';

class LSystem {
    rulebook: Map<string, string[]>;
    lsystemMesh: LSystemMesh;
    turtles: Turtle[];
    currTurtle: Turtle;
    cube: Cube;
    trunkmesh: Mesh;
    leafmesh: Mesh;
    vinemesh: Mesh;        
  
    constructor() {
      this.rulebook = new Map();
      this.rulebook.set('F', ["F", "F", "FV", "F", "FRLF", "FRLF"]);
      this.rulebook.set('.', ["F[+F.]F.", "F[-F.]F."]);
      this.lsystemMesh = new LSystemMesh(vec3.fromValues(0, 0, 0));
      this.lsystemMesh.create();
      this.cube = new Cube(vec3.fromValues(0, 0, 0));
      this.cube.create();
      this.turtles = [];
      this.trunkmesh = loadOBJ("src/geometry/trunk.obj");
      this.leafmesh = loadOBJ("src/geometry/leaf.obj");
      this.vinemesh = loadOBJ("src/geometry/vine.obj");            
    }

    generate(iterations: number, axiom: string, twistIntensity: number, leafDensity: number, vineDensity: number) {
        var instructions = axiom;
        for (var i = 0; i < iterations; i++) {
            var newInstructions: string = "";
            for (var j = 0; j < instructions.length; j++) {
                var c = instructions.charAt(j);
                if (this.rulebook.has(c)) {
                    var replacements = this.rulebook.get(c);
                    var replacement;
                    var rand = Math.random();
                    for (var k = 0; k < replacements.length; k++) {
                        if (rand > 1./replacements.length * k) {
                            replacement = replacements[k];
                        }
                    }
                    newInstructions += replacement;
                }
                else {
                    newInstructions += c;
                }
            }
            instructions = newInstructions;
        }
        console.log(instructions);

        this.currTurtle = new Turtle();
        for (var i = 0; i < instructions.length; i++) {
            var c = instructions.charAt(i);
            if (c == "F") {
                this.lsystemMesh.addShape(this.trunkmesh, this.currTurtle.trans, vec4.fromValues(96/255, 84/255, 61/255, 1));
                mat4.scale(this.currTurtle.trans, this.currTurtle.trans, vec3.fromValues(0.98, 0.98, 0.98));
                mat4.translate(this.currTurtle.trans, this.currTurtle.trans, vec3.fromValues(0, 1.1, 0));
                this.currTurtle.depth++;
            }
            if (c == "L") {
                var rand = Math.random() * Math.min(this.currTurtle.depth/50, 1);
                if (rand > 1./leafDensity) {
                    var leafTrans = mat4.create();
                    mat4.translate(leafTrans, leafTrans, mat4.getTranslation(vec3.create(), this.currTurtle.trans));
                    mat4.rotate(leafTrans, leafTrans, (Math.random() - 0.5) * 2 * 3.14159 * 2, vec3.fromValues(0, 1, 0));
                    mat4.rotate(leafTrans, leafTrans, (Math.random()) * 1 - 0.3, vec3.fromValues(1, 0, 0));
                    mat4.rotate(leafTrans, leafTrans, (Math.random() - 0.5) * 2 * 0.2, vec3.fromValues(0, 0, 1));                                        
                    this.lsystemMesh.addShape(this.leafmesh, leafTrans, vec4.fromValues(37/255, 130/255, 48/255, 1));
                }
            }
            else if (c == "R") {
                var yaw = (Math.random() - 0.5) * 2 * twistIntensity;
                var pitch = (Math.random() - 0.5) * 0.7 * Math.min(this.currTurtle.depth/30, 1) * twistIntensity;
                mat4.rotate(this.currTurtle.trans, this.currTurtle.trans, pitch, vec3.fromValues(1, 0, 0));
                mat4.rotate(this.currTurtle.trans, this.currTurtle.trans, yaw, vec3.fromValues(0, 1, 0));
            }
            else if (c == "V") {
                var rand = Math.random() * Math.min(this.currTurtle.depth/30, 1);
                var vinelength = Math.floor(Math.random() * 10);
                if (rand > 1./vineDensity) {
                    var vineTrans = mat4.create();
                    mat4.translate(vineTrans, vineTrans, mat4.getTranslation(vec3.create(), this.currTurtle.trans));
                    this.lsystemMesh.addShape(this.vinemesh, vineTrans, vec4.fromValues(27/255, 110/255, 38/255, 1));
                    for (var j = 0; j < vinelength; j++) {
                        mat4.translate(vineTrans, vineTrans, vec3.fromValues(0, -2, 0));
                        this.lsystemMesh.addShape(this.vinemesh, vineTrans, vec4.fromValues(27/255, 110/255, 38/255, 1));    
                        if (Math.random() > 0.7) {
                            var leafTrans = mat4.create();
                            mat4.translate(leafTrans, leafTrans, mat4.getTranslation(vec3.create(), vineTrans));
                            mat4.rotate(leafTrans, leafTrans, (Math.random() - 0.5) * 2 * 3.14159 * 2, vec3.fromValues(0, 1, 0));
                            mat4.rotate(leafTrans, leafTrans, (Math.random()) * 1.5 + 1, vec3.fromValues(1, 0, 0));
                            mat4.scale(leafTrans, leafTrans, vec3.fromValues(0.3, 0.3, 0.3));
                            this.lsystemMesh.addShape(this.leafmesh, leafTrans, vec4.fromValues(37/255, 130/255, 48/255, 1));
                        }                    
                    }
                }
            }
            else if (c == "-") {
                var yaw = (Math.random() - 0.5) * 1 * twistIntensity;
                var pitch = (Math.random() + 0.3) * 1 * Math.min(this.currTurtle.depth/30, 1) * twistIntensity;
                mat4.rotate(this.currTurtle.trans, this.currTurtle.trans, pitch, vec3.fromValues(1, 0, 0));
                mat4.rotate(this.currTurtle.trans, this.currTurtle.trans, yaw, vec3.fromValues(0, 1, 0));
            }
            else if (c == "+") {
                var yaw = (Math.random() - 0.5) * 1 * twistIntensity;
                var pitch = (Math.random() + 0.3) * -1 * twistIntensity;
                mat4.rotate(this.currTurtle.trans, this.currTurtle.trans, pitch, vec3.fromValues(1, 0, 0));
                mat4.rotate(this.currTurtle.trans, this.currTurtle.trans, yaw, vec3.fromValues(0, 1, 0));
            }
            else if (c == "[") {
                var tempTurtle = new Turtle();
                mat4.copy(tempTurtle.trans, this.currTurtle.trans);
                tempTurtle.depth = this.currTurtle.depth;
                tempTurtle.pitch = this.currTurtle.pitch;
                this.turtles.push(tempTurtle);
            }
            else if (c == "]") {
                this.currTurtle = this.turtles.pop();
            }
        }
        this.lsystemMesh.create();
    }
}

// function matrixToAngles(matrix: mat4)
// {    
//     var sy = Math.sqrt(matrix[0][0] * matrix[0][0] +  matrix[1][0] * matrix[1][0]);
 
//     var singular = sy < Math.pow(10, -6);
 
//     var x, y, z;
//     if (!singular)
//     {
//         x = Math.atan2(matrix[2][1] , matrix[2][2]);
//         y = Math.atan2(-matrix[2][0], sy);
//         z = Math.atan2(matrix[1][0], matrix[0][0]);
//     }
//     else
//     {
//         x = Math.atan2(-matrix[1][2], matrix[1][1]);
//         y = Math.atan2(-matrix[2][0], sy);
//         z = 0;
//     }
//     return vec3.fromValues(x, y, z);
// }

function loadFile(file: string): string[] {
    var toReturn: string[] = [];
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                toReturn = allText.split("\n");
            }
        }
    }
    rawFile.send(null);
    return toReturn;
}

function loadOBJ(file: string): Mesh {
    var fileContents: string[] = loadFile(file);
    var mesh: Mesh = new Mesh(vec3.fromValues(0, 0, 0));
    var positions: number[] = [];
    var normals: number[] = [];
    var faces: string[] = [];
    for (var i = 0; i < fileContents.length; i++) {
        var line: string[] = fileContents[i].split(" ");
        if (line[0] == "v") {
            positions.push(parseFloat(line[1]));
            positions.push(parseFloat(line[2]));
            positions.push(parseFloat(line[3]));
        }
        if (line[0] == "vn") {
            normals.push(parseFloat(line[1]));
            normals.push(parseFloat(line[2]));
            normals.push(parseFloat(line[3]));
        }
        if (line[0] == "f") {
            faces.push(line[1]);
            faces.push(line[2]);
            faces.push(line[3]);
        }
    }
    for (var i = 0; i < faces.length; i += 3) {
        for (var k = 0; k < 3; k++) {
            var vert: string[] = faces[i + k].split("/");
            var posIndex = parseInt(vert[0]) - 1;
            var normIndex = parseInt(vert[2]) - 1;

            for (var j = 0; j < 3; j++) {
                mesh.positions.push(positions[posIndex * 3 + j]);
            }
            mesh.positions.push(1);

            for (var j = 0; j < 3; j++) {
                mesh.normals.push(normals[normIndex * 3 + j]);
            }
            mesh.normals.push(0);

            mesh.indices.push(i + k);
        }
    }
    return mesh;
}

export default LSystem;