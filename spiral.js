// Soft Speaker Coil Calculator
// Kyle Chisholm - November 2022

const cnv_max_size = 600;
const cnv_padding = 22;
let cnv_size;
let cnv;

function spiralLength(thickness, phi) {
    return (
        (thickness / (2.0 * Math.PI)) *
        (0.5 * phi * Math.sqrt(Math.pow(phi, 2.0) + 1.0) + 0.5 * Math.log(phi + Math.sqrt(Math.pow(phi, 2.0) + 1.0)))
    );
}

function getSpiralTurns(dia_outer, dia_inner, thickness) {
    const phi_inner = (dia_inner * Math.PI) / thickness;
    const phi_outer = (dia_outer * Math.PI) / thickness;

    return (phi_outer - phi_inner) / (2.0 * Math.PI);
}

function getSpiralLength(dia_outer, dia_inner, thickness) {
    const phi_inner = (dia_inner * Math.PI) / thickness;
    const phi_outer = (dia_outer * Math.PI) / thickness;

    const length_outer = spiralLength(thickness, phi_outer);
    const length_inner = spiralLength(thickness, phi_inner);

    const length = length_outer - length_inner;

    return length;
}

function getDiameter(length, dia_inner, thickness, segments) {
    const turn_increment = 1.0 / segments;
    let turns = 0.0;
    let test_length = 0.0;
    let dia_outer = dia_inner;
    while (test_length < length) {
        turns += turn_increment;
        dia_outer = dia_inner + 2.0 * thickness * turns;
        test_length = getSpiralLength(dia_outer, dia_inner, thickness);
    }
    return dia_outer;
}

// Get spiral info

function getSpiralSmooth(input_params) {

    const d_out = getDiameter(input_params.length, input_params.d_in, input_params.thickness, input_params.segments);
    const turns = getSpiralTurns(d_out, input_params.d_in, input_params.thickness);
    const length_adjusted = getSpiralLength(d_out, input_params.d_in, input_params.thickness);

    return {
        d_out: d_out,
        turns: turns,
        length_adjusted: length_adjusted
    };
}

function getSpiralGeometric(input_params) {
    const turn_increment = 1.0 / input_params.segments;
    let prev_point = [0.5 * input_params.d_in, 0.0];

    let d_out = input_params.d_in;
    let turns = 0.0;
    let length_adjusted = 0.0;

    while (length_adjusted < input_params.length) {
        turns += turn_increment;
        d_out = input_params.d_in + 2.0 * input_params.thickness * turns;

        const rad = 0.5 * d_out;
        const ang = turns * 2.0 * Math.PI;
        const pnt = [rad * Math.cos(ang), rad * Math.sin(ang)];
        length_adjusted += Math.sqrt(Math.pow(pnt[0] - prev_point[0], 2) + Math.pow(pnt[1] - prev_point[1], 2));

        prev_point = pnt;
    }

    return {
        d_out: d_out,
        turns: turns,
        length_adjusted: length_adjusted
    };
}

// drawing spiral points

function pointToCanvas(x, y, dia_outer, canvas_size) {
    const scale = canvas_size / dia_outer;
    return [(x * scale + 0.5 * canvas_size), (-y * scale + 0.5 * canvas_size)];
}

function getSpiralPoints(dia_outer, dia_inner, thickness, segments, canvas_size) {
    const turn_increment = 1.0 / segments;
    let spiral_points = [pointToCanvas( 0.5 * dia_inner, 0.0, dia_outer, canvas_size)];
    let turns = 0.0;
    const total_turns = getSpiralTurns(dia_outer, dia_inner, thickness);
    while (turns < total_turns) {
        turns += turn_increment;
        const rad = 0.5 * dia_inner + thickness * turns;
        const ang = turns * 2.0 * Math.PI;
        const pnt = pointToCanvas(rad * Math.cos(ang), rad * Math.sin(ang), dia_outer, canvas_size);
        spiral_points.push(pnt);
    }
    return spiral_points;
}

// Initial state

window.onload = function () {
    const default_params = {
        d_in: 2.5,
        thickness: 1.0,
        length: 16.0 * 2.54 * 12.0,
        segments: 6,
    };

    document.getElementById("d_in").value = default_params.d_in;
    document.getElementById("length").value = default_params.length;
    document.getElementById("segments").value = default_params.segments;
    document.getElementById("thickness").value = default_params.thickness;
    document.getElementById("spiral_smooth").checked = true;

    generateSpiral();
};

// Draw p5.js

function setup() {
    // const max_size = windowWidth - cnv_padding;
    cnv_size = document.getElementById("spiral_visual").offsetWidth;
    cnv = createCanvas(cnv_size, cnv_size, SVG);
    cnv.parent("spiral_visual");
    strokeWeight(2);
    stroke(0);
    noFill();
    noLoop();
}

function windowResized() {
    cnv_size = document.getElementById("spiral_visual").offsetWidth;
    resizeCanvas(cnv_size, cnv_size);
    redraw();
}

function draw() {
    clear();

    let input_params = {
        d_in: +document.getElementById("d_in").value,
        d_out: +document.getElementById("d_out").value,
        thickness: +document.getElementById("thickness").value,
        segments: +document.getElementById("segments").value,
    };

    if (document.getElementById("spiral_smooth").checked)
    {
        input_params.segments = 200;
    }
    else
    {
        input_params.segments = input_params.segments.toFixed(0);
        if (input_params.segments < 3) {
            input_params.segments = 3;
        }
        document.getElementById("segments").value = input_params.segments;
    }

    const spiral_points = getSpiralPoints(
        input_params.d_out,
        input_params.d_in,
        input_params.thickness,
        input_params.segments,
        cnv_size
    );

    if (spiral_points.length > 1) {
        let prev = spiral_points[0];
        for (let k = 1; k < spiral_points.length; k++) {
            line(prev[0], prev[1], spiral_points[k][0], spiral_points[k][1]);
            prev = spiral_points[k];
        }
    }

    document.getElementById("image_scale").innerHTML = input_params.d_out.toFixed(2);
}

// Button click events

function saveSvg() {
    redraw();
    save("spiral.svg");
}

function generateSpiral() {
    let input_params = {
        d_in: +document.getElementById("d_in").value,
        thickness: +document.getElementById("thickness").value,
        length: +document.getElementById("length").value,
        segments: +document.getElementById("segments").value,
        smooth_spiral: document.getElementById("spiral_smooth").checked,
    };

    let spiral_info = {};
    if (input_params.smooth_spiral)
    {
        input_params.segments = 200;
        spiral_info = getSpiralSmooth(input_params);
    }
    else
    {
        input_params.segments = input_params.segments.toFixed(0);
        if (input_params.segments < 3) {
            input_params.segments = 3;
        }
        document.getElementById("segments").value = input_params.segments;
        spiral_info = getSpiralGeometric(input_params);
    }

    document.getElementById("d_out").value = spiral_info.d_out.toFixed(2);
    document.getElementById("turns").value = spiral_info.turns.toFixed(2);
    document.getElementById("length_adjusted").value = spiral_info.length_adjusted.toFixed(2);

    // draw spiral
    redraw();
}

function findLength() {
    const input_params = {
        total_resistance: +document.getElementById("speakerOhms").value,
        wire_resistance: +document.getElementById("wireOhms").value,
    };

    const length = (100.0 * input_params.total_resistance) / input_params.wire_resistance;
    document.getElementById("length").value = length.toFixed(2);
}
