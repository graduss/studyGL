function GL(canvas) {
    this.gl;
    this.shaderProgram = null;
    function __init(canvas){
        try{
            this.gl = canvas.getContext('webgl');
            console.log("WebGl been initialized.");
            this.gl.enable(this.gl.DEPTH_TEST);
        }catch (e){
            console.error('Your brawser con\'t WebGL.');
        }
    }
    
    this.initShaderProgram = function(){
        var sProgram  = new GL.ShaderProgram({
            vertex: "shaders/simplest.vsh",
            fragment: "shaders/simplest.fsh",
            gl: this.gl
        });
        
        sProgram.initProgram();
    };
    
    /*this.initSaderProgram = function(){
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
    };*/
    
    this.renderScene = function(){
        this.gl.clearColor(0.0, 0.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    };
    
    __init.call(this,canvas);
}

GL.ShaderProgram = function ShaderProgram(conf){
    this.VERTEX = 0;
    this.FRAGMENT = 1;
    
    var urls = {};
    urls[this.VERTEX] = conf.vertex || null;
    urls[this.FRAGMENT] = conf.fragment || null;
    
    var gl = conf.gl || null;
    
    this.shaders = {};
    
    this.getSader = function(type, collback){
        load(type, GL.bind(function(soursCode){
            var shader = null;
            if (type === this.VERTEX) {
                shader = gl.createShader(gl.VERTEX_SHADER);
            }else if (type === this.FRAGMENT) {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            }
            
            gl.shaderSource(shader,soursCode);
            gl.compileShader(shader);
            
            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
                console.error(gl.getShaderInfoLog(shader));
                return null;
            }
            
            this.shaders[type] = shader;
            shader = null;
            if (typeof collback === "function") collback(this.shaders[type]);
        },this));
    };
    
    this.initProgram = function(collback){
        if (!(this.shaders[this.VERTEX] && this.shaders[this.FRAGMENT])){
            getSaders.call(this,GL.bind(function(){
                console.log(this);
                this.initProgram(collback);
            },this));
            return;
        }
    };
    
    var getSaders = function(collback){
        if(!this.shaders[this.VERTEX]) {
            this.getSader(this.VERTEX,GL.bind(function(){
                if(this.shaders[this.FRAGMENT]) collback();
            },this));
        }
        
        if (!this.shaders[this.FRAGMENT]) {
            this.getSader(this.FRAGMENT,GL.bind(function(){
                if(this.shaders[this.VERTEX]) collback();
            },this));
        }
    };
    
    var load = function(shader,collback){
        if(urls[shader] === null) {
            console.error("Url shader is undefaind");
        };

        var xhr = new XMLHttpRequest();
        xhr.open("get", urls[shader]);

        xhr.onreadystatechange = function(){
            if (this.readyState === 4){
                if (this.status === 200){
                    collback(this.responseText,this);
                }else{
                    console.error("Shader load ERROR");
                }
            }
        };

        xhr.send();
    };
};

GL.bind = function(fn,obj){
    return function(){ fn.apply(obj,arguments); };
};

window.onload = function(){
    var c = document.getElementById('gl');
    gl = new GL(c);
    gl.initShaderProgram();
    //gl.renderScene();
};