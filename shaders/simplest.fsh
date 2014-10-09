precision mediump float;

//uniform vec3 u_lightPosition;

varying vec3 uCamera;
//varying vec4 vColor;
varying vec3 vVertex;
varying vec3 vNormal;
varying vec3 v_lightPosition;

void main(){
    vec3 normal = normalize(vNormal);
    vec3 lightvector = normalize(v_lightPosition - vVertex);
    vec3 lookvector = normalize(uCamera - vVertex);
    vec3 reflectvector = reflect(-lightvector, normal);
    
    float ambient = 0.2;
    float k_diffuse=0.4;
    float k_specular=0.8;
    
    float diffuse = k_diffuse * max(dot(normal, lightvector), 0.0);
    float specular = k_specular * pow( max(dot(lookvector,reflectvector),0.0), 60.0 );
    
    vec3 one = vec3(1.0,1.0,1.0);
    vec3 light = (ambient+diffuse+specular)*one;
    
    //gl_FragColor = vec4(mix(light, vColor.rgb, 0.5), vColor.a);
    gl_FragColor = vec4(light, 1.0);
}