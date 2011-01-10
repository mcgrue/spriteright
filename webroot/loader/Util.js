function is_int( input ) {
    return parseInt(input) == input;
}

/// the basic drawing functions will suck until I apply these principles >:(
/// http://code.anjanesh.net/2009/05/1-pixel-wide-line-parallel-to-axis-in.html
function draw_pixel( x1, y1, color ) {
    draw_line(x1,y1,x1+1,y1+1, color);
}

function draw_line( x1, y1, x2, y2, color, thickness ) {

    if( !thickness ) {
        thickness = 2;
    }

    $$.context.strokeStyle = color;
    $$.context.lineWidth   = thickness * $$.scale;

    $$.context.beginPath();
    $$.context.moveTo(x1, y1);
    $$.context.lineTo(x2, y2);
    $$.context.stroke();
}

function draw_rect( x1, y1, x2, y2, color, thickness ) {

    if( !thickness ) {
        thickness = 2;
    }

    $$.context.strokeStyle = color;
    $$.context.lineWidth   = thickness * $$.scale;

    $$.context.beginPath();
    $$.context.moveTo(x1, y1);
    $$.context.lineTo(x1, y2);
    $$.context.lineTo(x2, y2);
    $$.context.lineTo(x2, y1);
    $$.context.lineTo(x1, y1);
    $$.context.stroke();
}

function fill_rect( x1, y1, x2, y2, color ) {
    $$.context.fillStyle = color;

    $$.context.fillRect(
        x1, y1,
        (x2-x1*$$.scale), (y2-y1*$$.scale)
    );
}

function draw_menu_box(obj) {
    $$.context.globalCompositeOperation = 'source-over';

    var color_0 = '#000000';
    var color_1 = '#555555';
    var color_2 = '#999999';
    
    var x1 = obj.x;
    var y1 = obj.y;
    
    var x2 = x1 + obj.w;
    var y2 = y1 + obj.h;

    draw_line(x1, y1 + 2, x1, y2 - 3, color_0); // TL -> BL
    draw_line(x1 + 2, y1, x2 - 3, y1, color_0); // TL -> TR

    draw_line(x2 - 1, y2 - 3, x2 - 1, y1 + 2, color_0); // BR -> TR
    draw_line(x2 - 3, y2 - 1, x1 + 2, y2 - 1, color_0); // BR -> BL

    draw_rect(x1 + 1, y1 + 1, x2 - 2, y2 - 2, color_1);
    draw_rect(x1 + 2, y1 + 2, x2 - 3, y2 - 3, color_2);

    fill_rect(x1 + 3, y1 + 3, x2 - 4 , y2 - 4, obj.color);

     draw_pixel(x1 + 1, y1 + 1, color_0); // TL
     draw_pixel(x2 - 2, y1 + 1, color_0); // TR
     draw_pixel(x1 + 1, y2 - 2, color_0); // BL
     draw_pixel(x2 - 2, y2 - 2, color_0); // BR

     draw_pixel(x1 + 2, y1 + 2, color_1 ); // TL
     draw_pixel(x2 - 3, y1 + 2, color_1 ); // TR
     draw_pixel(x1 + 2, y2 - 3, color_1 ); // BL
     draw_pixel(x2 - 3, y2 - 3, color_1 ); // BR

     draw_pixel(x1 + 3, y1 + 3, color_2); // TL
     draw_pixel(x2 - 4, y1 + 3, color_2); // TR
     draw_pixel(x1 + 3, y2 - 4, color_2); // BL
     draw_pixel(x2 - 4, y2 - 4, color_2); // BR
}

function get_time() {
    var d = new Date();
    var t = d.getTime();
    delete d;
    return t;
}

function get_sprite_coordinates( frame, dim, sheet ) {
    if( parseInt(frame) != frame ) throw "Invalid frame type: " + frame;

    if(!sheet.padding) {
        sheet.padding = 0;
    }

    if( !sheet.top_padding ) {
        sheet.top_padding = 0;    
    }

    if( !sheet.left_padding ) {
        sheet.left_padding = 0;    
    }

    var x = x_from_flat( frame, sheet.cols ) * (dim.w + sheet.padding) + sheet.left_padding;;
    var y = y_from_flat( frame, sheet.cols ) * (dim.h + sheet.padding) + sheet.top_padding;

    return {x:x,y:y};
}

function overlap( x1, y1, w1, h1, x2, y2, w2, h2 ) {
	return (x1 + w1 > x2 && y1 + h1 > y2 && x1 < x2 + w2 && y1 < y2 + w2);
}

function x_from_flat( flatval, yMax ) {
	return flatval%yMax;
}

function y_from_flat( flatval, yMax ) {
	flatval = flatval - x_from_flat( flatval,yMax );
	return flatval/yMax;
}

function flat_from_xy( x, y, yMax ) {
    return y*yMax + x;
}

function sign(i) {
    if(i) {
        if( i < 0 ) {
            return -1;
        }

        return 1;
    }

    return 0;
}