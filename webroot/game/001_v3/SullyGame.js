function Game() {

}

Game.prototype = {
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
}