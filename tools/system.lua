-- The following code is recommended for people NOT using Lua.
-- After all, it's slightly better than compiler errors
-- for people who screw with verge.cfg.
--
-- function autoexec()
--		v3.Exit("This game requires that Lua be disabled to run.");
-- end

function autoexec()
	v3.Exit("You have successfully run LuaVerge. If you're new, you may want to"
		.. " go to http://www.verge-rpg.com/new_user/ and read the tutorials, and"
		.. " check out the file LuaVerge.txt included in this zip."
		.. " Otherwise, good luck! Check out the message boards on verge-rpg.com,"
		.. " and read the README.TXT included in this zip too!");
end