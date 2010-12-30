
function MapSprite(x, y, w, h, img, animation_def) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;

    if(!animation_def) {
        this.animations = false;
        this.animation_state = false;
    } else {
        this.animations = animation_def;
        this.animation_state = false;
    }
}

MapSprite.prototype = {

    render: function() {
        if( !$$.isOnScreen(this.x, this.y, this.w, this.h) ) {
            return;
        }
        
        if( !this.animation_state ) {
            $$.context.drawImage( this.img, this.x-$$.camera.x, this.y-$$.camera.y );
        } else {
            throw "Not yet implemented.";
        }
    },
}

