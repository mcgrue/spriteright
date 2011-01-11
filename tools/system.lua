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
    --v3.map("maps/simpletype_overworld.map")
end

function write_obstruction_bmp()
    obsSetLen = v3.curmap.numobs * 16
    obsSetTileCnt = v3.curmap.numobs
    obsSetImage = v3.newImage(16, obsSetLen)
    v3.RectFill(0,0, 16,obsSetLen, v3.RGB(255,0,255), obsSetImage)

    for i=0, obsSetTileCnt-1, 1 do
        v3.BlitObs(0, 16*i, i, obsSetImage)
    end

    WriteFileBitmap24( obsSetImage, v3.curmap.savevsp .. '.obs' )
end

function write_tileset_bmp()
    numTiles = v3.ImageHeight(v3.curmap.tileset) / 16
    numRows = (numTiles / 16) + 1

    im = v3.NewImage( 256, numRows * 16 )

    i = 0
    for y=0, numRows, 1 do
        for x=0, 15, 1 do
            if i < numTiles then
                v3.BlitTile(x*16, y*16, i, im)
                i = i + 1
            end
        end
    end

    WriteFileBitmap24( im, v3.curmap.savevsp )   
end

function start()

--[[    c = v3.EntitySpawn(0, 0, 'res/chrs/darin.chr')
    v3.setPlayer(c)
    return
end
function ignore()
]]
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

    s = ''
    for y=0, 14, 1 do
        for x=0, 20, 1 do
            s = s .. v3.getObs(x,y) .. ',' 
        end
        s = s .. '\n'
    end

    idx = 1
    for y=0, (v3.curmap.h-1), 1 do
        for x=0, (v3.curmap.w-1), 1 do    
            data['obs_data'][idx] = v3.getObs(x,y)

            z = v3.getZone(x,y)
            if z ~= 0 then
                data['zone_data'][''..(idx-1)] = z 
            end

            idx = idx + 1
        end
    end
    --- end layers/layerdata

    data['zones'] = {}

    for i=1,v3.curmap.zones,1 do
        idx = i - 1
        data['zones'][idx] = {
            name = v3.zone[idx].name,
            event = v3.zone[idx].event,
            method = v3.zone[idx].method,
            percent = v3.zone[idx].percent,
            delay = v3.zone[idx].delay
        }
    end

--[[
    int entities;
    int entity.x[entity];
    int entity.y[entity];
    int entity.specframe[entity];
    int entity.frame[entity];
    int entity.hotx[entity];
    int entity.hoty[entity];
    int entity.hotw[entity];
    int entity.hoth[entity];
    int entity.movecode[entity];
    int entity.face[entity];
    int entity.speed[entity];
    int entity.visible[entity];
    int entity.obstruct[entity];
    int entity.obstructable[entity];
    string entity.script[entity];
    string entity.chr[entity];
    int entity.lucent[entity];
    int entity.framew[entity], entity.frameh[entity];
    string entity.description[entity];
]]
    --- entities
    data['entities'] = {}
    for i=1, v3.entities, 1 do
        idx = i - 1

        data['entities'][idx] = {
            x = v3.entity[idx].x,
            y = v3.entity[idx].y,
            hotx = v3.entity[idx].hotx,
            hoty = v3.entity[idx].hoty,
            hotw = v3.entity[idx].hotw,
            hoth = v3.entity[idx].hoth,
            speed = v3.entity[idx].speed,
            movecode = v3.entity[idx].movecode,
            face = v3.entity[idx].face,
            visible = v3.entity[idx].visible,
            obstuction = v3.entity[idx].obstuct,
            obstructable = v3.entity[idx].obstructable,
            script = v3.entity[idx].script,
            chr = v3.entity[idx].chr,
            lucent = v3.entity[idx].lucent,
            framew = v3.entity[idx].framew,
            frameh = v3.entity[idx].frameh,
            description = v3.entity[idx].description,
        }
    end


    --- output the json map.
    outfile = v3.curmap.name .. '.json'
    f = v3.FileOpen( outfile, v3.FILE_WRITE )
    v3.FileWrite( f, json.encode(data) )
    v3.FileClose( f )

    --- output the image data
    write_obstruction_bmp()
    write_tileset_bmp()
end