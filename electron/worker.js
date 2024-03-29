const { workerData, parentPort } = require('worker_threads');
const cv = require('@u4/opencv4nodejs');

const axios = require('axios');

const data_resolution_coords = workerData.resolutions;

function captureAndSend(imgData, x, y, radius) {
    const processImageResult = processImage(imgData, x, y, radius);
    // const base64Data = processImageResult.replace(/^data:image\/png;base64,/, '');
    // const buffer = Buffer.from(base64Data, 'base64');
    return processImageResult;

    function processImage(media, x, y, radius) {
        radius = Math.floor(radius);
        let dblRad = radius * 2;
        try {
            const mat = cv.imdecode(media);
            if (mat.empty) {
                throw new Error('Empty image');
            }
            // Creating a circular mask
            const mask = new cv.Mat(mat.rows, mat.cols, cv.CV_8U, 0);
            const center = new cv.Point(x, y);
            mask.drawCircle(center, radius, new cv.Vec(255, 255, 255), -1, cv.LINE_8, 0);
            let resultMat = new cv.Mat(dblRad, dblRad, cv.CV_8UC4, [-1, -1, -1, 0]);
            resultMat = mat.copyTo(resultMat, mask);
            if (!resultMat.empty) {
                const rect = new cv.Rect(x - radius, y - radius, dblRad, dblRad);
                const croppedImage = resultMat.getRegion(rect);

                const fourChannelMat = new cv.Mat(croppedImage.rows, croppedImage.cols, cv.CV_8UC4, [-1, -1, -1, 0]);
                const centerX = fourChannelMat.rows / 2;
                const centerY = fourChannelMat.cols / 2;
                for (let row = 0; row < fourChannelMat.rows; row++) {
                    for (let col = 0; col < fourChannelMat.cols; col++) {
                        let channels = croppedImage.at(row, col);
                        if (isPointInsideCircle(row, col, centerX, centerY, radius))
                            fourChannelMat.set(row, col, [channels.x, channels.y, channels.z, 255]);
                        else
                            fourChannelMat.set(row, col, [-1, -1, -1, 0]);
                    }
                }

                function isPointInsideCircle(x, y, centerX, centerY, radius) {
                    const distanceSquared = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
                    const radiusSquared = Math.pow(radius, 2);

                    return distanceSquared <= radiusSquared;
                }
                const resultBase64 = cv.imencode('.png', fourChannelMat).toString('base64');
                return resultBase64;
            } else {
                throw new Error('Empty resultMat');
            }
        } catch (error) {
            console.error('Error processing image:', error);
            throw error;
        }
    }
}

function intervalWorker(imgData, roomId, authToken, resolution = 'resolution1920x1080') {
    let buffers = [];
    data_resolution_coords[resolution].coords.forEach(function (elem, index) {
        let buffer = captureAndSend(imgData, elem.x, elem.y, elem.r);
        buffers[index] = buffer;
    });

    axios.post(`https://albion-overlay.ru/api/rooms/${roomId}/sendPressButtonEvent`, {
        buffers: buffers
    }, {
        withCredentials: true,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            console.log("buffers sended: " + Math.floor(Date().getTime() / 1000));
        })
        .catch(error => {
        });
}
// Start Immediatly and working all time
setInterval(() => {
    parentPort.postMessage({
        type: 'get-screenshot'
    });
}, 900);

parentPort.on('message', message => {
    if (message.type === 'set-screenshot') {
        intervalWorker(message.data, message.roomId, message.authToken, message.resolution);
    }
});
