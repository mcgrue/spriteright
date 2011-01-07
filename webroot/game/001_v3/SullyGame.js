function Game() {
    if( !this.beforeRender || !this.afterRender || !this.startup ) {
        throw "Invalid game object: one of the required functions was missing.";
    }
}

Game.prototype = {

    /// is called 
    beforeRender : function() {
        this.updateControls();
        this.doCameraFollow();
    },

    afterRender : function() {

    },

    updateControls : function() {
    
        var k = $$.keys;
    
        var time = get_time();
    
        if( !$$._last_hero_move ) {
            $$._last_hero_move = time;
            $$.hero.facing = $$.map.SPRITE_FACING_SOUTH;
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
            
            if( $$.textBox.visible ) {
                $$.textBox.advanceConversation();
            } else {
                $$.map.activateAdjancentZone($$.hero);
            }
        }
    
        if( k.held[k.M] ) {
            k.held[k.M] = false;
            $$._menu_direction = !$$._menu_direction;
    
            $$.menubox.move({
                x : ($$._menu_direction? -50 : 260),
                y : 10,
                time : 200
            });
        }
    
        if( !$$.hero ) {
            return;
        }
    
        /// let's turn of walking while you're talking.
        if( $$.textBox.visible ) { 
            return;
        }
    
        var moved = false;
    
        var dx = 0;
        var dy = 0;
    
        if( k.isUpPressed() ) {
            dy -= moverate;
            $$.hero.facing = $$.map.SPRITE_FACING_NORTH;
        } else if( k.isDownPressed() ) {
            dy += moverate;
            $$.hero.facing = $$.map.SPRITE_FACING_SOUTH;
        }
    
        if( k.isLeftPressed() ) {
            dx -= moverate;
            $$.hero.facing = $$.map.SPRITE_FACING_WEST;
        } else if( k.isRightPressed() ) {
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

            $$.hero.previous_tiles = $$.hero.current_tiles;
            $$.hero.current_tiles = calc_new_tiles($$.hero)

            var changed = find_new_and_old_tiles( $$.hero.current_tiles, $$.hero.previous_tiles );
            
            if( changed ) {
                var len = changed['new'].length;
                for( var i = 0; i<len; i++ ) {
                    $$.map.enterZone($$.hero, changed['new'][i][0], changed['new'][i][1]);
                }
/// when we implement leaveZone...
///                var len = changed['old'].length;
///                for( var i = 0; i<len; i++ ) {
///                    $$.map.leaveZone($$.hero, changed['new'][i][0], changed['new'][i][1]);
///                }
            }

        } else {
            $$.hero.setState( facename+'_idle' );
        }
    
        $$._last_hero_move = get_time();
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

    
    /// this function called after all the engine
    /// resources have been loaded.
    startup : function() {
        $$.renderstack.push(
            new McGrender('main')
        );
        
        $$.keys = new Keys();
        
        $$.hero = false;
        
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
        var layer_bg  = $$.renderstack[0].addLayer('map_bg', true);
        var layer_ent  = $$.renderstack[0].addLayer('entities', true);
        var layer_fg = $$.renderstack[0].addLayer('map_fg', true);
        var layer_ui  = $$.renderstack[0].addLayer('ui_elements', true);
try {
        var clearbox = new RenderThing(
            0, 0,
            320, 240, 
            function() {
                fill_rect( 0,0,320,240, '#000000' );
            }
        );
        
        $$.renderstack[0].add(layer_bg, clearbox);
        
        var bg = [];
        var fg = [];
        var eLayer = false;

        for( var i = 0; i<mapdata.layer_render_order.length; i++ ) {
            var n = mapdata.layer_render_order[i];
            if( !eLayer ) {
                if( is_int(n) ) {
                    bg.push(n);
                } else if( n == 'E' ) {
                    eLayer = true;
                } else {
                    // 'R' used to represent a rendering layer.
                    // throw 'unknown renderstring token: ('+n+')';
                }
            } else {
                if( is_int(n) ) {
                    fg.push(n);
                } else if( n == 'E' ) {
                    // throw 'Why would there be two entity layers?';
                } else {
                    // throw 'unknown renderstring token: ('+n+')';
                }
            }
        }

        if( bg.length ) {
            $$.renderstack[0].add(
                layer_bg, {
                    render: function() {
                        $$.map.render(bg);
                    }
                }
            );
        }

        if( fg.length ) {
            $$.renderstack[0].add(
                layer_fg, {
                    render: function() {
                        $$.map.render(fg);
                    }
                }
            );
        }
        
        txt = new Text(
            10, 10,
            "Hello.", {
                beforeRender : function(obj) {
                    obj.text = 'FPS: ' + $$._fps;
                }
            }
        );
        $$.renderstack[0].add(layer_ui, txt);
        
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
        $$.renderstack[0].add(layer_ui, txt);
        
        txt = new Text(
            10, 42,
            "Hello.", {
                beforeRender : function(obj) {
                    if( $$._debug_showthings ) {
                        obj.text = '[debug mode, obs showing]';
                    } else {
                        obj.text = '';
                    }   
                }
            }
        );
        $$.renderstack[0].add(layer_ui, txt);
        
        var hero_data = $$.assets.get( 'darin.json.chr' );
        var hero_img = $$.assets.get( 'darin.chr' );
        var sprite = new MapAnimation( 160, 896, hero_img, hero_data );
        $$.renderstack[0].add( layer_ent, sprite );
        
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
            x : -50,
            y : 10,
            time : 50
        });
        
        var textBox = new TextBox();

        $$.menubox = menu;
        $$.textBox = textBox;
        
        $$.renderstack[0].add(layer_ui, menu);
        $$.renderstack[0].add(layer_ui, textBox);
} catch(e) {
    alert('ERR: ' + e);
}
    }
}


function calc_new_tiles(ent) {
    var tmp = {}

    var tx = parseInt(($$.hero.x + $$.hero.hotspot.x)/ 16);
    var ty = parseInt(($$.hero.y + $$.hero.hotspot.y)/ 16);

    var tx2 = parseInt(($$.hero.x + $$.hero.hotspot.x + $$.hero.hotspot.w)/ 16);
    var ty2 = parseInt(($$.hero.y + $$.hero.hotspot.y + $$.hero.hotspot.h)/ 16);

    return {
        topleft : [tx, ty],
        bottomright : [tx2, ty2]
    }
}

/// this is naive atm.  Can be optimized.
function find_new_and_old_tiles( current, previous ) {
    if( !previous ) {
        return false;
    }

    if( /// there must be a better way to do this, but I can't think clearly atm and just want this done.
        current.topleft[0] != previous.topleft[0] ||
        current.topleft[1] != previous.topleft[1] ||
        current.bottomright[0] != previous.bottomright[0] ||
        current.bottomright[1] != previous.bottomright[1]
    ) {
        var cur = {};
        for( var x = current.topleft[0]; x <= current.bottomright[0]; x++ ) {
            for( var y = current.topleft[1]; y <= current.bottomright[1]; y++ ) {
                cur[x+','+y] = [x,y];
            }
        }

        var old = [];
        var step = [];
        for( var x = previous.topleft[0]; x <= previous.bottomright[0]; x++ ) {
            for( var y = previous.topleft[1]; y <= previous.bottomright[1]; y++ ) {
                if( cur[x+','+y] ) {
                    step.push( [x,y] );
                    delete cur[x+','+y];
                } else {
                    old.push( [x,y] );
                }
            }
        }
        
        var _new = [];
        for( var n in cur ) {
            _new.push( cur[n] );
        }

        return { 'new' : _new, 'old' : old, 'step' : step };

    } else {
        var step = [];
        for( var x = previous.topleft[0]; x <= previous.bottomright[0]; x++ ) {
            for( var y = previous.topleft[1]; y <= previous.bottomright[1]; y++ ) {
                step.push( [x,y] );
            }
        }

        return { 'new' : [], 'old' : [], 'step' : step };
    }
}

var Transition = {
    NONE: 0,
}

function Warp(tx, ty, trans) {

    var x = $$.camera.x - $$.hero.x;
    var y = $$.camera.y - $$.hero.y;

    $$.hero.x = tx*16;
    $$.hero.y = ty*16;

    $$.camera.x = $$.hero.x + x;
    $$.camera.y = $$.hero.y + y;
}