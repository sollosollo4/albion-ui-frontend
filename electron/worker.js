// Function to load the OpenCV library
async function loadOpenCV() {
    try {
        // Import the OpenCV script synchronously
        importScripts('https://docs.opencv.org/4.5.0/opencv.js');
        console.log('OpenCV script loaded successfully in the worker.');

        // Set up the OpenCV object in the worker's global context
        self.cv = cv;
    } catch (error) {
        console.error('Error loading OpenCV script:', error);
    }
}

// Event handler for incoming messages
self.onmessage = async function(event) {
    // Load OpenCV library
    await loadOpenCV();

    // Check if the OpenCV object is available
    if (self.cv) {
        console.log('Received message in worker:', event.data);
        // Now you can use the OpenCV library
        let mat = cv.imread("mat.png");

        // Send a message back to the main thread
        self.postMessage('Hello from Web Worker!');
    } else {
        console.error('OpenCV library failed to load.');
    }
};