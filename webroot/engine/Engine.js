var $$ = null;


/// the basic drawing functions will suck until I apply these principles >:(
/// http://code.anjanesh.net/2009/05/1-pixel-wide-line-parallel-to-axis-in.html
function draw_pixel( x1, y1, color ) {
    draw_line(x1,y1,x1+1,y1+1, color);
}

function draw_line( x1, y1, x2, y2, color, thickness ) {

    if( !thickness ) {
        thickness = 2;
    }

    $$.context.strokeStyle = color;
    $$.context.lineWidth   = thickness * $$.scale;

    $$.context.beginPath();
    $$.context.moveTo(x1, y1);
    $$.context.lineTo(x2, y2);
    $$.context.stroke();
}

function draw_rect( x1, y1, x2, y2, color, thickness ) {

    if( !thickness ) {
        thickness = 2;
    }

    $$.context.strokeStyle = color;
    $$.context.lineWidth   = thickness * $$.scale;

    $$.context.beginPath();
    $$.context.moveTo(x1, y1);
    $$.context.lineTo(x1, y2);
    $$.context.lineTo(x2, y2);
    $$.context.lineTo(x2, y1);
    $$.context.lineTo(x1, y1);
    $$.context.stroke();
}

function fill_rect( x1, y1, x2, y2, color ) {
    $$.context.fillStyle = color;

    $$.context.fillRect(
        x1, y1,
        (x2-x1*$$.scale), (y2-y1*$$.scale)
    );
}

function draw_menu_box(obj) {
    $$.context.globalCompositeOperation = 'source-over';

    var color_0 = '#000000';
    var color_1 = '#555555';
    var color_2 = '#999999';
    
    var x1 = obj.x;
    var y1 = obj.y;
    
    var x2 = x1 + obj.w;
    var y2 = y1 + obj.h;

    draw_line(x1, y1 + 2, x1, y2 - 3, color_0); // TL -> BL
    draw_line(x1 + 2, y1, x2 - 3, y1, color_0); // TL -> TR

    draw_line(x2 - 1, y2 - 3, x2 - 1, y1 + 2, color_0); // BR -> TR
    draw_line(x2 - 3, y2 - 1, x1 + 2, y2 - 1, color_0); // BR -> BL

    draw_rect(x1 + 1, y1 + 1, x2 - 2, y2 - 2, color_1);
    draw_rect(x1 + 2, y1 + 2, x2 - 3, y2 - 3, color_2);

    fill_rect(x1 + 3, y1 + 3, x2 - 4 , y2 - 4, obj.color);

     draw_pixel(x1 + 1, y1 + 1, color_0); // TL
     draw_pixel(x2 - 2, y1 + 1, color_0); // TR
     draw_pixel(x1 + 1, y2 - 2, color_0); // BL
     draw_pixel(x2 - 2, y2 - 2, color_0); // BR

     draw_pixel(x1 + 2, y1 + 2, color_1 ); // TL
     draw_pixel(x2 - 3, y1 + 2, color_1 ); // TR
     draw_pixel(x1 + 2, y2 - 3, color_1 ); // BL
     draw_pixel(x2 - 3, y2 - 3, color_1 ); // BR

     draw_pixel(x1 + 3, y1 + 3, color_2); // TL
     draw_pixel(x2 - 4, y1 + 3, color_2); // TR
     draw_pixel(x1 + 3, y2 - 4, color_2); // BL
     draw_pixel(x2 - 4, y2 - 4, color_2); // BR
}

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

/// an entity has coordinates, dimensions, and a bounding box.
/// return true if you can make that move.
/// return false if you'd go bump in the night.
function i_want_to_go_to_there( entity, dx, dy ) {
    if( typeof entity.hotspot == 'undefined' ) {
        throw "entities without a .hotspot member cannot collide.";
    }

    var x1 = entity.x + entity.hotspot.x + dx;
    var y1 = entity.y + entity.hotspot.y + dy;

    var x2 = x1 + entity.hotspot.w;
    var y2 = y1 + entity.hotspot.h;


/// currently only map-based obs and full-tile.  cheap and insufficient.  replace later.
    var tx = parseInt(x1/16);
    var ty = parseInt(y1/16);

    if( $$.map.isObstructed(tx, ty) ) {
        return false;
    }

    tx = parseInt(x2/16);
    ty = parseInt(y2/16);

    if( $$.map.isObstructed(tx, ty) ) {
        return false;
    }

    return true;
}

function Engine( canvas_node, width, height, scale, tileset_node, map_location, soundManager ) {
    
    this._debug_showthings = true;

    this.canvas = canvas_node;
    this.context = this.canvas.getContext('2d');

    this.soundManager = soundManager;

    this.screen = {
        width : width,
        height : height
    };

    this.scale = scale;

    this.camera = {x:1015, y:1015};

    //set the proportions
    this.canvas.style.width = this.screen.width * this.scale;
    this.canvas.style.height = this.screen.height * this.scale;
    this.canvas.width = this.screen.width * this.scale;
    this.canvas.height = this.screen.height * this.scale;
 
    this.targetFPS = 60;
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
                        if($$._debug_showthings) {
                            obj.text = '[debug mode, obs showing]';
                        } else {
                            obj.text = '';
                        }   
                    }
                }
            );
            $$.renderstack[0].add(txt);

            var data = get_sync_json('./game/001_v3/darin.json.chr');
            var node = document.getElementById('hero');

            var sprite = new MapAnimation(970, 970, node, data);
//var sprite = new MapImage(850, 850, 17, 33, node);
            $$.renderstack[0].add(sprite);
            $$.hero = sprite;
            $$.hero.setState('down_walk');


            var menu = new RenderThing(
                0, 10,
                50, 50,
                function() {
                    draw_menu_box(this);
                    $$.context.fillStyle    = 'white';
                    $$.context.font         = '10px Arial';
                    $$.context.textBaseline = 'top';
                    $$.context.fillText( 'MENU', this.x+5, this.y+5);
                    $$.context.fillText( 'ITEM', this.x+5, this.y+15);
                    $$.context.fillText( 'LOL', this.x+5, this.y+25);
                    $$.context.fillText( 'BUTTS', this.x+5, this.y+35);
                }
            );
            menu.color = '#000099';
            menu.move({
                x : 260,
                y : 10,
                time : 50
            });
$$.menubox = menu;

            $$.renderstack[0].add(menu);
         
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
        $$.hero.last_tx = parseInt(($$.hero.x + $$.hero.hotspot.x)/ 16);
        $$.hero.last_ty = parseInt(($$.hero.y + $$.hero.hotspot.y)/ 16);
        delete d;
    }

    var moverate = parseInt((time - $$._last_hero_move) * .15);

    if( k.held[k.M] && $$.soundManager ) {
        $$.soundManager.stopAll();
    }

    if( k.held[k.O] ) {
        k.held[k.O] = false;
        $$._debug_showthings = !$$._debug_showthings;
    }

    if( k.held[k.M] ) {
        k.held[k.M] = false;
        $$._menu_direction = !$$._menu_direction;

        $$.menubox.move({
            x : ($$._menu_direction? -50 : 260) ,
            y : 10,
            time : 200
        });
    }

    if( !$$.hero ) {
        return;
    }

    var moved = false;

    var dx = 0;
    var dy = 0;

    if( k.held[k.W] ) {
        dy -= moverate;
    } else if( k.held[k.S] ) {
        dy += moverate;
    }

    if( k.held[k.A] ) {
        dx -= moverate;
    } else if( k.held[k.D] ) {
        dx += moverate;
    }

    if( (dx ||dy) && i_want_to_go_to_there( $$.hero, dx, dy ) ) {
        if( dx < 0 ) {
            $$.hero.facing = 'left';
        } else if( dx > 0 ) {
            $$.hero.facing = 'right';
        } else if( dy < 0 ) {
            $$.hero.facing = 'up';
        } else if( dy > 0 ) {
            $$.hero.facing = 'down';
        }
         
        $$.hero.x += dx;
        $$.hero.y += dy;
         
        moved = true;
    }

    ///cheapass bounds.
    if( moved ) {
        $$.hero.setState( $$.hero.facing+'_walk' );

        $$.hero.last_tx = parseInt(($$.hero.x + $$.hero.hotspot.x)/ 16);
        $$.hero.last_ty = parseInt(($$.hero.y + $$.hero.hotspot.y)/ 16);

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