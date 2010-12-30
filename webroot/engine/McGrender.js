
function McGrender(name) {
    if( !name ) {
        throw "RenderEngines must be named.";
    }

    this.name = name;
    this.layers = [];
    this._currentLayer = false;
}

McGrender.prototype = {
    addLayer : function( name, visible, contents ) {
        
        if( !name ) {
            throw "Layers must be named.";
        }
         
        if(!contents) {
            contents = [];
        }
         
        this.layers.push({
            'name' : name,
            'visible' : visible,
            'contents' : contents
        });

        return this.layers.length - 1;
    },

    setActiveLayer : function(i) {
        i = parseInt(i);
        if( i < 0 || i >= this.layers.length ) {
            throw "invalid layer index: " + i;
        }

        this._currentLayer = i;
    },
    
    add : function( obj ) {
        if( !obj.render ) {
            throw "tried to add an object that doesn't know how to render itself to the McGrender stack.";
        }

        if( this._currentLayer === false ) {
            throw "no active layer.";
        }

        this.layers[this._currentLayer].contents.push(obj);
    },

    render : function() {
        for( var i=0; i<this.layers.length; i++ ) {
            if( !this.layers[i].visible ) {
                continue;
            }
            
            for( var j=0; j<this.layers[i].contents.length; j++ ) {
                this.layers[i].contents[j].render();
            }
        }
    }
}

