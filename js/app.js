function GL(canvas) {
    this.gl;
    this.shaderProgram = null;
    this.buffers = {};
    
    this.pMatrix = mat4.create();
    this.mvMatrix = mat4.create();
    
    function __init(canvas){
        try{
            this.gl = canvas.getContext('webgl');
            console.log("WebGl been initialized.");
            this.gl.enable(this.gl.DEPTH_TEST);
        }catch (e){
            console.error('Your brawser con\'t WebGL.');
        }
        
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        
        initBuffers.call(this);
        
        //console.log(initSurface(func,0.01));
        
        this.shaderProgram = this.initShaderProgram(GL.bind(function(shaderProgram){
            shaderProgram.useProgram();
            attachAtributes.call(this,shaderProgram);
            this.renderScene();
        },this));
        
        this.updateSize(400,400);
        this.gl.viewport(0,0,this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        
        mat4.perspective(this.pMatrix, 45, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, 0.1, 100.0);
        
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, 0.0, -4.0]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(-60), [1, 0.2, 0]);
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
        var dx = 0.2;
        var vert = initSurface(func,dx);
        this.buffers.vertex = new GL.ArrayBuffer(this.gl, {
            numItems  : vert.vert.length,
            itemSize : 3,
            list: vert.vert
        });
        
        var ind = initIndexList(vert.vert,dx);
        
//        this.buffers.color = new GL.ArrayBuffer(this.gl, {
//            numItems: 4,
//            itemSize: 4,
//            list: [
//                1.0, 0.5, 0.0, 1.0,
//                0.0, 1.0, 0.5, 1.0,
//                0.0, 0.5, 1.0, 1.0,
//                0.5, 0.0, 1.0, 1.0
//                
//                /*0.8, 0.8, 0.8, 1.0,
//                0.8, 0.8, 0.8, 1.0,
//                0.8, 0.8, 0.8, 1.0,*/
//            ]
//        });
        
        this.buffers.normal = new GL.ArrayBuffer(this.gl, {
            numItems: vert.norm.length,
            itemSize: 3 ,
            list: vert.norm
        });
        
        this.buffers.index = new GL.ElementBuffer(this.gl,{
            numItems  : ind.length,
            itemSize : 1,
            list: ind
        });
    };
    
    var attachAtributes = function(shaderProgram){
        shaderProgram.attachAtribute(this.buffers.vertex, "glVertex");
        //shaderProgram.attachAtribute(this.buffers.color, "glColor");
        shaderProgram.attachAtribute(this.buffers.normal, "glNormal");
        
        shaderProgram.attachUniform([0.5, 1.8, -4.0],"u_lightPosition");
        
        shaderProgram.initUniMatrix("uPMatrix");
        shaderProgram.initUniMatrix("uMVMatrix");
    };
    
    this.renderScene = function(){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.shaderProgram.updateUnMatrix("uPMatrix",this.pMatrix);
        this.shaderProgram.updateUnMatrix("uMVMatrix",this.mvMatrix);
        
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
    
    var initIndexList = function(vertex,dx){
        var l = vertex.length/3;
        var xl = Math.ceil(2/dx)+1;
        var n = 0, step = 1, db = 0;
        
        var list = [];
        
        while(n < l){
            db = n+xl;
            if (db >= l) break;
            
            if (db <= l){
                list.push(n);
                list.push(db);
            }
            
            if ( ((n+1)%xl === 0)&&(step>0) || (n%xl === 0)&&(step<0)  ){
                list.push(db);
                n = db;
                step *= -1;
            }else{
                n += step
            }
        }
        
        return list;
//        for (var n = 0; n<l; n++){
//            list.push(n);
//            if (n+xl <= l) list.push(n+xl);
//            
//            if (n%xl == 0){
//                list.push(n);
//            }
//        }
    };
    
    
    var initSurface = function(func, dx, dy){
        dy = dy || dx;
        var z = 0, _dx, _dy;
        var vert = [], norm = [];
        for (var i = -1; i<=1; i+=dx){
            for (var j = -1; j<=1; j+=dy) {
                z = func(i,j);
                vert.push(i);
                vert.push(j);
                vert.push(z);
                
                norm.push(-funcDx(i,j));
                norm.push(-funcDy(i,j));
                norm.push(1);
            }
        }
        
        return {
            vert: vert,
            norm: norm
        };
    };
    
    var func = function(x,y){
        return Math.exp(-3 * (x*x + y*y) );
    };
    
    var funcDx = function(x,y){
        return Math.exp(-3 * (x*x + y*y) )*(2*x + y*y);
    };
    
    var funcDy = function(x,y){
        return Math.exp(-3 * (x*x + y*y) )*(x*x + 2*y);
    };
    
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
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
    
    this.matrix = {};
    
    this.initUniMatrix = function(variable){
        this.matrix[variable] = gl.getUniformLocation(shaderProgram, variable);
    };
    
    this.updateUnMatrix = function(variable,data){
        gl.uniformMatrix4fv(this.matrix[variable],false,data);
    };
    
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