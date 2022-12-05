// Soft Speaker Coil Calculator
// Kyle Chisholm - November 2022

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

function getDiameter(length, dia_inner, thickness, turn_increment) {
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

function getSpiralPoints(dia_outer, dia_inner, thickness, length_increment) {
    spiral_points = [[0, 200], [200, 400], [400, 200]];

    return spiral_points;
}

// Initial state

window.onload = function () {
    const default_params = {
        d_in: 2.5,
        thickness: 1.0,
        length: 16.0 * 2.54 * 12.0,
        turn_incr: 1.0,
    };

    document.getElementById("d_in").value = default_params.d_in;
    document.getElementById("length").value = default_params.length;
    document.getElementById("turn_incr").value = default_params.turn_incr;
    document.getElementById("thickness").value = default_params.thickness;

    findSpiral()
};

// Draw p5.js

function setup() {
    createCanvas(400, 400, SVG);
    strokeWeight(2);
    stroke(0);
    noFill();
    noLoop();
}

function draw() {
    background(255);

    const input_params = {
        d_in: +document.getElementById("d_in").value,
        d_out: +document.getElementById("d_out").value,
        thickness: +document.getElementById("thickness").value,
        save_svg: document.getElementById("save_svg").checked,
    };

    const spiral_points = getSpiralPoints(input_params.d_out, input_params.d_in, input_params.thickness);

    if (spiral_points.length > 1)
    {
        let prev = spiral_points[0];
        for (let k = 1; k < spiral_points.length; k++)
        {
            line(prev[0], prev[1], spiral_points[k][0], spiral_points[k][1]);
            prev = spiral_points[k];
        }
    }

    if (input_params.save_svg)
    {
        save("spiral.svg");
    }
}

// Button click events

function findSpiral() {
    const input_params = {
        d_in: +document.getElementById("d_in").value,
        thickness: +document.getElementById("thickness").value,
        length: +document.getElementById("length").value,
        turn_incr: +document.getElementById("turn_incr").value,
    };

    const d_out = getDiameter(input_params.length, input_params.d_in, input_params.thickness, input_params.turn_incr);
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
