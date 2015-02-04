attribute vec3 glVertex;
attribute vec3 glNormal;
//attribute vec2 glTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform vec3 uLightPosition;

//const float SpecularContribution = 1.0;
//const float DiffuseContribution = 1.0;
//const float DegreeBrightness = 80.0;

//varying float LigthIntensity;
varying vec2 MCposition;

varying vec3 ecPosition;
varying vec3 tnorm;
varying vec3 _normal;
varying vec3 vlightVec;

void main(){
    //textureCoord = glTextureCoord;
    vec4 ec4Position = uMVMatrix * vec4(glVertex, 1.0);
    ecPosition = vec3( uMVMatrix * vec4(glVertex, 1.0) )/ec4Position.w;
    vlightVec = uLightPosition - vec3(uMVMatrix * vec4(0.0));
    //vec3 ecFixPosition = vec3( uMVMatrix * vec4(0.0, 0.0, 0.0, 1.0) );
    tnorm = normalize(uNMatrix * glNormal);
    _normal = glNormal;
    //lightVec = normalize(uLightPosition - ecPosition);
    /*vec3 reflectVec = reflect(-lightVec, tnorm);
    vec3 viewVec = normalize(-ecPosition);*/
    
    
    /**** Ligting ****/
    /*float diffuse = max( dot(lightVec, tnorm), 0.0 );
    float spec = 0.0;
    if (diffuse > 0.0) {
        spec = max( dot(reflectVec, viewVec), 0.0 );
        spec = pow(spec, DegreeBrightness);
    }*/
    
    //LigthIntensity = DiffuseContribution * diffuse;// + SpecularContribution * spec;
    //MCposition = glVertex.xy;
    MCposition = ecPosition.xy;
    /****************/
    
    gl_Position = uPMatrix * ec4Position;
}