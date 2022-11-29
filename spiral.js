
function spiralLength(thickness, phi)
{
    return thickness / (2.0 * Math.PI) * (0.5 * phi * Math.sqrt(Math.pow(phi, 2.0) + 1.0) + 0.5 * Math.log(phi + Math.sqrt(Math.pow(phi, 2.0) + 1.0)));
}

function getSpiralTurns(dia_outer, dia_inner, thickness)
{
    let phi_inner = dia_inner * Math.PI / thickness;
    let phi_outer = dia_outer * Math.PI / thickness;

    return (phi_outer - phi_inner) / (2.0 * Math.PI);
}

function getSpiralLength(dia_outer, dia_inner, thickness)
{
    let phi_inner = dia_inner * Math.PI / thickness;
    let phi_outer = dia_outer * Math.PI / thickness;

    let length_outer = spiralLength(thickness, phi_outer);
    let length_inner = spiralLength(thickness, phi_inner);

    let length = length_outer - length_inner;

    return length;
}

function getDiameter(length, dia_inner, thickness, turn_increment)
{

    let turns = 0.0;
    let test_length = 0.0;
    let dia_outer = dia_inner;
    while (test_length < length)
    {
        turns += turn_increment;
        dia_outer = dia_inner + 2.0 * thickness * turns;
        test_length = getSpiralLength(dia_outer, dia_inner, thickness)
    }
    return dia_outer
}

let d_in = 2.5;
let thicc = 1.0;
let length = 16.0 * 2.54 * 12.0;
let turn_incr = 1.0;

window.onload = function() {
   document.getElementById("d_in").value=d_in;
   document.getElementById("length").value=length;
   document.getElementById("turn_incr").value=turn_incr;
} 

function findSpiral(){ 
    // let d_out = getDiameter(length, d_in, thicc, turn_incr);
    // let turns_out = getSpiralTurns(d_out, d_in, thicc);
    // let length_adjusted = getSpiralLength(d_out, d_in, thicc);
    document.getElementById("d_out").value=getDiameter(length, d_in, thicc, turn_incr);
    document.getElementById("turns").value=getSpiralTurns(getDiameter(length, d_in, thicc, turn_incr), d_in, thicc);
}
function findLength(){ 
    length = (document.getElementById("speakerOhms").value / document.getElementById("wireOhms").value);
    document.getElementById("length").value=length;
}

function output(){ 
    console.log('input length:', length);
    console.log('inner_dia:', d_in);
    console.log('thickness:', thicc);
    console.log('turn_increment:', turn_incr);
    console.log('------------------------------------------------------');
    console.log('outer_dia:', d_out);
    console.log('turns:', turns_out);
    console.log('adjusted_length:', length_adjusted);
}

