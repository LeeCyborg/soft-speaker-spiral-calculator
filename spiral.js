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

    const input_params = {
        d_in: +document.getElementById("d_in").value,
        d_out: +document.getElementById("d_out").value,
        thickness: +document.getElementById("thickness").value,
        segments: +document.getElementById("segments").value,
    };

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
}

// Button click events

function saveSvg() {
    redraw();
    save("spiral.svg");
}

function generateSpiral() {
    const input_params = {
        d_in: +document.getElementById("d_in").value,
        thickness: +document.getElementById("thickness").value,
        length: +document.getElementById("length").value,
        segments: +document.getElementById("segments").value,
    };

    const d_out = getDiameter(input_params.length, input_params.d_in, input_params.thickness, input_params.segments);
    const turns = getSpiralTurns(d_out, input_params.d_in, input_params.thickness);
    const length_adjusted = getSpiralLength(d_out, input_params.d_in, input_params.thickness);

    document.getElementById("d_out").value = d_out.toFixed(2);
    document.getElementById("turns").value = turns.toFixed(2);
    document.getElementById("length_adjusted").value = length_adjusted.toFixed(2);

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
