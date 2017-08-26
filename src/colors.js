export const chartColors = [
    '#5cbae6',
    '#b6d957',
    '#fac364',
    '#8cd3ff',
    '#d998cb',
    '#f2d249',
    '#93b9c6',
    '#ccc5a8',
    '#52bacc',
    '#dbdb46',
    '#98aafb',
];

export function lightenDarkenColor(col, amt) {
    let usePound = false;
    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }

    const num = parseInt(col,16);

    let r = (num >> 16) + amt;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    let b = ((num >> 8) & 0x00FF) + amt;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    let g = (num & 0x0000FF) + amt;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
}