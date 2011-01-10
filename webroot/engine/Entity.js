/// myself === $$.hero

/// Largely transliterated from C to JS from
/// https://github.com/mcgrue/verge3/blob/master/verge/Source/g_entity.cpp
function Entity(x, y, def) {
    this.x = x;
    this.y = y;
    this.face = -1;

    this.path = [];
    this.FOLLOWDISTANCE = 16;
	this._zeroPath(x,y,this.SOUTH);

    this.speed = -1;
    
    this.follow = null;
    this.follower = null;

    this.waypointx = -1;
    this.waypointy = -1;

    this.movecode = 0;
    this.obstruction = false;
    this.obstructable = false;
    this.delay = 0;

    this.active = false;

    this.className = 'Entity';

    /// deleted most everythign related to framect.

/*
	follower = 0;
	follow = 0;
	delay = 0;
	lucent = 0;
	wdelay = 75;
	setxy(x1, y1);
	setspeed(100);
	speedct = 0;
	chr = RequestCHR(chrfn);
	hotw = chr->hw;
	hoth = chr->hh;
	visible = true;
	active = true;
	specframe = 0;
	movecode = 0;
	moveofs = 0;
	framect = 0;
	frame = 0;
	face = SOUTH;
	hookrender = "";
	script = "";
	description = "";
	memset(movestr, 0, 256);
	obstructable = 0;
	obstruction = 0;
	for (int i=0; i<FOLLOWDISTANCE; i++)
		pathx[i] = x,
		pathy[i] = y,
		pathf[i] = SOUTH;
 */
}

Entity.prototype = {
    NORTH : 1,
    SOUTH : 2,
    EAST : 3,
    WEST : 4,

    setFace : function( d ) {
        if ((d > 0) && (d <= 4)) {
            this.face = d; 
        } else {
            throw "Entity::setface("+d+"), facing values must be within the range [1, 4]";
        }
    },

    _zeroPath : function(x,y,f) {
        for( var i=0; i<FOLLOWDISTANCE; i++ ) {
            this.path.push( [x,y,this.SOUTH] )
        }
    }, 

    setXY : function( x, y ) {
        this.x = x;
        this.y = y;

        if( this.follower ) {
            this.follower.setXY(x, y);
        }

        this.setWaypoint(x,y);

        this._zeroPath(x,y,this.SOUTH);
    },

    setSpeed : function(s) {
        this.speed = s;
        if( this.follower ) {
            follower.setSpeed(s);
        }
    },
    
    _faceChanger : function(dx, dy) {
        switch( sign(dy) ) {
            case -1: this.face = this.NORTH; break;
            case 0:  break;
            case 1:  this.face = this.SOUTH; break;
        }
        switch( sign(dx) ) {
            case -1: this.face = this.WEST; break;
            case 0:  break;
            case 1:  this.face = this.EAST; break;
        }
    },

    setWaypoint : function(x, y)  {
    	this.waypointx = x;
    	this.waypointy = y;

        this._faceChanger(x-this.x, y-this.y);
    }, 

    setWaypointRelative : function(x, y, changeFace)  {
    	this.waypointx += x;
    	this.waypointy += y;
        
        if( changeFace ) {
            this._faceChanger(x, y);
        }
    },

    ready : function() {
        return this.x == this.waypointx && this.y == this.waypointy;
    },
    
    leaderIdle : function() {
        if( this.follow ) return follow.leaderIdle();
        return this.ready();
    },

    stalk : function(e) {
        if( e.className != 'Entity' ) {
            throw "Only Entities can stalk Entities.";
        }

        this.follow = e;
        e.follower = this;

        this.x = this.follow.path[this.FOLLOWDISTANCE-1][0];
        this.y = this.follow.path[this.FOLLOWDISTANCE-1][1];

        this._zeroPath(
            this.x,
            this.y,
            this.follow.path[this.FOLLOWDISTANCE-1][2]
        );

        this.set_waypoint( this.x, this.y );
        
        this.movecode = 0;
        this.obstruction = false;
        this.obstructable = false;
        this.delay = 0;
    },

    clearStalk : function() {
        if( this.follow ) {
            this.follow.follower = 0;
            this.follow = 0;
        }
    },

    moveTick : function() {
        var dx = this.waypointx - this.x;
        var dy = this.waypointy - this.y;
    
        /// for non-player-input-driven entities who are obstructable
        if( this != $$.hero && ! this.follow && this.obstructable ) {
            switch( this.face ) {
                case this.NORTH: if( ObstructDirTick(NORTH) ) return; break;
                case this.SOUTH: if( ObstructDirTick(SOUTH) ) return; break;
                case this.WEST: if( ObstructDirTick(WEST) ) return; break;
                case this.EAST: if( ObstructDirTick(EAST) ) return; break;
                default: throw "Entity::move_tick() - bad face value!! ("+this.face+")";
            }
        }
    
        // update pathxy for following
        for( var i = thisFOLLOWDISTANCE-2; i>=0; i-- ) {
            this.path[i+1] = path[i];
        }

        this.path[0] = [this.x, this.y, this.face];
    
        if( this.follow ) {
            this.x = this.follow.path[this.FOLLOWDISTANCE-1][0];
            this.y = this.follow.path[this.FOLLOWDISTANCE-1][1];
            this.face = this.follow.path[this.FOLLOWDISTANCE-1][2];
             
            set_waypoint( this.x, this.y );
            if( this.follower ) {
                this.follower.moveTick();
            }
            return;
        }
    
        this.x += dx;
        this.y += dy;
    
        if( this.follower ) {
            this.follower.move_tick();
        }
    },

    think : function() {
    	var num_ticks;
        if( !this.active ) {
            return;
        } 

    }
}





void Entity::think()
{
	int num_ticks;
	if (!active) return;

	if (delay>systemtime)
	{
		framect = 0;
		return;
	}

	speedct += speed;
	num_ticks = speedct / 100;
	speedct %= 100;

	while (num_ticks)
	{
		num_ticks--;

		if (ready())
		{
			switch (movecode)
			{
				case 0: if (this == $$.hero && !invc) ProcessControls(); break;
				case 1: do_wanderzone(); break;
				case 2: do_wanderbox(); break;
				case 3: do_movescript(); break;
				default: err("Entity::think(), unknown movecode value");
			}
		}
		if (!ready())
			move_tick();
	}
}

bool Entity::ObstructDirTick(int d)
{
	__grue_actor_index = this->index;

	int x, y;
	int ex = getx();
	int ey = gety();

	if (!obstructable) return false;
	switch (d)
	{
		case NORTH:
			for (x=ex; x<ex+hotw; x++)
				if (ObstructAt(x, ey-1)) return true;
			break;
		case SOUTH:
			for (x=ex; x<ex+hotw; x++)
				if (ObstructAt(x, ey+hoth)) return true;
			break;
		case WEST:
			for (y=ey; y<ey+hoth; y++)
				if (ObstructAt(ex-1, y)) return true;
			break;
		case EAST:
			for (y=ey; y<ey+hoth; y++)
				if (ObstructAt(ex+hotw, y)) return true;
			break;
	}
	return false;
}

bool Entity::ObstructDir(int d)
{
	__grue_actor_index = this->index;

	int i, x, y;
	int ex = getx();
	int ey = gety();

	if (!obstructable) return false;
	switch (d)
	{
		case NORTH:
			for (i=0; i<hoth; i++)
				for (x=ex; x<ex+hotw; x++)
					if (ObstructAt(x, ey-i-1)) return true;
			break;
		case SOUTH:
			for (i=0; i<hoth; i++)
				for (x=ex; x<ex+hotw; x++)
					if (ObstructAt(x, ey+i+hoth)) return true;
			break;
		case WEST:
			for (i=0; i<hotw; i++)
				for (y=ey; y<ey+hoth; y++)
					if (ObstructAt(ex-i-1, y)) return true;
			break;
		case EAST:
			for (i=0; i<hotw; i++)
				for (y=ey; y<ey+hoth; y++)
					if (ObstructAt(ex+hotw+i, y)) return true;
			break;
	}
	return false;
}

void Entity::do_wanderzone()
{
	bool ub=false, db=false, lb=false, rb=false;
	int ex = getx()/16;
	int ey = gety()/16;
	int myzone = current_map->zone(ex, ey);

	if (ObstructDir(EAST) || current_map->zone(ex+1, ey) != myzone) rb=true;
	if (ObstructDir(WEST) || current_map->zone(ex-1, ey) != myzone) lb=true;
	if (ObstructDir(SOUTH) || current_map->zone(ex, ey+1) != myzone) db=true;
	if (ObstructDir(NORTH) || current_map->zone(ex, ey-1) != myzone) ub=true;

	if (rb && lb && db && ub) return; // Can't move in any direction

	delay = systemtime + wdelay;
	while (1)
	{
		int i = rnd(0,3);
		switch (i)
		{
			case 0:
				if (rb) break;
				set_waypoint_relative(16, 0);
				return;
			case 1:
				if (lb) break;
				set_waypoint_relative(-16, 0);
				return;
			case 2:
				if (db) break;
				set_waypoint_relative(0, 16);
				return;
			case 3:
				if (ub) break;
				set_waypoint_relative(0, -16);
				return;
		}
	}
}

void Entity::do_wanderbox()
{
	bool ub=false, db=false, lb=false, rb=false;
	int ex = getx()/16;
	int ey = gety()/16;

	if (ObstructDir(EAST) || ex+1 > wx2) rb=true;
	if (ObstructDir(WEST) || ex-1 < wx1) lb=true;
	if (ObstructDir(SOUTH) || ey+1 > wy2) db=true;
	if (ObstructDir(NORTH) || ey-1 < wy1) ub=true;

	if (rb && lb && db && ub) return; // Can't move in any direction

	delay = systemtime + wdelay;
	while (1)
	{
		int i = rnd(0,3);
		switch (i)
		{
			case 0:
				if (rb) break;
				set_waypoint_relative(16, 0);
				return;
			case 1:
				if (lb) break;
				set_waypoint_relative(-16, 0);
				return;
			case 2:
				if (db) break;
				set_waypoint_relative(0, 16);
				return;
			case 3:
				if (ub) break;
				set_waypoint_relative(0, -16);
				return;
		}
	}
}

void Entity::do_movescript()
{
	static char vc2me[] = { 2, 1, 3, 4 };
	int arg;

	// movements factors
	// These are set to -1,0 or 1 to signify in
	// which directions movement should occur
	int vertfac = 0, horizfac = 0;


    // reset to tile-based at the start of a movestring
    if(moveofs == 0) {
        movemult = 16;
    }

	while ((movestr[moveofs] >= '0' && movestr[moveofs] <= '9') || movestr[moveofs] == ' ' || movestr[moveofs] == '-')
		moveofs++;

	int done = 0;
	int found_move = 0; // number of LRUD letters we found
	while(!done && found_move < 2) {
		switch(toupper(movestr[moveofs]))
		{
			case 'L':
				if(!found_move && face != WEST) setface(WEST);
				moveofs++;
				horizfac = -1;
				found_move++;
				break;
			case 'R':
				if(!found_move && face != EAST) setface(EAST);
				moveofs++;
				horizfac = 1;
				found_move++;
				break;
			case 'U':
				if(!found_move && face != NORTH) setface(NORTH);
				moveofs++;
				vertfac = -1;
				found_move++;
				break;
			case 'D':
				if(!found_move && face != SOUTH) setface(SOUTH);
				moveofs++;
				vertfac = 1;
				found_move++;
				break;
			default:
				done = 1;
		}
	}

	if(found_move) {
		arg = atoi(&movestr[moveofs]);
		// we've already set facing, don't do it again
		set_waypoint_relative(horizfac*arg*movemult, vertfac*arg*movemult, false);
	} else {
		// no directions, check other possible letters:
		switch(toupper(movestr[moveofs])) {
			case 'S': moveofs++;
				setspeed(atoi(&movestr[moveofs]));
				break;
			case 'W': moveofs++;
				delay = systemtime + atoi(&movestr[moveofs]);
				break;
			case 'F': moveofs++;
				setface(vc2me[atoi(&movestr[moveofs])]);
				break;
			case 'B': moveofs = 0; break;
			case 'X': moveofs++;
				arg = atoi(&movestr[moveofs]);
				set_waypoint(arg*16, gety());
				break;
			case 'Y': moveofs++;
				arg = atoi(&movestr[moveofs]);
				set_waypoint(getx(), arg*16);
				break;
			case 'Z': moveofs++;
				specframe = atoi(&movestr[moveofs]);
				break;
			case 'P': movemult = 1;
				moveofs++;
				break;
			case 'T': movemult = 16;
				moveofs++;
				break;
			case 'H':
			case 0:  
				movemult = 0; moveofs = 0; movecode = 0; framect = 0; 
				return;
			default: err("Entity::do_movescript(), unidentify movescript command");
		}
	}
}

void Entity::set_chr(const std::string& fname)
{
    chr = RequestCHR(fname.c_str());
	specframe = 0;
	framect = 0;
	frame = 0;
}

void Entity::draw()
{
	if (!visible) return;

    // if we're idle, reset the framect
	if ((!follow && ready()) || (follow && leaderidle()))
		framect = 0;

	if (specframe)
		frame = specframe;
	else
	{
		if (!follow)
		{
			if (ready()) frame = chr->idle[face];
			else frame = chr->GetFrame(face, framect);
		}
		else
		{
			if (leaderidle()) frame = chr->idle[face];
			else frame = chr->GetFrame(face, framect);
		}
	}

	int zx = getx() - xwin,
		zy = gety() - ywin;

	if (hookrender.length())
	{
		event_entity = index;
		se->ExecuteFunctionString(hookrender.c_str());
		return;
	}

	if (chr)
		chr->render(zx, zy, frame, screen);
	else
		DrawRect(zx, zy, zx + 15, zy + 15, MakeColor(255,255,255), screen);
}

void Entity::SetWanderZone()
{
    clear_stalk();
	set_waypoint(getx(), gety());
	movecode = 1;
}

void Entity::SetWanderBox(int x1, int y1, int x2, int y2)
{
    clear_stalk();
	set_waypoint(getx(), gety());
	wx1 = x1;
	wy1 = y1;
	wx2 = x2;
	wy2 = y2;
	movecode = 2;
}

void Entity::SetMoveScript(const char *s)
{
    clear_stalk();
	set_waypoint(getx(), gety());
	strcpy(movestr, s);
	moveofs = 0;
	movecode = 3;
}

void Entity::SetWanderDelay(int n)
{
	wdelay = n;
}

void Entity::SetMotionless()
{
    clear_stalk();
	set_waypoint(getx(), gety());
	movecode = 0;
	delay = 0;
}
*/