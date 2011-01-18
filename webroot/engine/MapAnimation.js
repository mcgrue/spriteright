
function MapAnimation(x, y, img, animation_def) {

    this.x = x;
    this.y = y;
    this.img = img;
    this._def = animation_def;
    this.hotspot = this._def.hotspot;

    this.forceFrame = false;

    this.w = this._def.dimensions.w;
    this.h = this._def.dimensions.h;

    if( this._def.default_wait ) {
        this.convertSimpleAnimations();
    }

    this.animation_state = false;
    this.cur_instruction = false;
    this.cur_frame = false;
    this.next_frame_time = false;
}

MapAnimation.prototype = {
    NORTH : 1,
    SOUTH : 2,
    EAST : 3,
    WEST : 4,
    NW : 5,
    SW : 6,
    NE : 7,
    SE : 8,

    setState: function(s, force) {
        if( this.animation_state == s && !force ) {
            return;
        }

        if( !this._def.animations[s] ) {
            throw "Invalid animation: '"+s+"'";
        } else {
            this.animation_state = s;
        }
        
        if( this._def.animations[s][0][2] != 'F' ) {
            throw "The first command in an animation currently must be a 'F' (FRAME).  Found '"+this._def.animations[s][0][2]+"'.";
        } else {
            this.cur_frame = this._def.animations[s][0][0];
            this.next_frame_time = this._def.animations[s][0][1] + $$.tickTime;
            this.cur_instruction = 0;
        }
    },

    setForceFrame: function(f) {
        this.forceFrame = f;
    },

    processAnimation: function() {
        if( this.cur_instruction + 1 < this._def.animations[this.animation_state].length ) {
            this.cur_instruction++;
            
            var done = false;
            var killSwitch = 0;
            while( !done ) {

                var cur = this._def.animations[this.animation_state][this.cur_instruction];

                /// commands, currently only 'F' and 'GOTO'
                if( cur[2] == 'F' ) {
                    this.cur_frame = cur[0];
                    this.next_frame_time = cur[1] + $$.tickTime;
                    done = true;

                } else if( cur[2] == 'GOTO' ) {
                    if( cur[0] < 0 || cur[0] >= this._def.animations[this.animation_state].length ) {
                        throw "Attempted to GOTO out of bounds in an animation. Range was [0,"+this._def.animations[this.animation_state].length+"), attempted GOTO " + cur[0];
                    }
                    this.cur_instruction = cur[0];
                }

                /// error cases.
                else if( killSwitch >= 10 ) {
                    throw "Animation processing loop went 10 iterations without releasing.  KILLSWITCH ENGAGED.  (something was probably wrong somewhere.)";
                } else {
                    throw "Unknown command: '"+cur[2]+"'";
                }

                killSwitch++;
            }
        } else {
            throw "Invalid instruction: attempted to go to position ("+(this.cur_instruction + 1)+") on animation '"+this.animation_state+"', but it only had ("+this._def.animations[this.animation_state].length+") members."
        }
    },

    convertSimpleAnimations: function() {
        var w = this._def.default_wait;
        var anims = {};

        for( var x in this._def.animations ) {
            var a = this._def.animations[x];
            var b = [];
             
            for( var i = 0; i<a.length; i++ ) {
                b.push( [a[i], w, 'F'] );
            }
             
            b.push( [0,0,'GOTO'] );
            
            anims[x] = b;
        }

        this._def.animations = anims;
    },

    render: function() {
        if( !$$.isOnScreen(this.x, this.y, this.w, this.h) ) {
            return;
        }

        if( !this.animation_state ) {
            throw "Animation tried to render without state.";
        }

        if( this.forceFrame ) {
            var f = this.forceFrame;
        } else {
            if( $$.tickTime >= this.next_frame_time ) {
                this.processAnimation();
            }
            var f = this.cur_frame;
        }

        if( parseInt(f) != f ) {
            throw "Invalid frametype: " + f
        }

        var res = get_sprite_coordinates( f, this._def.dimensions, this._def.sheet );

        $$.context.drawImage(
            this.img,

            res.x, res.y, this.w, this.h,
            
            (this.x - $$.camera.x)*$$.scale,
            (this.y - $$.camera.y)*$$.scale,

            this.w*$$.scale, this.h*$$.scale
        );
    },
}

