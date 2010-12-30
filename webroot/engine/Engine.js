var $$ = null;

function x_from_flat( flatval, yMax ) {
	return flatval%yMax;
}

function y_from_flat( flatval, yMax ) {
	flatval = flatval - x_from_flat( flatval,yMax );
	return flatval/yMax;
}

function flat_from_xy( x, y, yMax ) {
    return y*yMax + x;
}

function Engine( canvas_node, width, height, scale, tileset_node, map_location ) {
    this.canvas = canvas_node;
    this.context = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.scale = scale;

    this.camera = {x:805, y:805};

    //set the proportions
    this.canvas.style.width = this.width * this.scale;
    this.canvas.style.height = this.height * this.scale;
    
    this.canvas.width = this.width * this.scale;
    this.canvas.height = this.height * this.scale;
 
    this.vsp = {};
    this.vsp.image = tileset_node;
    this.vsp.tile = {w:16, h:16};

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
            
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        this.context.drawImage(
            $$.vsp.image,  0, t*$$.vsp.tile.h, $$.vsp.tile.w, $$.vsp.tile.h,
            
            (tx*$$.vsp.tile.w - $$.camera.x)*$$.scale,
            (ty*$$.vsp.tile.h - $$.camera.y)*$$.scale,

            $$.vsp.tile.w*$$.scale, $$.vsp.tile.h*$$.scale
        );
    },
    
    clear_screen: function() {
        $$.context.fillStyle = "#0FF";  
        $$.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    draw_screen: function() {
        var i = 0;
        var x_orig = Math.floor($$.camera.x / $$.vsp.tile.w);
        var y_orig = Math.floor($$.camera.y / $$.vsp.tile.h);
        var x_width = Math.ceil($$.width / $$.vsp.tile.w);
        var y_width = Math.ceil($$.height / $$.vsp.tile.h);
        if( $$.camera.x % $$.vsp.tile.w ) {
            x_width += 2;
        }
        if( $$.camera.y % $$.vsp.tile.h ) {
            y_width += 2;
        }
        
        var t = 0;

        var d = new Date();
        var before = d.getTime();
        
        for( var l = 0; l < $$.map.layer_data.length; l++ ) { // very bad, doesn't respect weird render orders.
            for( var y=y_orig; y<y_orig+y_width; y++ ) {
                var base = false;
                for( var x=x_orig; x<x_orig+x_width; x++ ) {
                    if( base === false ) {
                        var base = flat_from_xy( x, y, $$.map.dimensions.y );
                        var i = 0;
                    }
    
                    t = base + i;
                    this.draw_tile( x,y, $$.map.layer_data[l][t] );
                    i++;
                }
            }
        }

        var d = new Date();
        var after = d.getTime();

        $$.log( 'fps: ' + Math.floor(1000/(after-before)) );
    },

    log: function(msg) {
        old = $('#log').val();
        $('#log').val( msg + "\n" + old );
    }
}

