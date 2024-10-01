const canvas = document.getElementById('canvas');
const graphics = canvas.getContext('2d', { willReadFrequently: true });

function clear() {
    graphics.fillStyle = '#ffffff';
    graphics.fillRect(0.0, 0.0, canvas.width, canvas.height);
}
clear();

function open() {
    let opener = document.createElement('input');
    opener.type = 'file';
    opener.accept = 'image/*'
    opener.multiple = false;

    opener.addEventListener('change', () => {
        let image = document.createElement('img');
        image.src = URL.createObjectURL(opener.files[0]);

        image.addEventListener('load', () => {
            clear();

            canvas.width = image.width;
            canvas.height = image.height;

            canvas.style.width = '500px';
            canvas.style.height = (canvas.height / canvas.width * 500.0) + 'px';

            graphics.drawImage(image, 0.0, 0.0);
        });
    });

    opener.click();
    opener.remove();
}
function save() {
    let downloader = document.createElement('a');
    downloader.download = 'download.png';
    downloader.href = canvas.toDataURL('image/png');

    downloader.click();
    downloader.remove();
}

StrokeCaps = {
    SQUARE: 'square',
    ROUND: 'round'
};
Cursors = {
    DEFAULT: 'default',
    CROSSHAIR: 'crosshair',
    POINTER: 'pointer',
    HAND: 'hand'
};
MouseButtons = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

cameraPos = new Vec2(0.0, 0.0);
cameraZoom = 1.0;

function updateCamera() {
    canvas.style.translate = (cameraPos.x / cameraZoom) + 'px ' + (cameraPos.y / cameraZoom) + 'px';
    canvas.style.scale = 1.0 / cameraZoom;
}

function drawLine(a, b) {
    graphics.beginPath();
    graphics.moveTo(a.x, a.y);
    graphics.lineTo(b.x, b.y);
    graphics.stroke();
}
function drawPixel(pos) {
    graphics.fillRect(pos.x, pos.y, 1, 1);
}
function getPixel(pos) {
    let pixel = graphics.getImageData(pos.x, pos.y, 1, 1).data;
    return '#' + ('000000' + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6);
}
function setStroke(width) {
    graphics.lineWidth = width;
}
function setFillColor(color) {
    graphics.fillStyle = color;
}
function setStrokeColor(color) {
    graphics.strokeStyle = color;
}
function setStrokeCap(cap) {
    graphics.lineCap = cap;
}

function setCursor(cursor) {
    canvas.style.cursor = cursor;
}

let currentTool = null;
function takeTool(tool) {
    if(currentTool != null) {
        currentTool.onDrop();
    }

    currentTool = tool;
    if(tool != null) {
        currentTool.onTake();

        let toolTakers = document.getElementById('toolbox').children;
        for(let i = 0; i < toolTakers.length; i++) {
            toolTakers[i].style.filter = toolTakers[i].id == 'take-' + tool.id ? 'brightness(50%)' : 'brightness(100%)';
        }
    }
}

function globalToCanvas(pos) {
    let canvasRect = canvas.getBoundingClientRect();
    return new Vec2((pos.x - canvasRect.x) * (canvas.width / canvasRect.width), (pos.y - canvasRect.y) * (canvas.height / canvasRect.height));
}

KEYS = {};
BUTTONS = {};

mousePosition = new Vec2(-1.0, -1.0);

canvas.addEventListener('mousedown', ev => {
    currentTool.onMousePress(globalToCanvas(new Vec2(ev.x, ev.y)), ev.button);
});

document.addEventListener('mousedown', ev => {
    BUTTONS[ev.button] = true;
});
document.addEventListener('mouseup', ev => {
    currentTool.onMouseRelease(globalToCanvas(new Vec2(ev.x, ev.y)), ev.button);
    BUTTONS[ev.button] = false;
})
document.addEventListener('mousemove', ev => {
    mousePosition = new Vec2(ev.x, ev.y);
    currentTool.onMouseMove(globalToCanvas(mousePosition));

    if(BUTTONS[MouseButtons.MIDDLE]) {
        cameraPos.x += ev.movementX * cameraZoom;
        cameraPos.y += ev.movementY * cameraZoom;

        updateCamera();
    }
});
document.addEventListener('wheel', ev => {
    cameraZoom = Math.min(Math.max(cameraZoom - (ev.deltaX - ev.deltaY) / 1200.0 * cameraZoom, 0.2), 100.0);
    updateCamera();
});
document.addEventListener('keydown', ev => {
    KEYS[ev.code] = true;
});
document.addEventListener('keyup', ev => {
    KEYS[ev.code] = false;
});