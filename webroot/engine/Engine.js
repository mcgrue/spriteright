var $$ = null;

function Engine( canvas_node, width, height, scale, tileset_node ) {
    this.canvas = canvas_node;
    this.context = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.scale = scale;

    this.camera = {x:0, y:0};

    //set the proportions
    this.canvas.style.width = this.width * this.scale;
    this.canvas.style.height = this.height * this.scale;
    
    this.canvas.width = this.width * this.scale;
    this.canvas.height = this.height * this.scale;

    this.tileset = tileset_node;

    $$ = this;
}

Engine.prototype = {
    tick: function() {
        debugger;
    },

    draw_tile: function( tx, ty, t ) {
        tile_x_size = 16;
        tile_y_size = 16;
    
        viewport_offset_x = 0;
        viewport_offset_y = 0;
        
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        this.context.drawImage(
            this.tileset,  0, t*tile_y_size, tile_x_size, tile_y_size,
            this.camera.x+tx*(tile_x_size*this.scale),
            this.camera.y+ty*(tile_y_size*this.scale),
            tile_x_size*this.scale, tile_y_size*this.scale);
    },

    draw_screen: function() {
        var i = 0;
        for( var x=0; x<20; x++ ) {
            for( var y=0; y<15; y++ ) {
                this.draw_tile( x,y, i++ );
            }
        }
    }
}

