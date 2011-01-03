function PrettyLoader() {}

PrettyLoader.prototype = {
	update: function(percent) {
		$$.context.fillStyle = "#000";
		$$.context.fillRect(0, 0, $$.screen.width, $$.screen.height);

        $$.context.fillStyle    = '#dddd00';
        $$.context.font         = 'bold 26px Arial';
		$$.context.fillText("Loading ... ["+parseInt(percent*100)+"%]", 25, 210);

        $$.context.fillStyle    = '#00dd00';
        $$.context.fillText("V", 275, 45);

        $$.context.font = 'bold 18px Arial';
        $$.context.fillText("js", 263, 45);	
	}
}