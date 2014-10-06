function GL(canvas) {
    this.gl;
    function __init(canvas){
        try{
            this.gl = canvas.getContext('webgl');
            console.log("WebGl been initialized.");
        }catch (e){
            console.error('Your brawser con\'t WebGL.');
        }
    }
    
    this.renderScene = function(){
        this.gl.clearColor(0.0, 0.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    };
    
    __init.call(this,canvas);
}

window.onload = function(){
    var c = document.getElementById('gl');
    gl = new GL(c);
    
    gl.renderScene();
};