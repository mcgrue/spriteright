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
    
        var moverate = parseInt((time - $$._last_hero_move) * .10); // 100 px/sec
    
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
    
        if( (dx ||dy) && !is_obstructed_at( $$.hero.x + dx, $$.hero.y + dy ) ) {
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

        if( $$.camera.x < 0 ) $$.camera.x = 0;
        else if( $$.camera.x > ($$.map.width -$$.screen.width) ) $$.camera.x = ($$.map.width -$$.screen.width);

        if( $$.camera.y < 0 ) $$.camera.y = 0;
        else if( $$.camera.y > ($$.map.height -$$.screen.height) ) $$.camera.y = ($$.map.height -$$.screen.height);
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
        
        vsp = {
            name: 'tropic2.vsp',
            image: null,
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
        var hero_img = $$.assets.get( 'darin.png' );

        //var hero_data = $$.assets.get( 'crystal.json.chr' );
        //var hero_img = $$.assets.get( 'crystal.png' );


//// investigate: void Entity::do_movescript()
//// ProcessControls()
//// onEntityCollision()

var done = false;
var i = 0;
while( !done ) {
    if( !$$.map.map.entities[i] ) {
        done = true;
        continue;
    } else {
        var e = $$.map.map.entities[i];
    }

    var entity_data = $$.assets.get( e.chr ); // like 'crystal.json.chr', which was loaded in the asset loader.
    var entity_img = $$.assets.get( entity_data.image ); // like 'crystal.png', which was loaded in the asset loader.

    var entity_sprite = new MapAnimation( e.x, e.y, entity_img, entity_data );
    entity_sprite.setState( 'down_idle' );
    $$.renderstack[0].add( layer_ent, entity_sprite );
    
    i++;
}

//$$.hero = new MapEntity(160, 896, hero_data, 1);

        var sprite = new MapAnimation( 160, 896, hero_img, hero_data );
        $$.hero = sprite;
        $$.renderstack[0].add( layer_ent, $$.hero );
        $$.hero.setState( 'down_walk' );

        //$$.hero.movecode = 0;
        //$$.hero.active = true;

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

/*
int obstructpixel(int x, int y) {
    if ( x<0 || y<0 || (x>>4)>=mapwidth || (y>>4)>=mapheight ) return 1;
    int t=obslayer[((y>>4)*mapwidth)+(x>>4)];
    return tileset->GetObs(t, x&15, y&15);
}
*/

function is_obstructed_at( px, py ) {
    return false;
}

/// an entity has coordinates, dimensions, and a bounding box.
/// return true if you can make that move.
/// return false if you'd go bump in the night.
/*
function is_obstructed_at( px, py ) {
     
	if( $$.map.obstructPixel(px, py) ) {
debugger;


		if( isEntityCollisionCapturing(a) ) {
			event_tx = x/16;
			event_ty = y/16;
			event_entity = __grue_actor_index;
			event_zone = current_map->zone(x/16, y/16);
			event_entity_hit = -1;
			onEntityCollision();
		}
   
		return true;
	}

	int ent_idx = EntityObsAt(x, y);

	if( ent_idx > -1 ) {

		if( isEntityCollisionCapturing() ) {
			event_tx = x/16;
			event_ty = y/16;
			event_entity = __grue_actor_index;
			event_zone = -1;
			event_entity_hit = ent_idx;
			onEntityCollision();
		}

		return true;
	}

	return false;
}
*/

/// ah sick of this transliteration.  GLOABLTIME.
var NORTH = 1;
var SOUTH = 2;
var EAST = 3;
var WEST = 4;
var NE = 5;
var NW = 6;
var SE = 7;
var SW = 8;

function ObstructAt( px, py ) {

debugger;    
	if( $$.map.obstructPixel(px,py) ) {
/*
		if( isEntityCollisionCapturing() ) {
			event_tx = x/16;
			event_ty = y/16;
			event_entity = __grue_actor_index;
			event_zone = current_map->zone(x/16, y/16);
			event_entity_hit = -1;
			onEntityCollision();
		}
*/
		return true;
	}

	var ent_idx = $$.map.obstructEntity(px,py);

	if( ent_idx !== false ) {

/*
		if( isEntityCollisionCapturing() ) {
			event_tx = x/16;
			event_ty = y/16;
			event_entity = __grue_actor_index;
			event_zone = -1;
			event_entity_hit = ent_idx;
			onEntityCollision();
		}
*/
		return true;
	}

	return false;
}

function ProcessControls( myself ) {
	
    // No player movement can be done if there's no ready player, or if there's a script active.
	if( !myself || !myself.ready() ) {
		return false;
	}

//	if( myself->movecode == 3 ) {
//		ScriptEngine::PlayerEntityMoveCleanup();
//	}

    var up = $$.keys.isUpPressed();
    var down = $$.keys.isDownPressed();
    var left = $$.keys.isLeftPressed();
    var right = $$.keys.isRightPressed();

	// check diagonals first
	if( left && up ) {
		myself.setFace(myself.WEST);
		var dist = myself.MaxPlayerMove(NW, myself.playerstep);
		if( dist ) {
			myself.setWaypointRelative(-1*dist, -1*dist, 1);
			return true;
		}
	}

	if( right && up ) {
		myself.setFace(myself.EAST);
		var dist = myself.MaxPlayerMove(NE, myself.playerstep);
		if (dist) {
			myself.setWaypointRelative(dist, -1*dist, 1);
			return true;
		}
	}

	if( left && down ) {
		myself.setFace( myself.WEST );
		var dist = myself.MaxPlayerMove(SW, myself.playerstep);
		if( dist ) {
			myself.setWaypointRelative(-1*dist, dist, 1);
			return true;
		}
	}

	if( right && down ) {
		myself.setFace( myself.EAST );
		var dist = myself.MaxPlayerMove(SE, myself.playerstep);
		if( dist ) {
			myself.setWaypointRelative(dist, dist, 1);
			return true;
		}
	}

	// check four cardinal directions last
	if( up ) {
		myself.setFace( myself.NORTH );
		var dist = myself.MaxPlayerMove(NORTH, myself.playerstep);
		if( dist ) {
			myself.setWaypointRelative(0, -1*dist, 1);
			return true;
		}

        dist = myself.MaxPlayerMove(NW, myself.playerstep);
        if( dist ) {
            myself.setFace( myself.WEST );
            myself.setWaypointRelative(-1*dist, -1*dist, 1);
            return true;
        }

        dist = myself.MaxPlayerMove(NE, myself.playerstep);
        if( dist ) {
            myself.setFace( myself.EAST );
            myself.setWaypointRelative(dist, -1*dist, 1);
            return true;
        }
	}

	if( down ) {
		myself.setFace( myself.SOUTH );
		var dist = myself.MaxPlayerMove(SOUTH, myself.playerstep);
		if( dist ) {
			myself.setWaypointRelative(0, dist, 1);
			return true;
		}

        // check for sliding along walls if we permit diagonals
        dist = myself.MaxPlayerMove(SW, myself.playerstep);
        if( dist ) {
            myself.setFace( myself.WEST );
            myself.setWaypointRelative(-1*dist, 1*dist, 1);
            return true;
        }

        dist = myself.MaxPlayerMove(SE, myself.playerstep);
        if( dist ) {
            myself.setFace( myself.EAST );
            myself.setWaypointRelative(dist, dist, 1);
            return true;
        }
	}

	if( left ) {
		myself.setFace( myself.WEST );
		var dist = myself.MaxPlayerMove(WEST, myself.playerstep);
		if( dist ) {
			myself.setWaypointRelative(-1*dist, 0, 1);
			return true;
		}

        // check for sliding along walls if we permit diagonals
        dist = myself.MaxPlayerMove(NW, myself.playerstep);
        if( dist ) {
            myself.setFace( myself.WEST );
            myself.setWaypointRelative(-1*dist, -1*dist, 1);
            return true;
        }

        dist = myself.MaxPlayerMove(SW, myself.playerstep);
        if( dist ) {
            myself.setFace( myself.WEST );
            myself.setWaypointRelative(-1*dist, 1*dist, 1);
            return true;
        }
	}

	if( right ) {
		myself.setFace( myself.EAST );
		var dist = myself.MaxPlayerMove(EAST, myself.playerstep);
		if( dist ) {
			myself.setWaypointRelative(dist, 0, 1);
			return true;
		}

        // check for sliding along walls if we permit diagonals
        dist = myself.MaxPlayerMove(NE, myself.playerstep);
        if( dist ) {
            myself.setFace( myself.EAST );
            myself.setWaypointRelative(dist, -1*dist, 1);
            return true;
        }

        dist = myself.MaxPlayerMove(SE, myself.playerstep);
        if( dist ) {
            myself.setFace( myself.EAST );
            myself.setWaypointRelative(dist, dist, 1);
            return true;
        }
	}

    return false;
}


function attempt_to_move( dx, dy, ent ) {
    ent.x += dx;
    ent.y += dy;

    return true;
}
