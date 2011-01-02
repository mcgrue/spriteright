require 'vx'
require 'lua/bmp'
require 'lua/json'

function split(str, pat)
   local t = {}  -- NOTE: use {n = 0} in Lua-5.0
   local fpat = "(.-)" .. pat
   local last_end = 1
   local s, e, cap = str:find(fpat, 1)
   while s do
      if s ~= 1 or cap ~= "" then
	 table.insert(t,cap)
      end
      last_end = e+1
      s, e, cap = str:find(fpat, last_end)
   end
   if last_end <= #str then
      cap = str:sub(last_end)
      table.insert(t, cap)
   end
   return t
end

function autoexec()
    v3.map("maps/paradise_isle2.map")
end

function start()

    v3.cameratracking = 0
    v3.xwin = 800
    v3.ywin = 800

    data = {
        path = v3.curmap.path,
        starting_coordinates = {x=v3.curmap.startx, y=v3.curmap.starty},
        name = v3.curmap.name,
        savevsp = v3.curmap.savevsp,
        music = v3.curmap.music,
        -- rstring = v3.curmap.rstring,
        dimensions = {y = v3.curmap.h, x = v3.curmap.w}
    }

    -- better rstring
    new_rstring = {}
    j = 1
    rs = split(v3.curmap.rstring, ',')
    for i, v in ipairs(rs) do
        if tonumber(v) then
            v = v - 1
        end

        new_rstring[j] = v
        j = j + 1
    end
    
    data['layer_render_order'] = new_rstring
    -- end better rstring

    ---
    --- Layers and Layer Data (the big one)
    ---
    data['layers'] = {}
    data['layer_data'] = {}
    data['obs_data'] = {}
    data['zone_data'] = {}

    for i=1,v3.curmap.layers,1 do
        layer = i-1
        data['layer_data'][i] = {}
        data['layers'][i] = {
            parallax = { x = v3.layer[layer].parallaxx, y = v3.layer[layer].parallaxy },
            lucent = v3.layer[layer].lucent
        }
        
        idx = 1
        
        for y=0, (v3.curmap.h-1), 1 do
            for x=0, (v3.curmap.w-1), 1 do    
                data['layer_data'][i][idx] = v3.getTile(x,y,layer)
                idx = idx + 1
            end
        end
    end

    idx = 1
    for y=0, (v3.curmap.h-1), 1 do
        for x=0, (v3.curmap.w-1), 1 do    
            data['obs_data'][idx] = v3.getObs(x,y)

            z = v3.getZone(x,y)
            if z > 0 then
                data['zone_data'][idx] = z 
            end

            idx = idx + 1
        end
    end
    --- end layers/layerdata

    zones = {}

    for i=1,v3.curmap.zones,1 do
        zones[i] = {
            idx = i, 
            name = v3.zone[i-1].name,
            event = v3.zone[i-1].event,
            method = v3.zone[i-1].method,
            percent = v3.zone[i-1].percent,
            delay = v3.zone[i-1].delay
        }
    end

--[[
    for y=0, (v3.curmap.h-1), 1 do
        for x=0, (v3.curmap.w-1), 1 do

        end
    end
]]

    --- output the json map.
    outfile = v3.curmap.name .. '.json'
    f = v3.FileOpen( outfile, v3.FILE_WRITE )
    v3.FileWrite( f, json.encode(data) )
    v3.FileClose( f );

    --- output the bmp vsp
    WriteFileBitmap24( v3.curmap.tileset, v3.curmap.savevsp )
end