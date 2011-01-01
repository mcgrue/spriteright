var $$ = null;

function get_time() {
    var d = new Date();
    var t = d.getTime();
    delete d;
    return t;
}

function get_sprite_coordinates( frame, dim, sheet ) {

    if(!sheet.padding) {
        sheet.padding = 0;
    }

    if( !sheet.top_padding ) {
        sheet.top_padding = 0;    
    }

    if( !sheet.left_padding ) {
        sheet.left_padding = 0;    
    }

    var x = x_from_flat( frame, sheet.cols ) * (dim.w + sheet.padding) + sheet.left_padding;;
    var y = y_from_flat( frame, sheet.cols ) * (dim.h + sheet.padding) + sheet.top_padding;

    return {x:x,y:y};
}

function get_sync_json(url) {
    var hax = false;
    $.ajax({
      url: './game/001_v3/darin.json.chr',
      async : false,
      success: function(data) {
        eval( 'hax = ' + data );
      }
    });
    return hax;
}

function overlap( x1, y1, w1, h1, x2, y2, w2, h2 ) {
	return (x1 + w1 > x2 && y1 + h1 > y2 && x1 < x2 + w2 && y1 < y2 + w2);
}

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

function Engine( canvas_node, width, height, scale, tileset_node, map_location, soundManager ) {
    

//    var d = new Date();
//    this.tickTime = d.getTime();
//    delete d;

    this.canvas = canvas_node;
    this.context = this.canvas.getContext('2d');

    this.soundManager = soundManager;

    this.screen = {
        width : width,
        height : height
    };

    this.scale = scale;

    this.camera = {x:805, y:805};

    //set the proportions
    this.canvas.style.width = this.screen.width * this.scale;
    this.canvas.style.height = this.screen.height * this.scale;
    this.canvas.width = this.screen.width * this.scale;
    this.canvas.height = this.screen.height * this.scale;
 
    this.targetFPS = 30;
    this.rendering = false;
    
    this.tickTime = false;
    this._prevStart = false;
    this._timeEnd = false;

    this._intervals = [];

    this.renderstack = [];
    this.renderstack.push(
        new McGrender('main')
    );

    this.keys = new Keys();

this.hero = false;

    $$ = this;

    $$.tickTime = get_time(); //starting time.

/// This is sorta game-specific code
/// needs to be pulled out of the engine.
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

            txt = new Text(
                10, 10,
                "Hello.", {
                    beforeRender : function(obj) {
                        obj.text = 'FPS: ' + $$._fps;
                    }
                }
            );
            $$.renderstack[0].add(txt);

            txt = new Text(
                10, 26,
                "Hello.", {
                    beforeRender : function(obj) {
                        obj.text = 'Coords: ('+$$.camera.x+','+$$.camera.y+')';
                    }
                }
            );
            $$.renderstack[0].add(txt);

            txt = new Text(
                10, 42,
                "Hello.", {
                    beforeRender : function(obj) {
                        obj.text = 'Sys time: ('+$$.tickTime+')';
                    }
                }
            );
            $$.renderstack[0].add(txt);

            var data = get_sync_json('./game/001_v3/darin.json.chr');
            var node = document.getElementById('hero');

            var sprite = new MapAnimation(850, 850, node, data);
//var sprite = new MapImage(850, 850, 17, 33, node);
            $$.renderstack[0].add(sprite);
            $$.hero = sprite;
            $$.hero.setState('down_walk');
         
            $$.onComplete();
        }
    );
}

Engine.prototype = {
    onComplete : function() {
        this.setRenderInterval(this.targetFPS);

        this.render();
    },

    isOnScreen: function( x, y, w, h ) {
        return overlap( x, y, w, h, $$.camera.x, $$.camera.y, $$.screen.width, $$.screen.height );
    },

    tick: function() {
        debugger;
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
    
    killIntervals : function() {
        for( var i = 0; i<this._intervals.length; i++ ) {
            window.clearInterval(this._intervals[i]);
        }

        this._intervals = [];
    },

/// temporary
/// what should be done with this?
/// this is kinda game-specific code, yeah?
updateControls : function() {

    var k = $$.keys;

    var d = new Date();
    var time = d.getTime();
    delete d;

    if( !$$._last_hero_move ) {
        var d = new Date();
        $$._last_hero_move = time;
        $$.hero.facing = 'down';
        delete d;
    }

    var moverate = parseInt((time - $$._last_hero_move) * .15);

    if( k.held[k.M] && $$.soundManager ) {
        $$.soundManager.stopAll();
    }

    if( !$$.hero ) {
        return;
    }

    var moved = false;

    if( k.held[k.W] ) {
        $$.hero.y -= moverate;
        $$.hero.facing = 'up';
        moved = true;
    } else if( k.held[k.S] ) {
        $$.hero.y += moverate;
        $$.hero.facing = 'down';
        moved = true;
    }

    if( k.held[k.A] ) {
        $$.hero.x -= moverate;
        $$.hero.facing = 'left';
        moved = true;
    } else if( k.held[k.D] ) {
        $$.hero.x += moverate;
        $$.hero.facing = 'right';
        moved = true;
    }

    if( moved ) {
        $$.hero.setState( $$.hero.facing+'_walk' );
    } else {
        $$.hero.setState( $$.hero.facing+'_idle' );
    }

    var d = new Date();
    $$._last_hero_move = d.getTime();
    delete d;
},

/// abstract this from hero-following.
/// it should be able to follow anything with a (x,y,w,h)
doCameraFollow : function() {
    if( !$$.hero ) {
        return;
    }

    $$.camera.x = parseInt((($$.camera.x - $$.screen.width/2) + ($$.hero.x + $$.hero.w/2))/2);
    $$.camera.y = parseInt((($$.camera.y - $$.screen.height/2) + ($$.hero.y + $$.hero.h/2))/2);
},

    render : function() {
        try {
            if( $$.rendering ) {
                return;
            }
             
$$.updateControls();
$$.doCameraFollow();
             
            $$.rendering = true;
            var d = new Date();
            $$.tickTime = d.getTime();
            
            for( var i = 0; i<$$.renderstack.length; i++ ) {
                $$.renderstack[i].render();
            }
            delete d;
            var d = new Date();
            $$._timeEnd = d.getTime();
            $$.rendering = false;
            $$._fps = Math.floor(1000/($$.tickTime-$$._prevStart));
        
            $$._prevStart = $$.tickTime;
            delete d;
        } catch(e) {
            $$.killIntervals();
            throw e;
        }
    }
}