//robotjs library
var robot = require('robotjs');

function main() {
    console.log("Starting...");
    sleep(4000);

    // infinite loop. use ctrl+c in terminal to stop
    while (true) {
        // find a tree
        var tree = findTree();
        // if we couldn't find a tree, rotate camera
        // return to the start of the loop
        if (tree == false) {
            rotateCamera();
            continue;
        }

        // chop down the tree
        robot.moveMouse(tree.x, tree.y);
        robot.mouseClick();
        // wait for walking and chopping to complete.
        sleep(3000);

        dropLogs();
    }
}
function dropLogs() {
    var inventory_x = 1882;
    var inventory_y = 830;
    var inventory_log_color = "765b37";

    var pixel_color = robot.getPixelColor(inventory_x, inventory_y);
    //console.log("Inventory log color is: " + pixel_color);

    var wait_cycles = 0;
    var max_wait_cycles = 9;
    while (pixel_color != inventory_log_color && wait_cycles < max_wait_cycles) {
        // we don't have a log in our inventory yet in the placement we want
        // wait small bit longer to ensure we finsih chopping the tree.
        sleep(1000);
        //one more sample of pixel color
        pixel_color = robot.getPixelColor(inventory_x, inventory_y);
        wait_cycles++;
    }

    // drop logs from the inventory if color matches
    if (pixel_color == inventory_log_color) {
        robot.moveMouse(inventory_x, inventory_y);
        robot.mouseClick('right');
        // adding a little delay here because sometimes the second click will miss currently
        sleep(300);
        robot.moveMouse(inventory_x, inventory_y + 70);
        robot.mouseClick();
        sleep(1000);
    }
}

function testScreenCapture() {
    // screenshot
    var img = robot.screen.capture(0, 0, 1920, 1080);
    var pixel_color = img.colorAt(30, 18);
    console.log(pixel_color);
}

function findTree() {
    // take a screenshot from the middle of the screen
    // I have the upper left corner of the image starting at x = 300, y = 300, and size of
    // the image at width = 1300, height = 400.
    // ADJUST THIS TO YOUR SCREEN SIZE IF USED ON OTHER COMPUTER, SUCH AS PHILLIP MAY HAVE DIFFERENT SCREEN SIZE THAN ME FOR EXAMPLE
    var x = 300, y = 300, width = 1300, height = 400;
    var img = robot.screen.capture(x, y, width, height);

    // Tree click on targetting array
    // I'm targeting the brown trunks
    var tree_colors = ["5b462a", "60492c", "6a5130", "705634", "6d5432", "574328"];

    for (var i = 0; i < 500; i++) {
        var random_x = getRandomInt(0, width-1);
        var random_y = getRandomInt(0, height-1);
        var sample_color = img.colorAt(random_x, random_y);

        if (tree_colors.includes(sample_color)) {
            var screen_x = random_x + x;
            var screen_y = random_y + y;

            // if we don't confirm that this coordinate has a true in its place, the loop will continue to go
            if (confirmTree(screen_x, screen_y)) {
                console.log("Found a tree at: " + screen_x + ", " + screen_y + " color " + sample_color);
                return {x: screen_x, y: screen_y};
            } else {
                // debug
                console.log("Unconfirmed tree at: " + screen_x + ", " + screen_y + " color " + sample_color);
            }
        }
    }

    return false;
}

function rotateCamera() {
    console.log("Rotating camera");
    robot.keyToggle('right', 'down');
    sleep(1000);
    robot.keyToggle('right', 'up');
}

function confirmTree(screen_x, screen_y) {
    // first move the mouse to the given coordinates
    robot.moveMouse(screen_x, screen_y);
    // wait a moment for the help text
    sleep(300);

    var check_x = 103;
    var check_y = 63;
    var pixel_color = robot.getPixelColor(check_x, check_y);

    // returns true if the pixel color will be teal
    return pixel_color == "00ffff";
}

function sleep(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

main();