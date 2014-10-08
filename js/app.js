function GL(canvas) {
    this.gl;
    this.shaderProgram = null;
    this.buffers = {};
    
    function __init(canvas){
        try{
            this.gl = canvas.getContext('webgl');
            console.log("WebGl been initialized.");
            this.gl.enable(this.gl.DEPTH_TEST);
        }catch (e){
            console.error('Your brawser con\'t WebGL.');
        }
        
        this.gl.clearColor(0.7, 0.7, 0.7, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        
        initBuffers.call(this);
        
        this.shaderProgram = this.initShaderProgram(GL.bind(function(shaderProgram){
            shaderProgram.useProgram();
            attachAtributes.call(this,shaderProgram);
            this.renderScene();
        },this));
        
        this.updateSize(400,400);
        this.gl.viewport(10,10,this.gl.drawingBufferWidth-20, this.gl.drawingBufferHeight-20);
    }
    
    this.initShaderProgram = function(collback){
        var sProgram  = new GL.ShaderProgram({
            vertex: "shaders/simplest.vsh",
            fragment: "shaders/simplest.fsh",
            gl: this.gl
        });
        
        if (typeof collback === "function") {
            sProgram.onInit = collback;
        }
        sProgram.initProgram();
        
        return sProgram;
    };
    
    var initBuffers = function(){
        this.buffers.vertex = new GL.ArrayBuffer(this.gl, {
            numItems  : 3,
            itemSize : 3,
            list: [
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0,
                0.0, 1.0, 0.0
            ]
        });
        
        this.buffers.color = new GL.ArrayBuffer(this.gl, {
            numItems: 3,
            itemSize: 4,
            list: [
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0
                
                /*0.8, 0.8, 0.8, 1.0,
                0.8, 0.8, 0.8, 1.0,
                0.8, 0.8, 0.8, 1.0,*/
            ]
        });
        
        this.buffers.normal = new GL.ArrayBuffer(this.gl, {
            numItems: 3,
            itemSize: 3 ,
            list: [
                0.0, 0.0, 4.0,
                0.0, 0.0, 4.0,
                0.0, 0.0, 4.0
            ]
        });
        
        this.buffers.index = new GL.ElementBuffer(this.gl,{
            numItems  : 3,
            itemSize : 1,
            list: [
                0, 1, 2
            ]
        });
    };
    
    var attachAtributes = function(shaderProgram){
        shaderProgram.attachAtribute(this.buffers.vertex, "glVertex");
        shaderProgram.attachAtribute(this.buffers.color, "glColor");
        shaderProgram.attachAtribute(this.buffers.normal, "glNormal");
        
        shaderProgram.attachUniform([0.0, 0.0, -5.0],"u_camera");
        shaderProgram.attachUniform([0.0, 0.0, -2.0],"u_lightPosition");
    };
    
    this.renderScene = function(){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.gl.bindBuffer(this.buffers.index.TYPE, this.buffers.index.buffer);
        this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.buffers.index.numItems, this.gl.UNSIGNED_SHORT, 0);
    };
    
    this.updateSize = function(width,height){
        width = width || null;
        height = height || null;
        this.gl.canvas.width = width || this.gl.canvas.offsetWidth;
        this.gl.canvas.height = height || this.gl.canvas.offsetHeight;

        console.log("Set size: width: " + this.gl.drawingBufferWidth 
                + ", Heigth: " + this.gl.drawingBufferHeight + ".");
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
    var shaderProgram = null;
    this.shaders = {};
    this.onInit = null;
    
    this.attachAtribute = function(buffer,variable){
        var vertexVariable = gl.getAttribLocation(shaderProgram,variable);
        gl.enableVertexAttribArray(vertexVariable);
        
        gl.bindBuffer(buffer.TYPE, buffer.buffer);
        gl.vertexAttribPointer(vertexVariable, buffer.itemSize, gl.FLOAT, false, 0, 0);
    };
    
    this.attachUniform = function(data,variable){
        var uniformVariable = gl.getUniformLocation(shaderProgram, variable);
        gl.uniform3fv(uniformVariable,new Float32Array(data));
    };
    
    this.useProgram = function(){
        gl.useProgram(shaderProgram);
    };
    
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
    
    this.initProgram = function(){
        if (!(this.shaders[this.VERTEX] && this.shaders[this.FRAGMENT])){
            getSaders.call(this,GL.bind(function(){
                this.initProgram();
            },this));
            return;
        };
        
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, this.shaders[this.VERTEX]);
        gl.attachShader(shaderProgram, this.shaders[this.FRAGMENT]);
        gl.linkProgram(shaderProgram);
        
        if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) !== true) {
            console.error("Could not initialise shaders");
        }
        
        if (typeof this.onInit === "function") this.onInit(this);
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

GL.ArrayBuffer = function ArrayBuffer(gl,data){
    this.TYPE = gl.ARRAY_BUFFER;
    this.DataConvert = Float32Array;
    
    this.buffer = gl.createBuffer();
    
    this.itemSize = null;
    this.numItems = null;
    
    this.setData = function(data){
        this.__proto__.setData.call(this,gl,data);
    };
    
    
    if (data) this.setData(data);
};

GL.ElementBuffer = function ElementBuffer(gl,data){
    this.TYPE = gl.ELEMENT_ARRAY_BUFFER;
    this.DataConvert = Uint16Array;
    
    this.buffer = gl.createBuffer();
    
    this.itemSize = null;
    this.numItems = null;
    
    this.setData = function(data){
        this.__proto__.setData.call(this,gl,data);
    };
    
    
    if (data) this.setData(data);
};

GL.Buffer = function Buffer(){
    this.setData = function(gl,data){
        gl.bindBuffer(this.TYPE, this.buffer);
        gl.bufferData(this.TYPE, new this.DataConvert(data.list), gl.STATIC_DRAW);
        this.itemSize = data.itemSize;
        this.numItems = data.numItems;
    };
};

GL.ArrayBuffer.prototype = GL.ElementBuffer.prototype = new GL.Buffer();

window.onload = function(){
    var c = document.getElementById('gl');
    gl = new GL(c);
    //gl.renderScene();
};