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
    var tx1 = parseInt(x1/16);
    var ty1 = parseInt(y1/16);
    tx2 = parseInt(x2/16);
    ty2 = parseInt(y2/16);

    if(
        $$.map.isObstructed(tx1, ty1) ||
        $$.map.isObstructed(tx1, ty2) ||
        $$.map.isObstructed(tx2, ty1) ||
        $$.map.isObstructed(tx2, ty2)    
    ) {
        return false;
    }

    return true;
}

/////////////////////////////////////////////////////////////////////////////////////
///////////// END global functions that desperately need a home /////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// TODO: finishInit() should not take care of loading game assets.
/// That should be passed into loadGameAssetsFunc().
/// There should also be a startGameFunc passed in here too, but right now it's all muddled.

function Engine( canvas_node, width, height, scale, loadGameAssetsFunc, startGameFunc ) {
    $$ = this;    

    this.screen = {
        width : width,
        height : height
    };

    this.scale = scale;

    this.camera = {x:1015, y:1015};

    this.targetFPS = 60;

    this.canvas = canvas_node;
    this.context = this.canvas.getContext('2d');

    this.visualLoader = new PrettyLoader();

    this.assets = new Assets(
        loadGameAssetsFunc,
        function() { $$.finishInit(); }
    );
    this.assets.init();
    
    this.startGameFunc = startGameFunc;
    
    this.map_scripts = {};

    this._debug_showthings = true;

    //set the proportions
    this.canvas.style.width = this.screen.width * this.scale;
    this.canvas.style.height = this.screen.height * this.scale;
    this.canvas.width = this.screen.width * this.scale;
    this.canvas.height = this.screen.height * this.scale;
 
    
    this.rendering = false;
    
    this.tickTime = false;
    this._prevStart = false;
    this._timeEnd = false;

    this._intervals = [];

    this.renderstack = [];
}

Engine.prototype = {

    _soundmanagerInit : function() {
        soundManager.url = 'engine/soundmanager/swf/';
        soundManager.flashVersion = 9; // optional: shiny features (default = 8)
        soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
        soundManager.debugMode = false;
        // enable HTML5 audio support, if you're feeling adventurous. iPad/iPhone will always get this.
        // soundManager.useHTML5Audio = true;
        soundManager.onready(function() {
        
          if( window.location.href == 'http://localhost/js-verge/' ) return; //I don't want to hear it every time I debug...
          
          if (soundManager.supported()) {
                soundManager.createSound({
                  id: 'mySound',
                  url: 'game/mp3/Hymn_to_Aurora_(NES_Cover)_www.dwedit.org.mp3',
                  autoLoad: true,
                  autoPlay: true,
                  onload: function() {
                    if($$){
                        $$.log('The sound '+this.sID+' loaded!');
                    }
                  },
                  volume: 20
                });
          } else {
                $$.log('The sound failed to play. :(');
          }
        });
    },

///
/// TODO: clean this shit up.  This is all game init code, not engine-init code!
    finishInit : function() {
        
        this._soundmanagerInit();
        
        this.renderstack.push(
            new McGrender('main')
        );
        
        this.keys = new Keys();
        
        this.hero = false;
        
        $$.tickTime = get_time(); //starting time.
        
        /// This is sorta game-specific code
        /// needs to be pulled out of the engine.
        
        var mapdata = $$.assets.get('paradise_isle2.json');
        var tileset = $$.assets.get('tropic2.vsp');
        
        vsp = {
            image: tileset,
            tile: {w:16, h:16}
        };
        
        $$.map = new Map(mapdata, vsp);
        $$.renderstack[0].addLayer('map', true);
        $$.renderstack[0].setActiveLayer(0);
        
        var clearbox = new RenderThing(
            0, 0,
            320, 240, 
            function() {
                fill_rect( 0,0,320,240, '#000000' );
            }
        );
        
        $$.renderstack[0].add(clearbox);
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
                    tx = parseInt($$.hero.x/16);
                    ty = parseInt($$.hero.y/16)+1;
                    obj.text = 'Coords: ('+$$.camera.x+','+$$.camera.y+') ('+tx+','+ty+')';
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
        
        var hero_data = $$.assets.get( 'darin.json.chr' );
        var hero_img = $$.assets.get( 'darin.chr' );
        var sprite = new MapAnimation( 300, 300, hero_img, hero_data );
        $$.renderstack[0].add( sprite );
        
        $$.hero = sprite;
        $$.hero.setState( 'down_walk' );
        
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
        
        var textBox = new RenderThing(
            10, 180,
            300, 50, 
            function() {
                if( !this.img ) {
                    this.img = $$.assets.get('speech.png');
                }
        
                draw_menu_box(this);
                $$.context.fillStyle    = 'white';
                $$.context.font         = 'bold 16px Arial';
                $$.context.textBaseline = 'top';
                $$.context.fillText( 'Who are you and why have you come', this.x+8, this.y+5);
                $$.context.fillText( 'to this land of wonder?', this.x+8, this.y+26);
        
                $$.context.drawImage(
                    this.img,  0, 32, 32, 32,
                    this.x, this.y - 34,
                    32,32
                );
            }
        );
        
        textBox.color = '#000099';
        
        $$.menubox = menu;
        $$.textBox = textBox;
        
        $$.renderstack[0].add(menu);
        $$.renderstack[0].add(textBox);
        
        $$.onComplete();

    },

    onComplete : function() {
        this.setRenderInterval(this.targetFPS);
        this.render();
    },

    isOnScreen: function( x, y, w, h ) {
        return overlap( x, y, w, h, $$.camera.x, $$.camera.y, $$.screen.width, $$.screen.height );
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
        $$.hero.facing = $$.map.SPRITE_FACING_SOUTH;
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

    if( k.isActionButtonPressed() ) {
        k.releaseActionButton();

        var faceTile = $$.map.getFacedTile($$.hero);
        var faceZone = $$.map.getZone(faceTile.tx, faceTile.ty);

        if( faceZone ) {
            $$.log('Activating zone ' + faceZone );

            if( $$.map.zones[faceZone].method ) {
                $$.map.call( $$.map.zones[faceZone].event );

                $$.map[$$.map.zones[faceZone].event]();
            } else {
                $$.log('That event wasnt actually adjact.');
            }
            
        } else {
            $$.log("Nothing there.");
        }
    }

    if( k.held[k.M] ) {
        k.held[k.M] = false;
        $$._menu_direction = !$$._menu_direction;

        $$.menubox.move({
            x : ($$._menu_direction? -50 : 260) ,
            y : 10,
            time : 200
        });

        $$.textBox.visible = ! $$.textBox.visible;
    }

    if( !$$.hero ) {
        return;
    }

    var moved = false;

    var dx = 0;
    var dy = 0;

    if( k.held[k.W] ) {
        dy -= moverate;
        $$.hero.facing = $$.map.SPRITE_FACING_NORTH;
    } else if( k.held[k.S] ) {
        dy += moverate;
        $$.hero.facing = $$.map.SPRITE_FACING_SOUTH;
    }

    if( k.held[k.A] ) {
        dx -= moverate;
        $$.hero.facing = $$.map.SPRITE_FACING_WEST;
    } else if( k.held[k.D] ) {
        dx += moverate;
        $$.hero.facing = $$.map.SPRITE_FACING_EAST;
    }

    if( (dx ||dy) && i_want_to_go_to_there( $$.hero, dx, dy ) ) {         
        $$.hero.x += dx;
        $$.hero.y += dy;
         
        moved = true;
    }

    var facename = '';
    switch($$.hero.facing) {
        case $$.map.SPRITE_FACING_SOUTH:
            facename = 'down'; break;
        case $$.map.SPRITE_FACING_NORTH:
            facename = 'up'; break;
        case $$.map.SPRITE_FACING_EAST:
            facename = 'right'; break;
        case $$.map.SPRITE_FACING_WEST:
            facename = 'left'; break;
        default:
            throw "Unknown facing value: ("+$$.hero.facing+")";
    }

    ///cheapass bounds.
    if( moved ) {
        $$.hero.setState( facename+'_walk' );

        $$.hero.last_tx = parseInt(($$.hero.x + $$.hero.hotspot.x)/ 16);
        $$.hero.last_ty = parseInt(($$.hero.y + $$.hero.hotspot.y)/ 16);

    } else {
        $$.hero.setState( facename+'_idle' );
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