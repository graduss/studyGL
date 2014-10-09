attribute vec3 glVertex;
attribute vec3 glNormal;
//attribute vec4 glColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec3 u_lightPosition;

varying vec3 uCamera;
varying vec3 vVertex;
varying vec3 vNormal;
varying vec3 v_lightPosition;
//varying vec4 vColor;

void main(){
    vVertex = (uMVMatrix * vec4(glVertex,1.0)).xyz;
    vNormal = normalize(uMVMatrix * vec4(glNormal,1.0)).xyz;
    v_lightPosition = u_lightPosition;
    //vColor = glColor;
    
    vec4 camera4 = uMVMatrix * vec4(glVertex,1.0);
    uCamera = camera4.xyz / camera4.w;
    
    gl_Position = uPMatrix * vec4(vVertex,1.0);
}