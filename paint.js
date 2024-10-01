setCursor('crosshair');
setStrokeCap(StrokeCaps.ROUND);
setStroke(4);

class Tool {
    constructor(id) {
        this.id = id;
    }

    onTake() {}
    onDrop() {}

    onMousePress(pos, button) {}
    onMouseRelease(pos, button) {}
    onMouseMove(pos) {}
}
class Draw extends Tool {
    constructor(id) {
        super(id);
        
        this.lastMousePos = new Vec2(0.0, 0.0);
        this.mousePressed = false;
    }

    onTake() {
        super.onTake();
        this.mousePressed = false;
    }

    onMousePress(pos, button) {
        super.onMousePress(pos, button);

        if(button == MouseButtons.LEFT) {
            this.lastMousePos = pos;
            drawLine(this.lastMousePos, this.lastMousePos);

            this.mousePressed = true;
        }
    }
    onMouseRelease(pos, button) {
        super.onMouseRelease(pos, button);

        if(button == MouseButtons.LEFT) {
            this.mousePressed = false;
        }
    }
    onMouseMove(pos) {
        super.onMouseMove(pos);

        if(this.mousePressed) {
            drawLine(this.lastMousePos, pos);
            this.lastMousePos = pos;
        }
    }
}
class Brush extends Draw {
    constructor(id) {
        super(id);
    }

    onTake() {
        setStrokeCap(StrokeCaps.ROUND);

        document.getElementById('color-selector').addEventListener('change', this.onColorSelectorChange);
        document.getElementById('stroke-width-selector').addEventListener('change', this.onStrokeWidthChange);
        
        document.getElementById('brush-controls').style.display = 'block';

        this.onColorSelectorChange();
        this.onStrokeWidthChange();
    }
    onDrop() {
        document.getElementById('color-selector').removeEventListener('change', this.onColorSelectorChange);
        document.getElementById('stroke-width-selector').removeEventListener('change', this.onStrokeWidthChange);
        
        document.getElementById('brush-controls').style.display = 'none';
    }

    onColorSelectorChange() {
        setStrokeColor(document.getElementById('color-selector').value);
    }
    onStrokeWidthChange() {
        let value = document.getElementById('stroke-width-selector').value;
        setStroke(value);
    }
}
class Erase extends Draw {
    constructor(id) {
        super(id);
    }

    onTake() {
        setStrokeCap(StrokeCaps.ROUND);

        document.getElementById('erase-stroke-width-selector').addEventListener('change', this.onStrokeWidthChange);
        document.getElementById('erase-controls').style.display = 'block';

        setStrokeColor('#ffffff');
        this.onStrokeWidthChange();
    }
    onDrop() {
        document.getElementById('erase-stroke-width-selector').removeEventListener('change', this.onStrokeWidthChange);
        document.getElementById('erase-controls').style.display = 'none';
    }

    onStrokeWidthChange() {
        let value = document.getElementById('erase-stroke-width-selector').value;
        setStroke(value);
    }
}
class Fill extends Tool {
    onTake() {
        super.onTake();

        document.getElementById('fill-controls').style.display = 'flex';
        document.getElementById('fill-color-selector').addEventListener('change', this.onColorSelectorChange);

        this.onColorSelectorChange();
    }
    onDrop() {
        super.onDrop();

        document.getElementById('fill-controls').style.display = 'none';
        document.getElementById('fill-color-selector').removeEventListener('change', this.onColorSelectorChange);
    }
    onMousePress(pos, button) {
        super.onMousePress(pos, button);

        if(button == MouseButtons.LEFT) {
            let replaceColor = getPixel(pos);
            let floorPos = new Vec2(Math.floor(pos.x), Math.floor(pos.y));
            
            if(getPixel(floorPos) == graphics.fillStyle) return;
            this.floodFill(floorPos, replaceColor);
        }
    }

    onColorSelectorChange() {
        setFillColor(document.getElementById('fill-color-selector').value);
    }

    floodFill(pos, replaceColor) {
        let queue = [];
        queue.push(pos);

        while(queue.length > 0) {
            queue.forEach(item => {
                queue.splice(queue.indexOf(item), 1);

                let pixelColor = getPixel(item);
                if(item.x >= 0 && item.x < canvas.width && item.y >= 0 && item.y < canvas.height && pixelColor == replaceColor) {
                    drawPixel(item);
    
                    queue.push(new Vec2(item.x + 1, item.y));
                    queue.push(new Vec2(item.x - 1, item.y));
                    queue.push(new Vec2(item.x, item.y + 1));
                    queue.push(new Vec2(item.x, item.y - 1));
                }
            });
        }
    }
}

Tools = {
    BRUSH: new Brush('brush'),
    ERASE: new Erase('erase'),
    FILL: new Fill('fill')
};

takeTool(Tools.BRUSH);

document.getElementById('take-brush').addEventListener('click', () => {
    takeTool(Tools.BRUSH);
});
document.getElementById('take-erase').addEventListener('click', () => {
    takeTool(Tools.ERASE);
});
document.getElementById('take-fill').addEventListener('click', () => {
    takeTool(Tools.FILL);
});

document.getElementById('new-file').addEventListener('click', () => {
    document.getElementById('new-file-popup').style.display = 'block';
});
document.getElementById('new-file-create-button').addEventListener('click', () => {
    canvas.width = document.getElementById('new-file-width').value;
    canvas.height = document.getElementById('new-file-height').value;
    canvas.style.width = '500px';
    canvas.style.height = (canvas.height / canvas.width * 500.0) + 'px';

    clear();
    updateCamera();

    takeTool(currentTool);
    document.getElementById('new-file-popup').style.display = 'none';
});
document.getElementById('open-file').addEventListener('click', () => {
    open();
});
document.getElementById('save-file').addEventListener('click', () => {
    save();
});