
function RenderThing( x, y, w, h, draw, think ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.visible = true;

    if( !think ) {
        this.think = function(){};
    } else {
        this.think = think;
    }

    if( !draw ) {
        this.draw = function(){};
    } else {
        this.draw = draw;
    }
}

RenderThing.prototype = {

    move : function( data ) {
        if( data.time ) {
            var dx = data.x - this.x;
            var dy = data.y - this.y;
            
            this.slice = {
                x : dx/data.time,
                y : dy/data.time,
                start_x : this.x,
                start_y : this.y,
                final_x : data.x,
                final_y : data.y,
                time_done : $$.tickTime + data.time,
                time_start : $$.tickTime
            };
            
        } else {
            this.x = data.x;
            this.y = data.y;
        }
    },

    doMove : function() {
        if( $$.tickTime >= this.slice.time_done ) {
            this.x = this.slice.final_x;
            this.y = this.slice.final_y;
            this.slice = false;
            return;
        }

        //debugger;

        this.x = parseInt(this.slice.start_x + ( this.slice.x * ($$.tickTime - this.slice.time_start)));
        this.y = parseInt(this.slice.start_y + ( this.slice.y * ($$.tickTime - this.slice.time_start)));
    },

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

        if( this.slice ) {
            this.doMove();
        }

        this.draw();
    },
}

function RenderImage( x, y, img ) {
    
    this.img = img;    

    this.x = x;
    this.y = y;
    this.w = img.width;
    this.h = img.height;

    this.visible = true;

    this.think = function(){};
    this.draw = function(){
        $$.context.drawImage(
            img, x, y
        );
    };
}

RenderImage.prototype = RenderThing.prototype;