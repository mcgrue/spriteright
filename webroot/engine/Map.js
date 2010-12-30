
function Map(map, vsp) {
    this.map = map;
    this.vsp = vsp;
}

Map.prototype = {
    draw_tile: function( tx, ty, t ) {
            
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        $$.context.drawImage(
            this.vsp.image,  0, t*this.vsp.tile.h, this.vsp.tile.w, this.vsp.tile.h,
            
            (tx*this.vsp.tile.w - $$.camera.x)*$$.scale,
            (ty*this.vsp.tile.h - $$.camera.y)*$$.scale,

            this.vsp.tile.w*$$.scale, this.vsp.tile.h*$$.scale
        );
    },

    render: function() {
        var i = 0;
        var x_orig = Math.floor($$.camera.x / this.vsp.tile.w);
        var y_orig = Math.floor($$.camera.y / this.vsp.tile.h);
        var x_width = Math.ceil($$.screen.width / this.vsp.tile.w);
        var y_width = Math.ceil($$.screen.height / this.vsp.tile.h);
        if( $$.camera.x % this.vsp.tile.w ) {
            x_width += 2;
        }
        if( $$.camera.y % this.vsp.tile.h ) {
            y_width += 2;
        }
        
        var t = 0;
        
        for( var l = 0; l < this.map.layer_data.length; l++ ) { // very bad, doesn't respect weird render orders.
            for( var y=y_orig; y<y_orig+y_width; y++ ) {
                var base = false;
                for( var x=x_orig; x<x_orig+x_width; x++ ) {
                    if( base === false ) {
                        var base = flat_from_xy( x, y, this.map.dimensions.y );
                        var i = 0;
                    }
    
                    t = base + i;
                    this.draw_tile( x,y, this.map.layer_data[l][t] );
                    i++;
                }
            }
        }
    },
}

