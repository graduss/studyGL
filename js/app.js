function GL(canvas) {
    this.gl;
    this.shaderProgram = null;
    this.buffers = {};
    
    this.pMatrix = mat4.create();
    this.mvMatrix = mat4.create();
    this.nMatrix = mat3.create();
    this.lightPosition = vec3.create();
    
    this.brickColor = vec3.create();
    this.mortarColor = vec3.create();
    this.btickSize = vec2.create();
    this.brickPct = vec2.create();
    this.textures = {};
    
    var radiusEarth = 2;
    
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
        
        this.shaderProgram = this.initShaderProgram(GL.bind(function(shaderProgram){
            shaderProgram.useProgram();
            attachAtributes.call(this,shaderProgram);
            GL.texpureLoader({
                app : this,
                list: [
                    { url: "images/earth.jpg", name: "earth" },
                    { url: "images/other.jpg", name: "other" }
                ]
            }, GL.bind(allLoad, this));
            
        },this));
        
        this.updateSize(400,400);
        this.gl.viewport(0,0,this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        
        mat4.perspective(this.pMatrix, 45, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, 0.1, 100.0);
        
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, 0.0, -6.0]);
        
        vec3.set(this.lightPosition, 0, 0, 10.5);
        
        vec3.set(this.brickColor, 1, 0.3, 0.2);
        vec3.set(this.mortarColor, 0.85, 0.86, 0.84);
        vec2.set(this.btickSize, 0.3, 0.15);
        vec2.set(this.brickPct, 0.9, 0.85);
        
        GL.initListiner.apply(this);
    }
    
    var allLoad = function(){
        //this.shaderProgram.attachSampler(this.moon.texture,"moon");
        GL.tick.apply(this);
    };
    
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
        var buffersArray = getData();
        
        this.buffers.vertex = new GL.ArrayBuffer(this.gl,{
            list: buffersArray.vertex,
            itemSize: 3
        });
        
        this.buffers.normal = new GL.ArrayBuffer(this.gl,{
            list: buffersArray.normal,
            itemSize: 3
        });
        
        /*this.buffers.textureCoor = new GL.ArrayBuffer(this.gl,{
            list: buffersArray.textureCoor,
            itemSize: 2
        });*/
        
        this.buffers.index = new GL.ElementBuffer(this.gl,{
            list: buffersArray.index,
            itemSize: 1
        });
    };
    
    var getData = function(){
        var answer = {
            vertex : [],
            normal: [],
            textureCoor: [],
            index: []
        };
        
        var latitudeBands = 60;
        var longitudeBands = 60;
        var radius = radiusEarth;
        
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);
            
            for(var longNumber=0; longNumber <= longitudeBands; longNumber++){
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
                
                var x = cosPhi * sinTheta,
                    z = sinPhi * sinTheta,
                    y = cosTheta,
                    u = 1 - (longNumber / longitudeBands),
                    v = 1 - (latNumber / latitudeBands);
            
                answer.normal.push(x), answer.normal.push(y), answer.normal.push(z);
                answer.textureCoor.push(u), answer.textureCoor.push(v);
                answer.vertex.push(radius * x), answer.vertex.push(radius * y),answer.vertex.push(radius * z);
            }
        }
        
        for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                
                answer.index.push(first),
                answer.index.push(second),
                answer.index.push(first + 1);

                answer.index.push(second),
                answer.index.push(second + 1),
                answer.index.push(first + 1);
            }
        }
        
        return answer;
    };
    
    var attachAtributes = function(shaderProgram){
        shaderProgram.attachAtribute(this.buffers.vertex, "glVertex");
        shaderProgram.attachAtribute(this.buffers.normal, "glNormal");
        //shaderProgram.attachAtribute(this.buffers.textureCoor, "glTextureCoord");
        
        shaderProgram.initUniMatrix("uPMatrix");
        shaderProgram.initUniMatrix("uMVMatrix");
        shaderProgram.initUniMatrix("uNMatrix");
        shaderProgram.initUniMatrix("uLightPosition");
        
        shaderProgram.initUniMatrix("uBrickColor");
        shaderProgram.initUniMatrix("uMortarColor");
        shaderProgram.initUniMatrix("uBtickSize");
        shaderProgram.initUniMatrix("uBrickPct");
    };
    
    this.renderScene = function(){
        mat3.identity(this.nMatrix);
        mat3.normalFromMat4(this.nMatrix, this.mvMatrix);
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.shaderProgram.updateUnMatrix("uPMatrix", this.pMatrix);
        this.shaderProgram.updateUnMatrix("uMVMatrix", this.mvMatrix);
        this.shaderProgram.updateUnMatrix("uNMatrix", this.nMatrix, "3fv");
        this.shaderProgram.updateUnVec("uLightPosition", this.lightPosition);
        
        this.shaderProgram.updateUnVec("uBrickColor", this.brickColor);
        this.shaderProgram.updateUnVec("uMortarColor", this.mortarColor);
        this.shaderProgram.updateUnVec("uBtickSize", this.btickSize, "2fv");
        this.shaderProgram.updateUnVec("uBrickPct", this.brickPct, "2fv");
        
        this.gl.bindBuffer(this.buffers.index.TYPE, this.buffers.index.buffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.buffers.index.numItems, this.gl.UNSIGNED_SHORT, 0);
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

GL.tick = function(){
    requestAnimationFrame(GL.bind(GL.tick,this));
    GL.rotate.apply(this);
    this.renderScene();
};

GL.rotate = function(){
    var dg = 12;
    var oldT = (new Date()).valueOf();
    var grad = 0;
    
    GL.rotate = function(){
        var currentT = (new Date()).valueOf();
        var delteT = (currentT - oldT)/1000;
        var deltsG = dg * delteT;
        
        mat4.rotate(this.mvMatrix, this.mvMatrix, GL.degToRad(deltsG), [0, 1, 0]);
        oldT = currentT;
    };
    
    GL.rotate.apply(this);
};

GL.texpureLoader = function texpureLoader(data,collbak){
    var index = 0;
    var app = data.app, shaderProgram = app.shaderProgram;
    
    data.list.forEach(function(item){
        index++;
        var texture = new GL.Textute(app.gl, item.url);
        app.textures[item.name] = texture;
        texture.onload = function(){
            index--;
            shaderProgram.attachSampler(texture.texture,item.name);
            
            if ( index === 0 && typeof collbak === "function" ) {
                collbak();
            }
        };
        
    });
};

GL.Textute = function Textute(gl,url){
    this.texture = gl.createTexture();
    this.onload = null;
    
    var image = new Image();
    image.onload = GL.bind(function(){
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        if (typeof this.onload === "function"){
            setTimeout(GL.bind(this.onload,this),1,this);
        }
    }, this);
    image.src = url;
};

GL.ShaderProgram = function ShaderProgram(conf){
    this.VERTEX = 0;
    this.FRAGMENT = 1;
    var samplersNum = 0;
    
    var urls = {};
    urls[this.VERTEX] = conf.vertex || null;
    urls[this.FRAGMENT] = conf.fragment || null;
    
    var gl = conf.gl || null;
    var shaderProgram = null;
    this.shaders = {};
    this.onInit = null;
    
    this.matrix = {};
    this.samplers = {};
    
    this.initUniMatrix = function(variable){
        this.matrix[variable] = gl.getUniformLocation(shaderProgram, variable);
    };
    
    this.updateUnMatrix = function(variable, data, suffix){
        suffix = suffix || "4fv";
        gl["uniformMatrix"+suffix](this.matrix[variable],false,data);
    };
    
    this.updateUnVec = function(variable, data, suffix){
        suffix = suffix || "3fv";
        gl["uniform"+suffix](this.matrix[variable], data);
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
    
    this.attachSampler = function(texture,name){
        this.samplers[name] = gl.getUniformLocation(shaderProgram,name);
        gl.activeTexture(gl['TEXTURE'+samplersNum]);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.samplers[name], samplersNum);
        samplersNum++;
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

GL.degToRad = function(degrees) {
    return degrees * Math.PI / 180;
};

GL.initListiner = function(){
    var dX = 0.2, dY = 0.2, dZ = 0.2;
    var carent = {
        dx : 0,
        dy : 0,
        dz : -6
    };

    window.addEventListener("keydown", GL.bind(function(e){
        var is_apply = false;
        switch (e.keyCode) {
            case 38: // up
                carent.dy += dY;
                is_apply = true;
                break;
            case 40: // down
                carent.dy -= dY;
                is_apply = true;
                break;
            case 37: // left
                carent.dx -= dX;
                is_apply = true;
                break;
            case 39: // right
                carent.dx += dX;
                is_apply = true;
                break;
        }
        
        if (is_apply) apply.apply(this);
    },this), false);
    
    window.addEventListener("mousewheel", GL.bind(function(e){
        var is_apply = false;
        if (e.deltaY > 0){
            carent.dz += dZ;
            is_apply = true;
        }else if (e.deltaY < 0) {
            carent.dz -= dZ;
            is_apply = true;
        }
        
        if (is_apply) apply.apply(this);
    },this), false);
    
    function apply(){
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix,this.mvMatrix,[carent.dx, carent.dy, carent.dz]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, GL.degToRad(30), [1, 0, 0]);
    };
    
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
        this.numItems = data.list.length / data.itemSize;
    };
};

GL.ArrayBuffer.prototype = GL.ElementBuffer.prototype = new GL.Buffer();

window.onload = function(){
    var c = document.getElementById('gl');
    app = new GL(c);
    gl = app.gl;
    //gl.renderScene();
};