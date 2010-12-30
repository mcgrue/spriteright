function WriteFileBitmap24(out_image_handle, filename)
    img_x = v3.ImageWidth(out_image_handle)
    img_y = v3.ImageHeight(out_image_handle)

    if (img_x * img_y) == 0 then
        return 0 -- Return on bad image
    end

    if (img_x * 3 % 4) then
        img_xtra = 4 - (img_x * 3 % 4) -- Padding needed
    else
        img_xtra = 0 -- No padding needed
    end

    img_size = ((3 * img_x) + img_xtra) * img_y -- Size of image data in bytes
    out_file = v3.FileOpen(filename .. '.bmp', v3.FILE_WRITE)
    
    if out_file <= 0 then
        return 0 -- Return on bad path or unopenable file
    end

    v3.FileWriteWord(out_file, 19778)           -- bfType - Header of 'BM'
    v3.FileWriteQuad(out_file, 54 + img_size)   -- bfSize - File size
    v3.FileWriteQuad(out_file, 0)               -- bfReserved1, bfReserved2  - Two reserved words
    v3.FileWriteQuad(out_file, 54)              -- bfOffBits - Offset to image data
    v3.FileWriteQuad(out_file, 40)              -- biSize - Size of (windows) bitmap info structure
    v3.FileWriteQuad(out_file, img_x)           -- biWidth - Image width
    v3.FileWriteQuad(out_file, img_y)           -- biHeight - Image height
    v3.FileWriteWord(out_file, 1)               -- biPlanes - Err... one
    v3.FileWriteWord(out_file, 24)              -- biBitCount - Bits per pixel
    v3.FileWriteQuad(out_file, 0)               -- biCompression - No compression
    v3.FileWriteQuad(out_file, img_size)        -- biSizeImage - Size of bitmap data
    v3.FileWriteQuad(out_file, 0)               -- biXPelsPerMeter
    v3.FileWriteQuad(out_file, 0)               -- biYPelsPerMeter

    -- X/YPelsPerMeter specifies the horizontal/vertical resolution,
    -- in pixels per meter, of the target device for the bitmap.
    -- An application can use this value to select a bitmap from a resource
    -- group that best matches the characteristics of the current device.
    v3.FileWriteQuad(out_file, 0) -- biClrUsed - Not palletted data
    v3.FileWriteQuad(out_file, 0) -- biClrImportant - All colours important

    for yi = (img_y - 1), 0, -1 do --Move from bottom of image data up
        for xi = 0, (img_x-1), 1 do -- Write row of pixels
            out_pixel = v3.GetPixel(xi, yi, out_image_handle)
            v3.FileWriteByte(out_file, v3.GetB(out_pixel))
            v3.FileWriteByte(out_file, v3.GetG(out_pixel))
            v3.FileWriteByte(out_file, v3.GetR(out_pixel))
        end

--        for xi = img_xtra,  1, -1 do -- Pad to quad width
--            v3.FileWriteByte(out_file, 0);
--        end
    end

    v3.FileClose(out_file);
    return img_size;
end