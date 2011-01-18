/// borrowed from Noel Berry's Ambient Engine - http://www.noelberry.ca/

function Keys() {
    var that = this;
    $(window).keydown(function(e) {
        that.onKeyDown(e);
    });

    $(window).keyup(function(e) {
        that.onKeyUp(e);
    });

    this.held = [];
    this.release = [];
    this.pressed = [];

    for(var i = 0; i < 240; i ++) {
        this.held[i] = false;
        this.release[i] = false;
        this.pressed[i] = false;
    }
}


Keys.prototype = {

	onKeyDown: function(evt) {
		this.held[evt.keyCode] = true;
	},

	onKeyUp: function(evt) {
		this.held[evt.keyCode] = false;
	},

	undoKeyPress: function(key) {
		this.pressed[key] = false;
	},

	undoKeyRelease: function(key) {
		this.release[key] = false;
	},

isUpPressed : function() {
    return $$.keys.held[$$.keys.W] || $$.keys.held[$$.keys.UP];
},

releaseUp : function() {
    $$.keys.held[$$.keys.W] = false;
    $$.keys.held[$$.keys.UP] = false;
},

isDownPressed : function() {
    return $$.keys.held[$$.keys.S] || $$.keys.held[$$.keys.DOWN];
},

releaseDown : function() {
    $$.keys.held[$$.keys.S] = false;
    $$.keys.held[$$.keys.DOWN] = false;
},

isLeftPressed : function() {
    return $$.keys.held[$$.keys.A] || $$.keys.held[$$.keys.LEFT];
},

releaseLeft : function() {
    $$.keys.held[$$.keys.A] = false;
    $$.keys.held[$$.keys.LEFT] = false;
},

isRightPressed : function() {
    return $$.keys.held[$$.keys.D] || $$.keys.held[$$.keys.RIGHT];
},

releaseRight : function() {
    $$.keys.held[$$.keys.D] = false;
    $$.keys.held[$$.keys.RIGHT] = false;
},


isActionButtonPressed : function() {
    return $$.keys.held[$$.keys.K] || $$.keys.held[$$.keys.ENTER] || $$.keys.held[$$.keys.SPACE];
},

releaseActionButton : function() {
    $$.keys.held[$$.keys.K] = false;
    $$.keys.held[$$.keys.ENTER] = false;
    $$.keys.held[$$.keys.SPACE] = false;
},

	/// http://www.cambiaresearch.com/c4/702b8cd1-e5b0-42e6-83ac-25f0306e3e25/Javascript-Char-Codes-Key-Codes.aspx
    
    ENTER: 13,

    SPACE: 32,

	W: 87,
	S: 83,
    A: 65,	
    D: 68,

    K: 75,
    M: 77,
    O: 79,

    LEFT : 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40
};