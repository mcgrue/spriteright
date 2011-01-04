var $$ = null;



/// TODO: finishInit() should not take care of loading game assets.
/// That should be passed into loadGameAssetsFunc().
/// There should also be a startGameFunc passed in here too, but right now it's all muddled.

function Engine( canvas_node, width, height, scale, loadGameAssetsFunc ) {
    $$ = this;    

    this.screen = {
        width : width,
        height : height
    };

    this.scale = scale;

    this.camera = {x:1015, y:1015};

    this.targetFPS = 60;

    this.canvas = canvas_node;
    this.context = this.canvas.getContext('2d');

    this.visualLoader = new PrettyLoader();

    this.assets = new Assets(
        loadGameAssetsFunc,
        function() { $$.finishInit(); }
    );
    this.assets.init();
        
    this.map_scripts = {};

    //this._debug_showthings = false;

    //set the proportions
    this.canvas.style.width = this.screen.width * this.scale;
    this.canvas.style.height = this.screen.height * this.scale;
    this.canvas.width = this.screen.width * this.scale;
    this.canvas.height = this.screen.height * this.scale;
    
    this.rendering = false;
    
    this.tickTime = false;
    this._prevStart = false;
    this._timeEnd = false;

    this._intervals = [];
    this.flags = {}

    this.renderstack = [];
}

Engine.prototype = {

    _soundmanagerInit : function() {
        soundManager.url = 'engine/soundmanager/swf/';
        soundManager.flashVersion = 9; // optional: shiny features (default = 8)
        soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
        soundManager.debugMode = false;
        // enable HTML5 audio support, if you're feeling adventurous. iPad/iPhone will always get this.
        // soundManager.useHTML5Audio = true;
        soundManager.onready(function() {
        
          if( window.location.href == 'http://localhost/js-verge/' ) return; //I don't want to hear it every time I debug...
          
          if (soundManager.supported()) {
                soundManager.createSound({
                  id: 'mySound',
                  url: 'game/mp3/Hymn_to_Aurora_(NES_Cover)_www.dwedit.org.mp3',
                  autoLoad: true,
                  autoPlay: true,
                  onload: function() {
                    if($$){
                        $$.log('The sound '+this.sID+' loaded!');
                    }
                  },
                  volume: 20
                });
          } else {
                $$.log('The sound failed to play. :(');
          }
        });
    },

    ///
    /// TODO: clean this shit up.  This is all game init code, not engine-init code!
    finishInit : function() {

        try {
            this.game = new Game();
        } catch(e) {
            throw "Problem initializing game.  Was a Game object defined on this pageload?";    
        }

        this._soundmanagerInit();
        
        this.renderstack.push(
            new McGrender('main')
        );
        
        this.keys = new Keys();
        
        this.hero = false;
        
        $$.tickTime = get_time(); //starting time.
        
        /// This is sorta game-specific code
        /// needs to be pulled out of the engine.
        
        var mapdata = $$.assets.get('paradise_isle2.json');
        var tileset = $$.assets.get('tropic2.vsp');
        
        vsp = {
            image: tileset,
            tile: {w:16, h:16}
        };
        
        $$.map = new Map(mapdata, vsp);
        var layer_bg  = $$.renderstack[0].addLayer('map_bg', true);
        var layer_ent  = $$.renderstack[0].addLayer('entities', true);
        var layer_fg = $$.renderstack[0].addLayer('map_fg', true);
        var layer_ui  = $$.renderstack[0].addLayer('ui_elements', true);
try {
        var clearbox = new RenderThing(
            0, 0,
            320, 240, 
            function() {
                fill_rect( 0,0,320,240, '#000000' );
            }
        );
        
        $$.renderstack[0].add(layer_bg, clearbox);
        
        var bg = [];
        var fg = [];
        var eLayer = false;

        for( var i = 0; i<mapdata.layer_render_order.length; i++ ) {
            var n = mapdata.layer_render_order[i];
            if( !eLayer ) {
                if( is_int(n) ) {
                    bg.push(n);
                } else if( n == 'E' ) {
                    eLayer = true;
                } else {
                    // 'R' used to represent a rendering layer.
                    // throw 'unknown renderstring token: ('+n+')';
                }
            } else {
                if( is_int(n) ) {
                    fg.push(n);
                } else if( n == 'E' ) {
                    // throw 'Why would there be two entity layers?';
                } else {
                    // throw 'unknown renderstring token: ('+n+')';
                }
            }
        }

        if( bg.length ) {
            $$.renderstack[0].add(
                layer_bg, {
                    render: function() {
                        $$.map.render(bg);
                    }
                }
            );
        }

        if( fg.length ) {
            $$.renderstack[0].add(
                layer_fg, {
                    render: function() {
                        $$.map.render(fg);
                    }
                }
            );
        }
        
        txt = new Text(
            10, 10,
            "Hello.", {
                beforeRender : function(obj) {
                    obj.text = 'FPS: ' + $$._fps;
                }
            }
        );
        $$.renderstack[0].add(layer_ui, txt);
        
        txt = new Text(
            10, 26,
            "Hello.", {
                beforeRender : function(obj) {
                    tx = parseInt($$.hero.x/16);
                    ty = parseInt($$.hero.y/16)+1;
                    obj.text = 'Coords: ('+$$.camera.x+','+$$.camera.y+') ('+tx+','+ty+')';
                }
            }
        );
        $$.renderstack[0].add(layer_ui, txt);
        
        txt = new Text(
            10, 42,
            "Hello.", {
                beforeRender : function(obj) {
                    if( $$._debug_showthings ) {
                        obj.text = '[debug mode, obs showing]';
                    } else {
                        obj.text = '';
                    }   
                }
            }
        );
        $$.renderstack[0].add(layer_ui, txt);
        
        var hero_data = $$.assets.get( 'darin.json.chr' );
        var hero_img = $$.assets.get( 'darin.chr' );
        var sprite = new MapAnimation( 300, 300, hero_img, hero_data );
        $$.renderstack[0].add( layer_ent, sprite );
        
        $$.hero = sprite;
        $$.hero.setState( 'down_walk' );
        
        var menu = new RenderThing(
            0, 10,
            50, 50,
            function() {
                draw_menu_box(this);
                $$.context.fillStyle    = 'white';
                $$.context.font         = '10px Arial';
                $$.context.textBaseline = 'top';
                $$.context.fillText( 'MENU', this.x+5, this.y+5);
                $$.context.fillText( 'ITEM', this.x+5, this.y+15);
                $$.context.fillText( 'LOL', this.x+5, this.y+25);
                $$.context.fillText( 'BUTTS', this.x+5, this.y+35);
            }
        );
        
        menu.color = '#000099';
        menu.move({
            x : -50,
            y : 10,
            time : 50
        });
        
        var textBox = new TextBox();

        $$.menubox = menu;
        $$.textBox = textBox;
        
        $$.renderstack[0].add(layer_ui, menu);
        $$.renderstack[0].add(layer_ui, textBox);
} catch(e) {
    alert('ERR: ' + e);
}
        $$.onComplete();
    },

    onComplete : function() {
        this.setRenderInterval(this.targetFPS);
        this.render();
    },

    isOnScreen: function( x, y, w, h ) {
        return overlap( x, y, w, h, $$.camera.x, $$.camera.y, $$.screen.width, $$.screen.height );
    },

    log: function(msg) {
        old = $('#log').val();

        if( old.length > 10000 ) {
            old = '';
        }

        $('#log').val( msg + "\n" + old );
    },
    
    setRenderInterval : function(targetFps) {
        this.targetFPS = targetFps;
        this.intervalMS = parseInt(1000/this.targetFPS);
        
        var i = window.setInterval($$.render, this.intervalMS);
        this._intervals.push(i);
    },
    
    killIntervals : function() {
        for( var i = 0; i<this._intervals.length; i++ ) {
            window.clearInterval(this._intervals[i]);
        }

        this._intervals = [];
    },



    render : function() {
        try {
            if( $$.rendering ) {
                return;
            }
             
$$.game.updateControls();
$$.game.doCameraFollow();
             
            $$.rendering = true;

            $$.tickTime = get_time();
            
            for( var i = 0; i<$$.renderstack.length; i++ ) {
                $$.renderstack[i].render();
            }

            $$._timeEnd = get_time();
            $$.rendering = false;
            $$._fps = Math.floor(1000/($$.tickTime-$$._prevStart));
        
            $$._prevStart = $$.tickTime;
            
        } catch(e) {
            $$.killIntervals();
            throw e;
        }
    }
}