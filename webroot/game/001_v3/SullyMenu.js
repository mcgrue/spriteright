

function spawn_top_level_menu() {

    var m = 
        new RenderThing(
            0, 10,
            60, 60,
            function() {
                draw_menu_box(this);
                $$.context.fillStyle    = 'white';
                $$.context.font         = '10px Arial';
                $$.context.textBaseline = 'top';
                $$.context.fillText( 'ITEMS', this.x+15, this.y+5);
                $$.context.fillText( 'EQUIP', this.x+15, this.y+15);
                $$.context.fillText( 'STATUS', this.x+15, this.y+25);
                $$.context.fillText( 'DATA', this.x+15, this.y+35);
                $$.context.fillText( 'ABOUT', this.x+15, this.y+45);
            }
        );
        

    m.color = '#000099';
    m.move({
        x : -60,
        y : 10,
        time : 50
    });

    return m;
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
