
$$.map_scripts['paradise_isle2'] = {

    initmap : function() {
        $$.map.setObstructionTile(11, 55, 3);
        $$.map.setObstructionTile(9, 55, 4);

        $$.map.setObstructionTile(98, 13, 3);
        $$.map.setObstructionTile(100,13, 4);

        $$.log( 'paradise isle maps autoexec was called.' );

        if( $$.flags['F_CRYS_JOIN'] ) {
            //move the map-crystal off the map
            $$.map.map.entities[0].x = -100;
            $$.map.map.entities[0].y = -100;
            $$.map.map.entities[0].sprite.x = -100;
            $$.map.map.entities[0].sprite.y = -100;
        }
    },

    crystal_event : function() {

        $$.game.fade(1000, 0, '#000000', function() {
             
            var img = $$.assets.get( 'cryssand.gif' );
            $$.game.drawImage( img, 158,20 );
             
            $$.textBox.talk([
                [4, 'Darin.... Hello. How are you today? I', 'needed to talk to you about'],
                [4, 'something...', ''],
                [4, "I... I've been thinking and I've decided", "we need to leave Paradise Island."],
                [1, "But Crystal!", "What's wrong?"],
                [1, "I kinda like this blue lagoon","thing we have going on."],
                [4, "No... it has to be this way. We'll go", "insane if we don't have some"],
                [4, "adventure soon!"],
                [1, "I suppose you're right. I'd like to go", "exploring some caves and stuff."],
            ]);    
    
            $$.textBox.onComplete = function() {
                $$.game.clearAllImages();
                
                $$.game.fade(1000, 100, '#000000', function() {
                    
                    $$.textBox.talk([
                        [4, "I'm glad you understand. I suppose","we can use the undersea passage."],
                        [4, "Let's go!", ""],
                    ]);
        
                    $$.textBox.onComplete = function() {
                        $$.map.map.entities[0].x = -100;
                        $$.map.map.entities[0].y = -100;
                        $$.map.map.entities[0].sprite.x = -100;
                        $$.map.map.entities[0].sprite.y = -100;
                        $$.flags['F_CRYS_JOIN'] = 1;
                    }
                });
            }
        });
    },

    sully : function() {

        if( !$$.flags['SULLY'] ) {
            $$.textBox.talk([
                [1,'Hey Sully.', ''],
                [7,'Hey Darin.', ''],
                [7,"We're on the World Wide Internets","now."],
                [7,'...Welcome to...', ''],
                [7,'', '...THE FUTURE...'],
                [7,'','','...OF TOMORROW!'],
                [1,'There sure is a lot of porn in ', 'the future!'],
                [7,'I know...', '...I know.'],
            ]);
            
            $$.flags['SULLY'] = 1;
            
        } else if( $$.flags['SULLY'] == 1 ) {
            $$.textBox.talk([
                [1, "So what's new this build?"],
                [7, 'Well, grue added adjacent activation.', 'And then he made a textbox!'],
                [7, 'Now we can say pithy things!'],
                [1, '"Beauty in things exists in the mind',  'which contemplates them."'],
                [7, 'Ah, David Hume.  Quite pithy, that.', 'This is my favorite:'],
                [7, '"when a girl walks in with an itty-bitty','waist and a round thing in your face', 'you get sprung."'],
                [1, 'The noble sir Mix-a-lot.',"Didn't he invent pithiness?"],
                [7, 'Yeah.', "That's how he got knighted."],
                [1, "Ooooh..."]
            ]);

            $$.flags['SULLY'] = 2;
        } else {
            $$.textBox.talk([
                [7, "I don't have much else to say","right now."],
            ]);
        }
    },
    sancho : function() {

        if( !$$.flags['SANCHO'] ) {
            $$.flags['SANCHO'] = 1;

            $$.textBox.talk([
                [13,'My name is Sancho.', ''],
                [13,'I am a sad octopus.', ''],    
                [1,'Hello, Sancho!', ''],
                [13,'(sigh)'],
                [13, '...', '...Hi.'],
            ]);
        } else if( $$.flags['SANCHO'] < 3 ) {
            var howSad = 'sad';
            for( var i=0; i<$$.flags['SANCHO']; i++ ) {
                howSad = howSad + ', sad';
            }
             
            $$.textBox.talk([
                [13,'I am a '+howSad+' octopus.', ''],
            ]);
             
            $$.flags['SANCHO']++;
        } else {
            $$.textBox.talk([
                [13,'I am a sad, sad, sad, sad octopus.', ''],
                [1,'That is quite sad.', ''],
                [13,'I know.', ''],
            ]);
        }
    },

    // passage to the undersea cavern
    undersea : function() {
        $$.log('changemap to undersea cavern here.');
        $$.game.loadMap('underwater.json', 30, 10);
    },
    
    enter_house : function() {
        Warp(99,12, Transition.NONE);
        $$.log('move hero to inside house here.');
    },

    exit_house : function() {
        Warp(10,55, Transition.NONE);
        $$.log('move hero to outside house here.');
    },
    
    pearl_cave : function() {
        $$.log('Pearl Cave entrance.');

        //AlterFTile(59,17,663,0);
        //AlterFTile(60,17,664,0);
        //SetTile(59,16,2,643);
        //SetTile(60,16,2,644);
    },
    
    chest_a : function()  {
        $$.textBox.talk([
            [1,'Mmmmph!'],
            [1,"...it's locked."]
        ]);
    },
    
    girlfriend_check : function()  {
        if( !$$.flags['F_CRYS_JOIN'] ) {
            $$.textBox.talk([
                [1,'Hrm... Crystal might get suspicious', 'if I sneak off the island without her...'],
                [1,'...again.']
            ]);
        }
    },
    
    normal_tree : function()  {
        $$.textBox.talk([
            [1,'This is a normal tree.', 'It has to work twice as hard as'],
            [1,'a palm tree for half the recognition.']
        ]);
    },
    
    SaveDisable : function()  {
$$.log('SaveDisable... hm, we need a place for global gamescripts, and a way to specify them in zones.');
    },
    
    SaveEnable : function() {
$$.log('SaveDisable... hm, we need a place for global gamescripts, and a way to specify them in zones.');    
    }
};
