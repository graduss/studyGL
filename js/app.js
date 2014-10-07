function GL(canvas) {
    this.gl;
    this.shaderProgram = null;
    function __init(canvas){
        try{
            this.gl = canvas.getContext('webgl');
            console.log("WebGl been initialized.");
        }catch (e){
            console.error('Your brawser con\'t WebGL.');
        }
    }
    
    this.initSaderProgram = function(){
        var shader_fs = this.getShader("shader-fs");
        var shader_vs = this.getShader("shader-vs");

        var shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, shader_vs);
        this.gl.attachShader(shaderProgram, shader_fs);
        this.gl.linkProgram(shaderProgram);

        if (this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS) !== true) {
            console.error("Could not initialise shaders");
        }

        this.gl.useProgram(shaderProgram);

        this.shaderProgram = shaderProgram;
    };
    
    this.getShader = function(id){
        var shaderScript = document.getElementById(id);
        if (shaderScript === null) return null;

        var str = '';
        var tn = shaderScript.firstChild;
        while (tn) {
            if (tn.nodeType === document.TEXT_NODE) {
                str += tn.textContent;
            }

            tn = tn.nextSibling;
        }

        var shader = null;
        if (shaderScript.type === 'x-shader/x-fragment'){
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        }else if (shaderScript.type === 'x-shader/x-vertex') {
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);

        }else return null;


        this.gl.shaderSource(shader,str);
        this.gl.compileShader(shader);

        if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS) !== true){
            console.error(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    };
    
    this.renderScene = function(){
        this.gl.clearColor(0.0, 0.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    };
    
    __init.call(this,canvas);
}

window.onload = function(){
    var c = document.getElementById('gl');
    gl = new GL(c);
    
    //gl.renderScene();
};