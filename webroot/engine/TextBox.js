
function TextBox() {

    this.rt = new RenderThing(
        10, 180,
        300, 50,
        this._draw
    );

    this.rt.color = '#000099';

    this.conversation = [
        [1,'Who are you and why have you come', 'to this land of wonder?'],
        [6,'Mwahaha!!', ''],
        [6,'See?', 'Mine is an EVIL laugh!'],
        [7,'...', ''],
        [7,'...', '...no refunds.'],
    ];

    this.conversation_index = 0;
    this.visible = false;
    this.onComplete = false;
}

TextBox.prototype = {

    advanceConversation : function() {
        if( this.conversation_index + 1 < this.conversation.length ) {
            this.conversation_index ++;
        } else {
            this.visible = false;
            
            if( this.onComplete ) {
                var prev = this.onComplete;
                
                this.onComplete();
                
                if( this.onComplete == prev ) {
                    this.onComplete = false;
                }
            }
        }
    },

    talk : function( conversationArray ) {
        this.conversation = conversationArray;
        this.conversation_index = 0;
        this.visible = true;
    },

    render : function() {
        if( ! this.visible ) {
            return;
        }

        this.rt.render();

        if( !this.img ) {
            this.img = $$.assets.get('speech.png');
        }

        draw_menu_box(this.rt);
        $$.context.fillStyle    = 'white';
        $$.context.font         = 'bold 16px Arial';
        $$.context.textBaseline = 'top';

        var cIdx = this.conversation_index;

        $$.context.fillText( this.conversation[cIdx][1] , this.rt.x+8, this.rt.y+8);
        if( this.conversation[cIdx][2] ) {
            $$.context.fillText( this.conversation[cIdx][2], this.rt.x+8, this.rt.y+26);
        }

        var speech_idx = this.conversation[cIdx][0];    

        $$.context.drawImage(
            this.img,  0, speech_idx*32,
            32, 32,
            this.rt.x, this.rt.y - 34,
            32,32
        );
    }
}

/*
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
*/