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

    this.targetFPS = 60;
    this.rendering = false;
    this._prevStart = false;
    this._timeStart = false;
    this._timeEnd = false;

    this._intervals = [];

    this.renderstack = [];
    this.renderstack.push(
        new McGrender('main')
    );

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

        this.setRenderInterval(30);
        this.render();
    },

    log: function(msg) {
        old = $('#log').val();

        if( old.length > 10000 ) {
            old = '';
        }

        $('#log').val( msg + "\n" + old );
    },
    
    setRenderInterval : function(targetFps) {
        this.targetFPS = targetFps;
        this.intervalMS = parseInt(1000/this.targetFPS);
        
        var i = window.setInterval($$.render, this.intervalMS);
        this._intervals.push(i);
    },
    
    kill_intervals : function() {
        for( var i = 0; i<this._intervals.length; i++ ) {
            window.clearInterval(this._intervals[i]);
        }

        this._intervals = [];

        alert('kill?');
    },

    render : function() {
        if( this.rendering ) {
            return;
        }

        $$.rendering = true;
        var d = new Date();
        $$._timeStart = d.getTime();
        
        for( var i = 0; i<$$.renderstack.length; i++ ) {
            $$.renderstack[i].render();
        }

        var d = new Date();
        $$._timeEnd = d.getTime();
        $$.rendering = false;
        $$._fps = Math.floor(1000/($$._timeStart-$$._prevStart));

        $$.log( 'render finished at ' + $$._timeEnd + '.  FPS: ' + $$._fps );

        $$._prevStart = $$._timeStart;
    }
}

