// Simple p5.js sketch - interactive circles
function setup() {
    let container = document.getElementById('sketch-container');
    let sketch = (p) => {
        p.setup = function() {
            p.createCanvas(600, 400);
            p.background(220);
        };
        
        p.draw = function() {
            // Slightly transparent background for trail effect
            p.background(220, 220, 220, 50);
            
            // Draw a circle that follows your mouse
            p.fill(100, 150, 255);
            p.noStroke();
            p.ellipse(p.mouseX, p.mouseY, 50);
            
            // Draw some text
            p.fill(0);
            p.textSize(12);
            p.text('Move your mouse around!', 10, 20);
        };
    };
    new p5(sketch, 'sketch-container');
}

setup();