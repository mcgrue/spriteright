
function Text( x, y, text, kwargs ) {
    if(!kwargs) {
        kwargs = {}
    }

    this.text = text;
    this.x = x;
    this.y = y;
    
    if( kwargs.fontface ) {
        this.fontface = kwargs.fontface;
    } else {
        this.fontface = 'Arial';
    }

    if( kwargs.size ) {
        this.size = kwargs.size;
    } else {
        this.size = 12;
    }

    if( kwargs.color ) {
        this.color = kwargs.color;
    } else {
        this.color = 'white';
    }

    if( kwargs.style ) {
        this.style = kwargs.style + ' ';
    } else {
        this.style = '';
    }

    if( kwargs.beforeRender ) {
        this.beforeRender = kwargs.beforeRender;
    } else {
        this.beforeRender = false;
    }

    this.fontline = this.style + this.size + 'px '+ this.fontface;
}

Text.prototype = {
    render: function() {
        if( this.beforeRender )  {
            this.beforeRender(this);
        }
         
        $$.context.fillStyle    = this.color;
        $$.context.font         = this.fontline;
        $$.context.textBaseline = 'top';
        $$.context.fillText  (this.text, this.x, this.y);
    },
}

