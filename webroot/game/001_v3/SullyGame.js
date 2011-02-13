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

    processUserInputForPlayer : function() {
        return ProcessControls($$.hero);
    },

    updateControls : function() {
    
        var k = $$.keys;
    
        var time = get_time();
    
        if( !$$._last_hero_move ) {
            $$._last_hero_move = time;
            $$.hero.facing = $$.map.SPRITE_FACING_SOUTH;
        }
/*
        else if( time - $$._last_hero_move < 34 ) { // clamp to 30 fps for move update?
            return;
        }
*/
        var moverate = (time - $$._last_hero_move) * .15; // 100 px/sec

        //var moverate = (time - $$._last_hero_move) * .10; // 100 px/sec
//$$.log('moverate: ' + moverate);
    
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

                /// a hack to stop you from flying off as soon as you leave a textbox.  needs beter solution.
                $$._last_hero_move = false;
                moverate = 0;
            } else {
                if( !$$.map.activateAdjancentZone($$.hero) ) {
                    $$.map.activateAdjancentEntity($$.hero);
                }
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
    
        //!is_obstructed_at( $$.hero.x + dx, $$.hero.y + dy ) 
        if( (dx ||dy) ) {
            moved = attempt_to_move( dx, dy, $$.hero );
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

                if( $$.moves_ignore_once ) {
                    $$.moves_ignore_once = false;
                } else {
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

        if( $$.camera.x < 0 ) $$.camera.x = 0;
        else if( $$.camera.x > ($$.map.width -$$.screen.width) ) $$.camera.x = ($$.map.width -$$.screen.width);

        if( $$.camera.y < 0 ) $$.camera.y = 0;
        else if( $$.camera.y > ($$.map.height -$$.screen.height) ) $$.camera.y = ($$.map.height -$$.screen.height);
    },

    fade : function( timeFade, lucentFade, color, onComplete ) {
        
        if( timeFade < 0 ) {
            debugger;
            throw "fade(), timeFade cannot be < 0, was " + timeFade;
        }

        if( lucentFade < 0 || lucentFade > 100 ) {
            debugger;
            throw "fade(), lucentFade has a valid range of [0,100], got " + lucentFade;
        }

        if( color ) {
            $$.clearbox_color = color;
        }
        
        if( timeFade == 0 && (lucentFade == 0 || lucentFade == 100) ) {
            debugger;
            onOrOff = (lucentFade == 100);
            for( var i=0; i<$$.mapLayers.length; i++ ) {
                $$.renderstack[0].layers[$$.mapLayers[i]].visible = onOrOff;
            }
            return;
        }

        $$.fadebox.move({
           x : lucentFade,
           y : lucentFade,
           time : timeFade,
           onStopMoving : onComplete
        });
    },
     
    drawImage : function( img, x, y ) {
        var renderImg = new RenderImage( x, y, img );
     
        $$.renderstack[0].add($$.topLayer, renderImg);
    },
     
    clearAllImages : function() {
        $$.renderstack[0].layers[$$.topLayer] = [];
    },

    loadMap : function ( map_assetname, tx, ty ) {

        $$.moves_ignore_once = true;

        var mapdata = $$.assets.get(map_assetname);
        var vsp = {
            name: mapdata.savevsp,
            image: null,
            tile: {w:16, h:16}
        };

        $$.map = new Map(mapdata, vsp);

        /// now set up the renderstack.
        var bg = [];
        var fg = [];
        var eLayer = false;

        $$.renderstack[0].clear( $$.mapLayers.fg );
        $$.renderstack[0].clear( $$.mapLayers.bg );
        $$.renderstack[0].clear( $$.mapLayers.ent );

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
                $$.mapLayers.bg, {
                    render: function() {
                        $$.map.render(bg);
                    }
                }
            );
        }
         
        if( fg.length ) {
            $$.renderstack[0].add(
                $$.mapLayers.fg, {
                    render: function() {
                        $$.map.render(fg);
                    }
                }
            );
        }
         
        if( $$.hero ) {
            $$.renderstack[0].add( $$.mapLayers.ent, $$.hero );
            $$.hero.setState( 'down_walk' );

            if( tx && ty ) {
                Warp(tx, ty, false);
            }
        }

        /// now oad the entities
        var done = false;
        var i = 0;
        while( !done ) {
            if( !$$.map.map.entities[i] ) {
                done = true;
                continue;
            } else {
                var e = $$.map.map.entities[i];
        
                /// maybe this should go in the v3->sw converter?
                if( $$.map.map.entities[i].script ) {
                    $$.map.map.entities[i].onAdjacentActivate = $$.map.map.entities[i].script;
                }
            }
        
            var entity_data = $$.assets.get( e.chr ); // like 'crystal.json.chr', which was loaded in the asset loader.
            var entity_img = $$.assets.get( entity_data.image ); // like 'crystal.png', which was loaded in the asset loader.
        
            var entity_sprite = new MapAnimation( e.x, e.y, entity_img, entity_data );
            entity_sprite.setState( 'down_idle' );
            $$.renderstack[0].add( $$.mapLayers.ent, entity_sprite );
        
            // ping
            $$.map.map.entities[i].sprite = entity_sprite;
            
            i++;
        }
        $$.map.map.entities.length = i;
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

        var layer_bottomclear = $$.renderstack[0].addLayer({name: 'solid_color', visible: true, can_lucent: false});
        var layer_bg  = $$.renderstack[0].addLayer({name: 'map_bg', visible: true});
        var layer_ent  = $$.renderstack[0].addLayer({name: 'entities', visible: true});
        var layer_fg = $$.renderstack[0].addLayer({name: 'map_fg', visible: true});
        var layer_ui  = $$.renderstack[0].addLayer({name: 'ui_elements', visible: true, can_lucent: false});
        var layer_top  = $$.renderstack[0].addLayer({name: 'top_layer', visible: true, can_lucent: false});

        $$.mapLayers = {bg: layer_bg, ent: layer_ent, fg: layer_fg};

        $$.topLayer = layer_top;

        $$.game.loadMap('paradise_isle2.json');

try {
        $$.fadebox_color = '#000000';
        var fadebox = new RenderThing(
            100, 100,
            320, 240, 
            function() {
                fill_rect( 0,0,320,240, $$.fadebox_color );
                $$.lucent_percent = this.x;
            },
            function() {
                //$$.log( $$.lucent_percent + 'fadebox is thinking!' + $$.tickTime );
            }
        );

        $$.fadebox = fadebox;
        $$.renderstack[0].add(layer_bottomclear, fadebox);
        
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
                        obj.text = '$$.lucent_percent: ' + $$.lucent_percent;
                    }   
                }
            }
        );
         
        $$.renderstack[0].add(layer_ui, txt);
        
        var hero_data = $$.assets.get( 'darin.json.chr' );
        var hero_img = $$.assets.get( 'darin.png' );

        var sprite = new MapAnimation( 200, 896, hero_img, hero_data );

        $$.hero = sprite;
        $$.renderstack[0].add( layer_ent, $$.hero );
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

function is_obstructed_at( px, py ) {
    return false;
}

/// ah sick of this transliteration.  GLOABLTIME.
var NORTH = 1;
var SOUTH = 2;
var EAST = 3;
var WEST = 4;
var NE = 5;
var NW = 6;
var SE = 7;
var SW = 8;

function ObstructAt( px, py, ent ) {

	if( $$.map.obstructPixel(px,py) ) {
        
        if( ent && ent.onObstruct ) { ent.onObstruct(px, py); }

		return true;
	}

	var ent_hit = $$.map.obstructEntity(px,py,ent);

	if( ent_hit !== false ) {
        
        if( ent ) {
            if( ent_hit.onCollide ) { ent_hit.onCollide(ent); }
            if( ent.onCollide ) { ent.onCollide(ent_hit); }
        }
        
		return true;
	}

	return false;
}

function _midpoint_helper(coord1, coord2) {
    return [
        parseInt( (coord1[0] + coord2[0]) /2 ),
        parseInt( (coord1[1] + coord2[1]) /2 )
    ];
}


function find_base_points_for_obstructing(dx, dy, ent) {

    if( !dx && !dy ) {
        throw "There is no movement.  There is no need for obstructing.  Why are we here?";
    }

    var top_left = [ent.x+ent.hotspot.x, ent.y+ent.hotspot.y];
    var top_right = [top_left[0]+ent.hotspot.w, top_left[1]]
    var bottom_left = [top_left[0], top_left[1]+ent.hotspot.h];
    var bottom_right = [top_right[0], bottom_left[1]];

    if( dx == 0 ) {
        // north and south only

        if( dy < 0 ) { // north
            return [
                top_left,
                _midpoint_helper(top_left, top_right),
                top_right,
            ];

        } else { // south
            return [
                bottom_left,
                _midpoint_helper(bottom_left, bottom_right),
                bottom_right
            ];
        }
    }

    if( dy == 0 ) {
        // east and west only
        
        if( dx < 0 ) { //west
            return [
                top_left,
                _midpoint_helper(top_left, bottom_left),
                bottom_left
            ];
        } else { // east
            return [
                top_right,
                _midpoint_helper(top_right, bottom_right),
                bottom_right
            ];
        }
    }

    if( dx < 0 ) {
        // northeast and southeast only

        if( dy < 0 ) { //northeast
            return [
                top_left,
                top_right,
                bottom_right
            ];
        } else { //southeast
            return [
                top_right,
                bottom_right,
                bottom_left
            ];
        }

    } else {
        // northwest and southwest only
        
        if( dy < 0 ) { //northwest
            return [
                bottom_left,
                top_left,
                top_right
            ];
        } else { //southwest
            return [
                top_left,
                bottom_left,
                bottom_right,
            ];
        }
    }
}


function _attempt_to_move_inner(ticks, tick_x, tick_y, arBasePoints, ent) {
    var good_dx = 0, good_dy = 0;
    var x, y;

    var len = arBasePoints.length;

    var two_dir_mode = tick_x && tick_y;

    for( var i=0; i<=ticks; i++ ) {
        x = parseInt(i * tick_x);
        y = parseInt(i * tick_y);

        if( two_dir_mode && x != good_dx && y != good_dx ) { // broken line
            var startx = smaller(good_dx,x);
            var endx = bigger(good_dx,x);
            var starty = smaller(good_dy,y);
            var endy = bigger(good_dy,y);
            
            for( var xx=startx; xx<=endx; xx++ ) {
                for( var yy=starty; yy<=endy; yy++ ) {
                    for( var j=0; j<len; j++ ) {
                        if( ObstructAt(arBasePoints[j][0]+xx, arBasePoints[j][1]+yy, ent) ) {
                            
                            ent.lastHitPixel = [arBasePoints[j][0]+xx, arBasePoints[j][1]+yy];

                            return [good_dx, good_dy, 1];
                        }
                    }
                }
            }
        } else {
            for( var j=0; j<len; j++ ) {
                if( ObstructAt(arBasePoints[j][0]+x, arBasePoints[j][1]+y, ent) ) {

                    ent.lastHitPixel = [arBasePoints[j][0]+x, arBasePoints[j][1]+y];

                    return [good_dx, good_dy, 1];
                }
            }
        }
        
        good_dx = x;
        good_dy = y;
    }

    return [good_dx, good_dy, 0];
}

function attempt_to_move( dx, dy, ent ) {

    var x = Math.abs(dx);
    var y = Math.abs(dy);

    var tick_x, tick_y, ticks;

    if( x > y ) {
        ticks = x;
        tick_x = sign(dx);
        tick_y = dy / x;
    } else {
        ticks = y;
        tick_x = dx / y;
        tick_y = sign(dy);
    }

    // determine
    var arBasePoints = find_base_points_for_obstructing(dx, dy, ent);

    var res = _attempt_to_move_inner(ticks, tick_x, tick_y, arBasePoints, ent);

    ent.x += res[0];
    ent.y += res[1];
    
    if( res[2] ) { /// ie, movus interruptus
        //debugger;

        var tc = $$.map.getTileCoordinates(ent.lastHitPixel[0], ent.lastHitPixel[1]);
        var t = $$.map.getObstructionTile(tc.tx,tc.ty);

        //var d = bigger( Math.abs(Math.abs(dx)-Math.abs(res[0])), Math.abs(Math.abs(dy)-Math.abs(res[1])) );
        var d = 2;

        /// we're going to cheat for the two special case
        /// tiles in the basic obs set. 
        if( t == 3 || t == 4 ) {

            if( t == 3 ) { // -> \
                switch( ent.facing ) {
                    case $$.map.SPRITE_FACING_SOUTH:
                    case $$.map.SPRITE_FACING_EAST:
                        ent.x += d;
                        ent.y += d;
                        break;
                    case $$.map.SPRITE_FACING_NORTH:
                    case $$.map.SPRITE_FACING_WEST:
                        ent.x -= d;
                        ent.y -= d;
                        break;
                    default:
                        break;
                }    
            } else { //   -> /
                switch( ent.facing ) {
                    case $$.map.SPRITE_FACING_SOUTH:
                    case $$.map.SPRITE_FACING_WEST:
                        ent.x -= d;
                        ent.y += d;
                        break;
                    case $$.map.SPRITE_FACING_NORTH:
                    case $$.map.SPRITE_FACING_EAST:
                        ent.x += d;
                        ent.y -= d;
                        break;
                    default:
                        break;
                }
            }

            res[0] += d;
            res[1] += d;
        }
    }

    ent.x = parseInt(ent.x);
    ent.y = parseInt(ent.y);

    return res[0] || res[1];
}
