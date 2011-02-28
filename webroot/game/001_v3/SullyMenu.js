

function spawn_top_level_menu() {

    var m = 
        new RenderThing(
            0, 10,
            60, 60,
            draw_top_level_menu
        );
        
    m.cursor = 0;
    m.itemCount = 5;

    m.color = '#000099';
    m.move({
        x : -60,
        y : 10,
        time : 50
    });

    m.doControl = control_top_level_menu;

    return m;
}

function draw_top_level_menu() {

    draw_menu_box(this);

    $$.context.fillStyle    = 'white';
    $$.context.font         = '10px Arial';
    $$.context.textBaseline = 'top';
    $$.context.fillText( 'ITEMS', this.x+15, this.y+5);
    $$.context.fillText( 'EQUIP', this.x+15, this.y+15);
    $$.context.fillText( 'STATUS', this.x+15, this.y+25);
    $$.context.fillText( 'DATA', this.x+15, this.y+35);
    $$.context.fillText( 'ABOUT', this.x+15, this.y+45);

    $$.context.fillText( '>', this.x+5, this.y+5+(10*this.cursor) );
}

function control_top_level_menu(m) {
    var k = $$.keys;

    if( k.isUpPressed() ) {
        k.releaseUp();
        this.cursor--;
        if( this.cursor < 0 ) {
            this.cursor = this.itemCount -1;
        }
    } else if( k.isDownPressed() ) {
        k.releaseDown();
        this.cursor++;
        if( this.cursor >= this.itemCount ) {
            this.cursor = 0;
        }
    }
}

var SullyMenu = function() {
    this.menuStack = [];
    this.menuStack.push( spawn_top_level_menu() );
}

SullyMenu.prototype = {

    /** From RendertThing **/
    move : function(data) {
        for( var m in this.menuStack ) { this.menuStack[m].move(data); }
    }, 
    doMove : function() { 
        for( var m in this.menuStack ) { this.menuStack[m].doMove(); }
    },
    shouldBeDrawn : function() { 
        for( var m in this.menuStack ) { this.menuStack[m].shouldBeDrawn(); }
    },
    render : function() { 
        for( var m in this.menuStack ) { this.menuStack[m].render(); }
    },

    /** Menu stuff **/
    inMenu : function() {
        return this.menuStack.length > 1 || $$._menu_direction
    },
    doControl : function() { 
        this.menuStack[this.menuStack.length-1].doControl();            
    }
}
