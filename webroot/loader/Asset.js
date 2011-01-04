
function Assets( loadAssets, onComplete ) {
    this.assets = {};
    this.loadedAssets = 0;
    this.assetCount = 0;

    this.onComplete = onComplete;
    this.loadAssets = loadAssets;
}

Assets.prototype = {
	Graphic: function(url, id) {
		if(this.assets[id]) throw "Tried to load a Graphic that was already loaded (id: '+id+')";
		
		//load the asset
		var a = new Image();
		a.src = url;
		a.onload = function() { $$.assets.stepLoading(); }

		this.assets[id] = {
            src : url,
            type : 'graphic',
            loaded : true,
            asset : a
        };
        this.assetCount ++;
	},

    Json: function(url, id) {
        if(this.assets[id]) throw "Tried to load a Json that was already loaded (id: '+id+')";
        
		this.assets[id] = {
            src : url,
            type : 'json',
            loaded : false,
            asset : null
        };

        $.ajax({
            url: url,
            async : false,
            success: function(data) {
                eval( 'this.assets[id].asset = ' + data );
                this.assets[id].loaded = true;
                $$.assets.stepLoading();
            },
            context: this
        });

        this.assetCount ++;
    },

	Script: function(script, id) {
        if(this.assets[id]) throw 'Tried to load a Script that was already loaded (id: '+id+')';
        
		this.assets[id] = {
            src : script,
            type : 'script',
            loaded : false,
            asset : null
        };
        this.assetCount ++;
	},

    /// sloppy.
    init : function() {
        // load the engine.
        this.loadGameEngine();
    
        // load the game-specific assets.
        this.loadAssets(this);

        this.startLoading();
    },

	startLoading: function() {
		//if there's nothing to load, end loading
		if(this.assetCount == 0) {
			this.endLoading();
			return;
		}
		
		this.stepScriptLoading();
	},

	stepLoading: function() {
		//increase assets loading, update loader
		this.loadedAssets ++;
		$$.visualLoader.update( this.loadedAssets/this.assetCount );
		
		//end loading if all assets loaded
		if(this.loadedAssets == this.assetCount) {
			this.endLoading();
			return;
		}
	},

	//this function is for loading scripts
	stepScriptLoading: function() {		
		
		//update loader
		$$.visualLoader.update( this.loadedAssets/this.assetCount );
		
		if( this.loadedAssets == this.assetCount ) {
			this.endLoading();
			return;
		}
		
		//load the next file
		for( var id in this.assets ) {
			if( !this.assets[id].loaded && this.assets[id].type == 'script' ) {
				var head = document.getElementsByTagName('head')[0];
				var src = document.createElement('script');

				src.type = 'text/javascript';
				src.src = this.assets[id].src;
				src.charset = "utf-8";
				src.async = true;
				src.onload = function() { $$.assets.stepScriptLoading(); }

				head.appendChild(src);

				this.assets[id].asset = src;
				this.assets[id].loaded = true;
				
                this.loadedAssets ++;

				break;
			}
		}
	},
	
	endLoading: function() {
		this.onComplete();
	},

	get: function(id) {
		if( this.assets[id] && this.assets[id].asset ) {
            return this.assets[id].asset;
        }

        if( !this.assets[id].loaded ) throw "asset '"+id+"' not yet loaded.";

        throw "asset '"+id+"' not found.";
	},

    loadGameEngine : function() {
        this.Script('engine/Text.js', 'engine/Text.js');
        this.Script('engine/MapImage.js', 'engine/MapImage.js');
        this.Script('engine/MapAnimation.js', 'engine/MapAnimation.js');
        this.Script('engine/Map.js', 'engine/Map.js');
        this.Script('engine/RenderThing.js', 'engine/RenderThing.js');
        this.Script('engine/McGrender.js', 'engine/McGrender.js');
        this.Script('engine/Keys.js', 'engine/Keys.js');
        this.Script('engine/soundmanager/soundmanager2-jsmin.js', 'engine/soundmanager/soundmanager2-jsmin.js');
    }
};