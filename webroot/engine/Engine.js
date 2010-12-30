var $$ = null;

function Engine( canvas_node, width, height, scale, tileset_node, map_location ) {
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

    $.getJSON(
        map_location,
        function(data) {
            $$.map = data;
            $$.draw_screen();
        }
    );

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
        var x_orig = 0;
        var y_orig = 0;
        var x_width = 20;
        var y_width = 15;

        for( var x=x_orig; x<x_orig+x_width; x++ ) {
            for( var y=y_orig; y<y_orig+y_width; y++ ) {
                this.draw_tile( x,y, $$.map.layer_data[0][i++] );
            }
        }
    }
}

