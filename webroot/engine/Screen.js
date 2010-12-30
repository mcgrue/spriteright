function Screen() {

}

Screen.prototype = {
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

