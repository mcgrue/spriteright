
function MapSprite(x, y, w, h, img) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;
}

MapSprite.prototype = {

    render: function() {
        if( !$$.isOnScreen(this.x, this.y, this.w, this.h) ) {
            return;
        }

        $$.context.drawImage( this.img, this.x-$$.camera.x, this.y-$$.camera.y );
    },
}

