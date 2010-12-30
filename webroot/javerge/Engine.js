var $$ = null;

function Engine( canvas_node, width, height, scale ) {
    this.canvas = canvas_node;
    this.context = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.scale = scale;

    this.camera = {x:0, y:0};

debugger;
    
    //set the proportions
    this.canvas.style.width = this.width * this.scale;
    this.canvas.style.height = this.height * this.scale;
    
//    this.canvas.width = this.width * this.scale;
//    this.canvas.height = this.height * this.scale;

    $$ = this;
}

Engine.prototype = {
    tick: function() {
        debugger;
    }
}