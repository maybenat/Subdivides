//HW1.js
//Natalie McMullen, U0409117

var canvas;
var gl;
var points = [];
var colors = [];
var subdivisions = 2;
var triangleOn = true;
var twistOn = true;
var theta = 0;
var reColor = true;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //Default configuration
    if (triangleOn == true) {
        var vertices = [
            vec2(-0.5, -0.5),
            vec2(0, 0.5),
            vec2(0.5, -0.5)
        ];

        divideTriangle(vertices[0], vertices[1], vertices[2], subdivisions);
    }

    //Do Web GL configurations
    configure();

    //Begin dealing with the UI sections. 

    $(".dropdown-menu li a").click(function() {

        $(this).parents(".btn-group").find('.selection').text($(this).text());
        $(this).parents(".btn-group").find('.selection').val($(this).text());
        $("#polyVal").text($(this).text());
        if ($(this).text() == "Square") {
            triangleOn = false;
            reColor = true;
            reinit();
        } else {
            triangleOn = true;
            reColor = true;
            reinit();
        }

    });

    $("input:radio").change(function() {
        $("#twistVal").text($(this).val());
        if ($(this).val() == "Yes") {
            twistOn = true;
            reColor = true;
            reinit();
        } else {
            twistOn = false;
            reColor = true;
            reinit();
        }
    });


    $("#sub").slider();
    $("#sub").on("slide", function(slideEvt) {
        $("#subVal").text(slideEvt.value);
        if (subdivisions != slideEvt.value) {
            subdivisions = slideEvt.value;
            reColor = true;
            reinit();
        }
    });

    $("#theta").slider();
    $("#theta").on("slide", function(slideEvt) {
        $("#thetaVal").text(slideEvt.value);
        if (twistOn == true) {
            theta = slideEvt.value;
            //Conversion
            theta = theta * Math.PI / 180;
            reColor = false;
            reinit();
        } else if (twistOn == false) {
            theta = slideEvt.value;
            theta = theta * Math.PI / 180;
            reColor = false;
            reinit();
        }
    });


    function configure() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        var bufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

        var vColor = gl.getAttribLocation(program, "vColor");
        gl.enableVertexAttribArray(vColor);
        gl.vertexAttribPointer(vColor, colors[0].length, gl.FLOAT, false, 0, 0);
    }

    //Handle redraw configurations, with square.
    function redraw() {
        if (triangleOn == true) {
            var vertices = [
                vec2(-0.5, -0.5),
                vec2(0, 0.5),
                vec2(0.5, -0.5)
            ];

            divideTriangle(vertices[0], vertices[1], vertices[2], subdivisions);
        }
        if (triangleOn == false) {
            vertices = square();

            for (var i = 0; i < vertices.length; i++) {
                divideTriangle([0, 0], vertices[i], vertices[(i + 1) % vertices.length], subdivisions);
            };
        }
        configure();
    }

    function reinit() {
        if (reColor)
            colors = [];
        points = [];
        redraw();
    }

    render();

};

//All functions follow

//Follows the example on the book page, implemented to add in random
//coloring.
function divideTriangle(a, b, c, count) {
    var color = [Math.random(), Math.random(), Math.random()];
    if (colors.length == points.length)
        colors.push(color, color, color);
    //Base case, we are done recursing.
    if (count == 0) {
        points.push(twist(a), twist(b), twist(c));
    } else {

        //Bisection
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        //Recurse and create new triangles.
        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
        divideTriangle(ab, ac, bc, count);
    }
}


//Helper Function for building the square
function square() {
    var interm = [];
    for (var i = 0; i < 4; i++) {
        //Determine the angle to rotate the points by.
        angle = (Math.PI / 4) + (Math.PI * 2) / 4 * i;
        //Add the new points, scaled down by 0.75
        interm.push([0.75 * Math.cos(angle), 0.75 * Math.sin(angle)]);
    }
    //We now have the necessary points
    return interm;
}

//This facilitates the twisting function. All equations used
//were specified in the assignment specs. 
function twist(vertices) {
    var x = vertices[0];
    var y = vertices[1];
    //Only allow the twisting if it is on.
    if (twistOn) {
        sqrt = Math.sqrt(x * x + y * y);
    } else {
        sqrt = 1;
    }
    sin = Math.sin(sqrt * theta);
    cos = Math.cos(sqrt * theta);
    return [x * cos - y * sin, x * sin + y * cos];
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    window.requestAnimFrame(render);
}