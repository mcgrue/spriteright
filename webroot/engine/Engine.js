var $$ = null;

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

    finishInit : function() {

        try {
            this.game = new Game();
        } catch(e) {
            throw "Problem initializing game.  Was a Game object defined on this pageload?";    
        }

        this._soundmanagerInit();

        this.game.startup();        

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
             
            $$.rendering = true;
             
            $$.tickTime = get_time();
             
            $$.game.beforeRender();
            
            for( var i = 0; i<$$.renderstack.length; i++ ) {
                $$.renderstack[i].render();
            }
             
            $$.game.afterRender();
             
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