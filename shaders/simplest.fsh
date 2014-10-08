precision mediump float;

uniform vec3 u_camera;
uniform vec3 u_lightPosition;

varying vec4 vColor;
varying vec3 vVertex;
varying vec3 vNormal;

void main(){
    vec3 normal = normalize(vNormal);
    vec3 lightvector = normalize(u_lightPosition - vVertex);
    vec3 lookvector = normalize(u_camera - vVertex);
    vec3 reflectvector = reflect(-lightvector, normal);
    
    float ambient=0.6;
    float k_diffuse=0.8;
    float k_specular=0.6;
    
    float diffuse = k_diffuse * max(dot(normal, lightvector), 0.0);
    float specular = k_specular * pow( max(dot(lookvector,reflectvector),0.0), 20.0 );
    
    gl_FragColor = vec4((ambient+diffuse+specular)*vColor.rgb, vColor.a);
    //gl_FragColor = vColor;
}