
function RenderThing(x, y, w, h, think, draw) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.visible = true;

    if( !think ) {
        this.think = function(){};
    }

    if( !draw ) {
        this.draw = function(){};
    }
}

MapImage.prototype = {

    shouldBeDrawn: function() {
        if( this.x + this.w < 0 && this.y + this.h < 0 ) return false;
        if( this.x >= $$.screen.width && this.y >= $$.screen.height ) return false;

        return this.visible;
    },

    render: function() {
        if( this.think ) {
            this.think();
        }

        if( !this.shouldBeDrawn() ) {
            return;
        }

        this.draw();
    },
}