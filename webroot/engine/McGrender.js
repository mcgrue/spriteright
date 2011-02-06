
function McGrender(name) {
    if( !name ) {
        throw "RenderEngines must be named.";
    }

    this.name = name;
    this.layers = [];
}

McGrender.prototype = {
    addLayer : function( kwargs ) {
         
        if( !kwargs.name ) {
            throw "Layers must be named.";
        }
         
        var contents = [];
        if( kwargs.contents ) {
            contents = kwargs.contents;
        }
         
        var visible = !!(kwargs.visible);
         
        var can_lucent = true;
        if( kwargs.can_lucent === false ) {
            can_lucent = false;
        }

        this.layers.push({
            'name' : kwargs.name,
            'visible' : visible,
            'contents' : contents,
            'can_lucent' : can_lucent
        });

        return this.layers.length - 1;
    },
    
    assertLayer : function( layer ) {
        layer = parseInt(layer);
        if( layer < 0 || layer >= this.layers.length ) {
            throw "invalid layer index: " + layer;
        }
        return layer;
    },

    add : function( layer, obj ) {
        layer = this.assertLayer(layer);

        if( !obj.render ) {
            throw "tried to add an object that doesn't know how to render itself to the McGrender stack.";
        }

        this.layers[layer].contents.push(obj);
    },

    clear : function( layer ) {
        this.layers[layer].contents = [];
    },

    remove : function( layer, obj ) {
        layer = this.assertLayer(layer);

        for( var o in this.layers[layer].contents ) {
            if( o == obj ) {
// let's kick that bitch out of bed!
debugger;
            }
        }
    },

    render : function() {
        for( var i=0; i<this.layers.length; i++ ) {
            if( !this.layers[i].visible ) {
                continue;
            }
                
            if( this.layers[i].can_lucent && $$.lucent_percent < 100 ) {
                $$.context.globalAlpha = 1 - ((100-$$.lucent_percent) / 100); // rendermode at opacity X
            } else {
                $$.context.globalAlpha = 1; // rendermode normal
            }
            
            for( var j=0; j<this.layers[i].contents.length; j++ ) {
                this.layers[i].contents[j].render();
            }
        }
    }
}

