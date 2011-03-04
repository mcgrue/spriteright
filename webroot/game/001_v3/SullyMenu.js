
var menu_stub = function() {}

var my_menu = [
    ['ITEMS', menu_stub, menu_stub],
    ['EQUIP', menu_stub, menu_stub],
    ['STATUS', menu_stub, menu_stub],
    ['DATA', menu_stub, menu_stub],
    ['ABOUT', menu_stub, menu_stub],
];

function spawn_big_menu( draw_function, control_function ) {

    var m = 
        new RenderThing(
            0, 10,
            60, 60,
            data[1]
        );
        
    m.name = data[0];

    m.color = '#000099';
    m.move({
        x : -60,
        y : 10,
        time : 50
    });

    m.doControl = data[2];

    return m;

}

function summon_top_level_menu() {

    $$._menu_direction = !$$._menu_direction;

    $$.menubox.move({
        x : (!$$._menu_direction? -60 : 250),
        y : 10,
        time : 200
    });
}

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
    $$.context.font         = '8px "04b08Regular"';
    $$.context.textBaseline = 'top';

    for( var i=0; i<my_menu.length; i++ ) {
        var name = my_menu[i][0];
        $$.context.fillText( name, this.x+15, this.y+5+i*10);
    }

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

    if( k.isActionButtonPressed() ) {
        k.releaseActionButton();

    } else if( k.isCancelButtonPressed() ) {
        k.releaseCancelButton();
    
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
