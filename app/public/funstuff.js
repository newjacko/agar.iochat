// funstuff.js

(function() {
    'use strict';
function createCloseableDiv() {
  // Create the div
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '50%';
  div.style.left = '50%';
  div.style.transform = 'translate(-50%, -50%)';
  div.style.backgroundColor = '#fff';
  div.style.padding = '20px';
  div.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  div.style.zIndex = 99999999;
  div.style.width = '80%';
  div.style.height = '80%';

  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.src = 'https://newjackchat2.glitch.me/emojis.html'; // Ensure this path is correct based on where emojis.html is located
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';

  // Create the close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.addEventListener('click', () => {
    div.remove();
  });

  // Append the iframe and close button to the div
  div.appendChild(iframe);
  div.appendChild(closeButton);

  // Append the div to the body
  document.body.appendChild(div);
}

// Ensure the function is globally accessible
window.createCloseableDiv = createCloseableDiv;
})();