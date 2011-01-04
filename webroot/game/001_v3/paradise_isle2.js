
$$.map_scripts['paradise_isle2'] = {
    sully : function() {

        if( !$$.flags['SULLY'] ) {
            $$.textBox.talk([
                [1,'Hey Sully.', ''],
                [7,'Hey Darin.', ''],
                [7,"We're on the World Wide Internets","now."],
                [7,'...Welcome to...', ''],
                [7,'', '...THE FUTURE!'],
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
                [7, '"when a girl walks in with an itty-bitty','waist and a round thing in your face'],
                [7, 'you get sprung."'],
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
};

