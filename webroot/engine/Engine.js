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
        function(mapdata) {

            vsp = {
                image: tileset_node,
                tile: {w:16, h:16}
            };

            $$.map = new Map(mapdata, vsp);
            $$.renderstack[0].addLayer('map', true);
            $$.renderstack[0].setActiveLayer(0);
            $$.renderstack[0].add($$.map);

            fps = new Text(
                10, 10,
                "Hello.", {
                    beforeRender : function(obj) {
                        obj.text = 'FPS: ' + $$._fps;
                    }
                }
            );
            $$.renderstack[0].add(fps);

            $$.onComplete();
        }
    );
}

Engine.prototype = {
    onComplete : function() {
        this.setRenderInterval(30);
        this.render();
    },

    tick: function() {
        debugger;
    },

/*
    clear_screen: function() {
        $$.context.fillStyle = "#0FF";  
        $$.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
*/

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
    
    killIntervals : function() {
        for( var i = 0; i<this._intervals.length; i++ ) {
            window.clearInterval(this._intervals[i]);
        }

        this._intervals = [];
    },

    render : function() {
try {
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

        //$$.log( 'render finished at ' + $$._timeEnd + '.  FPS: ' + $$._fps );

        $$._prevStart = $$._timeStart;
} catch(e) {
    $$.killIntervals();
    throw e;
}
    }
}

