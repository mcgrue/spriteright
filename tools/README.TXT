
	Welcome to VERGE 3.2! 
		(README.TXT, 2009-08-01 edition of v3)


********************************************************************************


This is just a simple zip of a public alpha version of the engine. Verge is in
a constant state of flux and development; we try to make these releases as
stable as possible but we can't promise anything. Remember to check back at
http://www.verge-rpg.com/ every now and then for news about the engine, new
games, competitions and contests, and general chit-chat on the forums.

Please note that more thorough documentation is now available at the website, 
and is community-maintained.  The verge-rpg.com forums are always at your
disposal as well. The online documentation can be found at

	http://www.verge-rpg.com/docs/

To see examples of this very engine in games, go visit:

	http://verge-rpg.com/files/

and check out the v3 demos section.  You can currently find a wide selection 
of demos with example source code.  However, none of them is exactly a 
'tutorial'.

We fully admit that Verge is a little rough around the edges, especially for
those who aren't yet programmers. Some heroic members of the community are
currently working on tutorials for the masses but, like everything else around
here, these are currently in the works and unfinished. If you do manage to wind
your way along the path of infinite frustration and manage to make something
with what is provided in this zip, then you have balls (or ovaries) of steel
and will win some modicum of respect. Just make sure you tell us about it!  

Anyways, here's a very, *very* basic rundown of the files for a starting point:


********************************************************************************


	Every EXE here is in late alpha/early beta state. Your feedback is important 
	and will shape how these tools develop. The best way to leave feedback is on 
	the discussion forums at http://www.verge-rpg.com. Whether reporting bugs or 
	requesting features, being as specific as possible will increase the chances 
	that we will fix/implement it in a timely manner.


********************************************************************************


VERGE.EXE is the engine file.  It runs your game and compiles your VergeC code.  
	Whenever you want to test or play your game, you run this.

SYSTEM.VC is a required VergeC file.  VergeC (pronounced VURJ-SEE) is the 
	scripting language of VERGE.  You can (and should) have many, many .VC files 
	in a game, but SYSTEM.VC is the only required one.

	Of special note in SYSTEM.VC is that you must have a function with the 
	signature of:

		void autoexec() 

	This is the entry point to your game.  When you run the game, this is the 
	first thing that happens, so you should branch your code out from there.
	
SYSTEM.LUA is a required Lua file. Lua is a scripting language more recently 
	added to Verge, and you may find it more to your liking than VergeC.  Just 
	like in SYSTEM.VC, you must have a function with the signature:
	
		function autoexec()
	
	This is the entry point to your game.
	
	If you plan to use Lua, please check out LuaVerge.txt for some quick points
	of interest and notes.
	
	Note that you need _one of_ SYSTEM.LUA or SYSTEM.VC, not necessarily both. 
	Which Verge will ultimately use is controlled in VERGE.CFG via the "lua" 
	flag.

VERGE.CFG is a configuration file.  It tells the engine special things like 
	what size to make the main game window, and various other things.  If you're 
	a beginner, just ignore this for now.  If your curiosity is insatiable, go 
	to: http://www.verge-rpg.com/boards/help/ and ask.

V3.LOG is a logfile that's recreated everytime you run VERGE.EXE.  Inside you 
	will find the compilation report, the error messages, any user-definied 
	log() calls, and the quit message.  It is *invaluable* to debugging.

SYSTEM.XVC is a file that's created after the first time you compile code when 
	in VergeC mode.  It stores the compiled code, and it's possible to run a 
	game from just this file.  If you have "releasemode" set to 1 in VERGE.CFG, 
	this will be used instead of recompiling the VergeC code.

	Everytime the code is recompiled, this file is remade to reflect those 
	changes.


FMOD.DLL is a system file that VERGE needs for it's music and sound playing 
	capabilities.  As long as it's in the same directory as VERGE.EXE, everything
	is fine.  Sure, you could put it in your windows system folder, but other 
	people downloading your game may not have been so wise.  For simplicities' 
	sake, just keep it with VERGE.EXE and ignore it.

README.TXT is this file.  Whenever you release a game, you should, as a matter 
	of good form, make your own README.TXT and explain stuff that needs 
	explaining about your game.

V3VERGEC.TXT contains a very simple listing of currently implemented VergeC 
	functions and variable builtins. More thorough documentation is available
	at http://www.verge-rpg.com/docs/

V3RELEASE.TXT is the latest release notes for the engine.


********************************************************************************


The following will all be found in the /tools folder (Windows only right now):


PACKED.EXE is the packfile editor. It requires the .NET framework 1.1.
	Packfiles let you package a bunch of files up together into a single lump,
	for distribution purposes.

MAPED.EXE is the executable for MapEd 3, the Verge3 map file editor. It also 
	requires the .NET framework 1.1.

CHRMAK5.EXE is the CHR file utility. It is a command line tool and doesn't 
	require any special libraries. DARIN.GIF and DARIN.MAK are example files.

All other *.DLL files are used by the tools (packed.exe and maped.exe) and not 
	by the engine. These are not required in your distribution zip. In fact,
	assuming you don't keep anything (maps, etc.) in there, you can leave the
	tools directory out of the distribution entirely. 
        

********************************************************************************


EXTREMELY BRIEF MAPED DOCUMENTATION:

The "tools" icons are all fairly self-explanitory, except for the two on the 
bottom.  The bottom left is the copy/paste tool.  To use it, select this tool 
and hold down the shift button, drag a rectangle, and release to copy a single-
layer region.  Then click to paste the region.

To use multi-layer copy (will copy all layers including obstructions and 
zones), hold CTRL+SHIFT to copy, and CTRL+CLICK to paste.

The tool on the bottom right is supposed to be the "run map" tool, which is 
supposed to spawn the engine.  It theoretically works, but not really.  Both 
the engine and maped need small tweaks for it to work right.  Maybe in the next 
build, if you bug me and tat about it!

The Tile Editor is for all intents and purposes not in yet.  Having this thing 
publicly released means all of you can pressure tatsumi to finish it, instead 
of just me!  Instead, use the import/export tools to copy your tileset to the 
clipboard, where you can use a program like photoshop or paint shop pro to edit 
them.

Maped2 maps can be loaded natively - saving them afterwards will save them as 
V3 maps. V1 maps cannot be loaded directly at this time, so to convert a V1 map
you would want to load it in maped2 and save it to convert to V2 format, then 
load in maped3 and save it to save V3 format.

Another quick note is that, in certain circumstances, the "Save" command 
doesn't actually work. On the other hand, "Save As" ALWAYS does. Hopefully this
will eventually be fixed. 


********************************************************************************


A BRIEF DESCRIPTION OF V3 "MAP VC":

Both V1 and V2 used numbered events for map scripts. V3 breaks this tradition 
and uses named scripts for V3.

If you have a map named ISLAND.MAP, then the file ISLAND.VC will be associated
with it as its VC script.  It will be compiled at runtime, as system.vc is, 
unless the releasemode option is enabled. As with V1 and V2, the compiled VC 
code gets embedded into the .MAP file, while compiled system.vc code goes to 
system.xvc.

Map VC files in V3 are like system.vc - you can declare functions that take 
arguments, return values, declare local variables, etc.  With two big 
differences: 
	1) The namespace associated with the MAP VC file only exists when that map 
	   is loaded.
	2) You cannot declare "global" variables in a Map VC file.

Rule #2 is really an extension of the first rule - we dont really want people 
allocating resources with those global variables, and then they would cease to 
exist when the map was changed, resulting in leaked resources.

So, system.vc code and variables are always globally visible. Map VC code is 
only visible when that map is loaded.

If you have Foo() in system.vc, then trying to declare a Foo() in island.vc 
would generate an error.

However, you can have Crap() in island.vc and Crap() in mountain.vc - because 
each function only exists when the respective map is loaded.

From Crap(), you can call Foo() directly. If you have Crap2() also in 
island.vc, then you can call Crap() from Crap2() or vice versa. However, you 
cannot DIRECTLY call map vc scripts from inside a system vc function, because 
it may or may not exist at runtime, the function cannot be definitively 
resolved at compile time. However, you CAN do CallFunction("crap") from inside
system vc code, and if island.map is loaded when it gets called, then it's 
Foo() function will be executed.

So, when you see a "script" or "event" field in maped, it takes a string. You 
put in the name of the function you wish to call - that function can be in 
either system.vc or the map.vc file.

That function must not take any arguements, however.

That basically summarizes the differences between V2 map vc and V3 map vc. For 
examples, see the sully demo zip (which is also way-alpha).


NOTES ABOUT MAP EVENTS IN LUAVERGE:

LuaVerge treats map scripts in basically the same way as VergeC mode, with a 
few special gotchas:

 - If you define a function with a name that already exists, the old function 
 	is overwritten, without warning.  So if, in system.lua you have Foo() and 
	then in island.lua you declare a new Foo(), island.lua's Foo() will override
	the global one.  Also, the functions declared therein are loaded right into 
	the global namespace, and are not unloaded, so the Foo() declared in 
	island.lua will forever be what is called.
	
 - Like in VergeC, the map Lua code is "compiled" into the .map file, but 
   unlike VergeC, the code itself is simply appended to the file rather than
   being put into a binary format first. This is pretty much transparent to
   you, but you never know what might come up.


********************************************************************************


If you need help, please come ask for it at the website on the boards at:

	http://www.verge-rpg.com/boards/

As previously stated, online documentation can be found at:

	http://www.verge-rpg.com/docs/  

Please make sure that you're using the newest version of v3 before asking 
questions though.  This file may be out of date by the time you read this.

If all else fails, feel free to email one of us with any questions at:

	mcgrue@verge-rpg.com
		or
	speveril@gmail.com

If you email either of us, please be civil and put a subject on your email to 
distinguish it from spam. ;)



-Ben "McGrue" McGraw, 2004.03.23
-Ben "vecna" Eirich, 2004.04.04
	(its all about the Benjamins)
-Shamus "Kildorf" Peveril, 2009.08.01
