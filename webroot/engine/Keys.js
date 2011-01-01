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

	/// http://www.cambiaresearch.com/c4/702b8cd1-e5b0-42e6-83ac-25f0306e3e25/Javascript-Char-Codes-Key-Codes.aspx
	W: 87,
	S: 83,
    A: 65,	
    D: 68,

    M: 77,
    O: 79
};