precision mediump float;

uniform sampler2D earth, other;

const float DiffuseContribution = 0.8;
const float DegreeBrightness = 14.0;

varying vec2 MCposition;

varying vec3 ecPosition;
varying vec3 tnorm;
varying vec3 _normal;
varying vec3 vlightVec;


const float radiusEarth = 2.0;
const float airL0 = radiusEarth*0.03;
const float airL1 = radiusEarth*0.20;


void main(){
    vec3 normal = normalize(tnorm);
    vec3 normal2 = normalize(_normal); 
    vec3 lightVec = normalize(vlightVec);
    vec3 viewVec = normalize(-ecPosition);
    
    vec3 halfVec = normalize(lightVec + viewVec);
    
    float diffuse = max( dot(lightVec, normal), 0.0 );
    float spec = 0.0;
    if (diffuse > 0.0) {
        spec = max( dot(halfVec, normal), 0.0 );
        spec = pow(spec, DegreeBrightness);
    }
    
    float end0 = sqrt(2.0*airL0*radiusEarth - airL0*airL0)/radiusEarth;
    float end1 = sqrt(2.0*airL1*radiusEarth - airL1*airL1)/radiusEarth;
    
    float k = dot(viewVec,normal);
    
    vec3 _mix = vec3(0.0);
    if (k < end0) {
        _mix = vec3(0.075, 0.175, 0.4) * mix( 0.0, 1.0, k/end0 );
    }else if (k < end1) {
        _mix = vec3(0.075, 0.175, 0.4) * mix( 1.0, 0.0, (k - end0)/(end1 - end0) );
    }
    
    
    vec3 color = vec3(0.0);
    vec3 _other = vec3(0.0);
    vec2 textureCoord;
    vec3 normal1;
    float v, u, at, alfa, beta, k1;
    
    if ( k >= end0 ) {
        beta = acos(normal2.z);
        alfa = 1.57*beta/(1.57 - end0);
        k1 = sin(alfa)/sin(beta);
        //normal1 = vec3(normal2.x * k1, normal2.y * k1, cos(alfa));
        //normal1 = normalize(normal1);
        normal1 = normal2;
        
        
        v = 1.0 - acos(normal1.y)/3.14;

        if (normal1.x == 0.0){
           at = 1.57; // PI/2
           if (normal1.z < 0.0) {
             at *= -1.0;  
           }
        }
       
        at = atan(normal1.z/normal1.x);

        if (normal1.x < 0.0){
           at += 3.14;
        }

        if (at < 0.0) {
           at = 6.28 + at; // 2*PI
        }

        u = 1.0 - at/6.28;

        textureCoord = vec2(u,v);

        color = vec3( texture2D(earth, textureCoord) );
        _other = vec3( texture2D(other, textureCoord) );
        
        if (normal1.x > 0.0 && normal1.z < 0.0) {
            //color = vec3(1.0,0.0,0.0);
        }
    }
    
    color *=  DiffuseContribution * diffuse;
    color += spec * _other.r;
    
    color += _mix;
        
    gl_FragColor = vec4(color, 1.0);
}