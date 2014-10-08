attribute vec3 glVertex;
attribute vec3 glNormal;
attribute vec4 glColor;

varying vec4 vColor;
varying vec3 vVertexr;
varying vec3 vNormal;

void main(){
    vColor = glColor;
    vVertexr = glVertex;
    vNormal = normalize(glNormal);
    gl_Position = vec4(glVertex,1.0);
}