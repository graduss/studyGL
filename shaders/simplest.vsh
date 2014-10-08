attribute vec3 glVertex;
attribute vec3 glNormal;
attribute vec4 glColor;

varying vec3 vVertex;
varying vec3 vNormal;
varying vec4 vColor;

void main(){
    vVertex = glVertex;
    vNormal = normalize(glNormal);
    vColor = glColor;
    
    gl_Position = vec4(glVertex,1.0);
}