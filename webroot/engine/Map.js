
function Map(map, vsp) {
    this.map = map;
    this.vsp = vsp;
    this.vsp.image = $$.assets.get(this.vsp.name);

    try {
        this.obs = $$.assets.get( this.vsp.name + '.obs' );
    } catch(e) {
        this.obs = $$.assets.get( 'standard_obs.png' );
    }

    this.obsImgData = getImageData(this.obs);

debugger;

    this.height = this.vsp.tile.h * (this.map.dimensions.y - 1);
    this.width = this.vsp.tile.w * (this.map.dimensions.x - 1);

    if( this.vsp.tile.h == 16 && this.vsp.tile.w == 16 ) {
        this.obstructPixel = this.obstructPixel16;
    } else {
        this.obstructPixel = this.obstructPixelGeneric;
    }
}

Map.prototype = {

    SPRITE_FACING_NORTH : 1,
    SPRITE_FACING_SOUTH : 2,
    SPRITE_FACING_EAST : 3,
    SPRITE_FACING_WEST : 4,
    
    draw_rect: function( tx, ty, color ) {
        $$.context.fillStyle = color;

        var x = (tx*this.vsp.tile.w - $$.camera.x)*$$.scale;
        var y = (ty*this.vsp.tile.h - $$.camera.y)*$$.scale;

        $$.context.fillRect(
            x, y,
            (this.vsp.tile.w*$$.scale), (this.vsp.tile.h*$$.scale)
        );
    },

    draw_obs: function( tx, ty, t ) {
            
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        $$.context.drawImage(
            this.obs,  0, t*this.vsp.tile.h, this.vsp.tile.w, this.vsp.tile.h,
            
            (tx*this.vsp.tile.w - $$.camera.x)*$$.scale,
            (ty*this.vsp.tile.h - $$.camera.y)*$$.scale,

            this.vsp.tile.w*$$.scale, this.vsp.tile.h*$$.scale
        );
    },

    draw_tile: function( tx, ty, t ) {

        var col = x_from_flat( t, 16 );
        var row = y_from_flat( t, 16 );

        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        $$.context.drawImage(
            this.vsp.image,
            col*this.vsp.tile.h, row*this.vsp.tile.w, this.vsp.tile.w, this.vsp.tile.h,
            
            (tx*this.vsp.tile.w - $$.camera.x)*$$.scale,
            (ty*this.vsp.tile.h - $$.camera.y)*$$.scale,

            this.vsp.tile.w*$$.scale, this.vsp.tile.h*$$.scale
        );
    },

    render: function( arLayers ) {

        if( !arLayers || !arLayers.length ) {
            throw "Cannot render a map without layer rendering data.";
        }

        var i = 0;
        var x_orig = Math.floor($$.camera.x / this.vsp.tile.w);
        var y_orig = Math.floor($$.camera.y / this.vsp.tile.h);
        var x_width = Math.ceil($$.screen.width / this.vsp.tile.w);
        var y_width = Math.ceil($$.screen.height / this.vsp.tile.h);

        var x_max = x_orig + x_width + 1;
        var y_max = y_orig + y_width + 1;

        if(x_orig < 0) { x_orig = 0; }
        if(y_orig < 0) { y_orig = 0; }
        if( x_max >= this.map.dimensions.x ) x_max = this.map.dimensions.x -1;
        if( y_max >= this.map.dimensions.y ) y_max = this.map.dimensions.y -1;

        if( $$.camera.x % this.vsp.tile.w ) {
            x_width += 2;
        }
        if( $$.camera.y % this.vsp.tile.h ) {
            y_width += 2;
        }

        var t = 0;    

        for( var l = 0; l < arLayers.length; l++ ) { 
            for( var y=y_orig; y<y_max; y++ ) {
                var base = false;
                for( var x=x_orig; x<x_max; x++ ) {
                    if( base === false ) {
                        var base = flat_from_xy( x, y, this.map.dimensions.x );
                        var i = 0;
                    }
    
                    t = base + i;
                    this.draw_tile( x,y, this.map.layer_data[arLayers[l]][t] );
                    i++;
                }
            }
        }

        if( $$._debug_showthings ) {

            for( var y=y_orig; y<y_orig+y_width; y++ ) {
                
                var base = false;
                
                for( var x=x_orig; x<x_orig+x_width; x++ ) {
                    if( base === false ) {
                        var base = flat_from_xy( x, y, this.map.dimensions.x );
                        var i = 0;
                    }
    
                    t = base + i;


                    if( this.getZone(x,y) ) {
                        this.draw_rect( x,y, '#00FF00' );
                    }

                    this.draw_obs( x,y, this.getObstructionTile(x,y) );

                    i++;   
                }
            }

            $$.context.globalCompositeOperation = 'source-over';
        }
    },

    getObstructionTile: function(tx,ty) {
        return this.map.obs_data[flat_from_xy(tx, ty, this.map.dimensions.x)];
    },

    getZone: function(tx,ty) {
        return this.map.zone_data[flat_from_xy(tx, ty, this.map.dimensions.x)];
    },

    getTileCoordinates: function(x,y) {
        return { tx: parseInt(x/this.vsp.tile.w), ty: parseInt(y/this.vsp.tile.h) };
    },

    getFacedTile: function(ent) {
        if( !ent.facing ) {
            throw "Entity had no facing, ergo couldn't face a tile.";
        }

        var t = this.getTileCoordinates(ent.x+ent.hotspot.x, ent.y+ent.hotspot.y);

        switch($$.hero.facing) {
            case $$.map.SPRITE_FACING_SOUTH:
                t.ty++; break;
            case $$.map.SPRITE_FACING_NORTH:
                t.ty--; break;
            case $$.map.SPRITE_FACING_EAST:
                t.tx++; break;
            case $$.map.SPRITE_FACING_WEST:
                t.tx--; break;
            default:
                throw "Unknown facing value: ("+$$.hero.facing+")";
        }

        return t;
    },

    enterZone : function(ent, tx, ty) {
        var z = this.getZone(tx, ty);

        if( this.map.zones[z] && !this.map.zones[z].method ) {
            $$.map_scripts[this.map.name][this.map.zones[z].event]();
        }
    },

    leaveZone : function(ent, tx, ty) {
        //var z = this.getZone(tx, ty);
    },

    activateAdjancentZone: function(ent) {
        var faceTile = this.getFacedTile(ent);
        var faceZone = this.getZone(faceTile.tx, faceTile.ty);

        if( faceZone ) {
            $$.log('Activating zone ' + faceZone );

            if( this.map.zones[faceZone] && this.map.zones[faceZone].method ) {
                $$.map_scripts[this.map.name][this.map.zones[faceZone].event]();
            } else {
                $$.log('That event wasnt actually adjacent-activation.');
            }
            
        } else {
            $$.log("Nothing there.");
        }
    },

    obstructPixelGeneric : function( px, py ) {
        if( x<0 || y<0 || x >= this.width || y >= this.height ) {
            return true;
        }

        var tc = this.getTileCoordinates(px, py);

        var t = this.getObstructionTile(tc.tx,tc.ty);

        if( !t ) return false;

    },

    obstructPixel16 : function( px, py ) {

        if( x<0 || y<0 || x >= this.width || y >= this.height ) {
            return true;
        }

        var t = this.map.obs_data[((y>>4)*this.map.dimensions.x)+(x>>4)];

        if( !t ) return false;

/*
	int obstructpixel(int x, int y)
	{
		if (x<0 || y<0 || (x>>4)>=mapwidth || (y>>4)>=mapheight) return 1;
		int t=obslayer[((y>>4)*mapwidth)+(x>>4)];
		return tileset->GetObs(t, x&15, y&15);
	}
*/
    

        // currently unimplemented
        return false;
    },

    getObsPixel : function( obsIdx, x, y ) {

    },

    obstructEntity : function( px, py ) {
        // currently unimplemented
        return false;
    }
}