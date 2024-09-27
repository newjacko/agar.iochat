// client-side js
// run by the browser each time your view template is loaded

console.log("hello world :o");

let avatarURL = 'https://i.imgur.com/kLTnvfM.png'; // Default avatar URL

// Create the chat container
const chatDiv = document.createElement("div");
chatDiv.className = "draggable";
chatDiv.style.cssText = "position: fixed; bottom: 0; left: 0; width: 25%; height: 400px; background-color: rgba(0,0,0,.2); display: flex; flex-direction: column; cursor: move; overflow: hidden;";
document.body.appendChild(chatDiv);

// Create the message container
const messageContainer = document.createElement("div");
messageContainer.id = "messageContainer";

// Create an input for the avatar URL
const avatarInputContainer = document.createElement("div");
avatarInputContainer.style.cssText = "padding: 10px; background: rgba(0,0,0,.3);";

const avatarInputLabel = document.createElement("label");
avatarInputLabel.textContent = "Put avatar URL in here: ";
avatarInputContainer.appendChild(avatarInputLabel);

const avatarInput = document.createElement("input");
avatarInput.type = "text";
avatarInput.placeholder = "Enter avatar URL";
avatarInput.value = avatarURL;
avatarInputContainer.appendChild(avatarInput);

const saveAvatarButton = document.createElement("button");
saveAvatarButton.textContent = "Save Avatar URL";
saveAvatarButton.style.cssText = "margin-left: 10px;";
saveAvatarButton.onclick = () => {
    avatarURL = avatarInput.value || 'https://i.imgur.com/kLTnvfM.png'; // Use default if empty
};
avatarInputContainer.appendChild(saveAvatarButton);

messageContainer.appendChild(avatarInputContainer);

// Create the input area for messages
const inputArea = document.createElement("input");
inputArea.placeholder = "Enter your message";
inputArea.style.cssText = "width: 75%; flex-grow: 1; padding: 8px; border-radius: 4px; background: rgba(0,0,0,.1); color: white;";
messageContainer.appendChild(inputArea);

// Send button
const sendButton = document.createElement("button");
sendButton.textContent = "Send";
sendButton.className = "send-button";
messageContainer.appendChild(sendButton);

chatDiv.appendChild(messageContainer);

const messageArea = document.createElement("div");
messageArea.style.cssText = "flex-grow: 1; overflow: auto; margin: 5px; padding: 5px; background: rgba(0,0,0,.1); color: white;";
chatDiv.appendChild(messageArea);

// Function to handle sending messages
function sendMessage() {
    const message = {
        name: getUsernameFromStorage().trim() || "Anonymous",
        text: inputArea.value.trim(),
        avatar: avatarURL // Use the avatar URL
    };

    if (message.text) {
        ws.send(JSON.stringify(message));
        inputArea.value = ""; // Clear input after sending
        simulateButtonClick(); // Visual feedback for button press
    }
}

function simulateButtonClick() {
    sendButton.classList.add("active");
    setTimeout(() => {
        sendButton.classList.remove("active");
    }, 100);
}

sendButton.addEventListener("click", sendMessage);
inputArea.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

inputArea.addEventListener("keydown", function (event) {
    if (event.key === " ") {
        event.stopPropagation(); // Prevent spacebar from affecting gameplay
    }
});

// Setup WebSocket connection using the WebSocket API available in the browser
const ws = new WebSocket('wss://newjackchat2.glitch.me');

ws.onopen = function() {
    console.log("Connected to the WebSocket server!");
    // You can send messages to the server here if necessary
    ws.send(JSON.stringify({ type: 'greeting', message: 'Hello Server!', avatar: avatarURL })); // Use the retrieved avatar URL
};

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log("Message from server:", message);

    if (message.type === 'newDream') {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const formattedTime = `${hours}:${minutes}`;

        displayMessage(message.name, message.text, message.avatar, formattedTime);
    }
};

ws.onclose = function() {
    console.log("Disconnected from the WebSocket server.");
};

ws.onerror = function(error) {
    console.error("WebSocket error:", error);
};

// Updated displayMessage function
function displayMessage(name, text, avatar, time) {
    const messageElement = document.createElement("div");
    messageElement.style.cssText = "padding: 5px; border-bottom: 1px solid #ccc; display: flex; align-items: center;";

    const avatarImg = document.createElement("img");
    avatarImg.src = avatar;
    avatarImg.style.width = "30px";
    avatarImg.style.height = "30px";
    avatarImg.style.marginRight = "10px";
    avatarImg.style.verticalAlign = "middle";

    const timestampSpan = document.createElement("span");
    timestampSpan.style.cssText = "color: #888; margin-right: 10px;";
    timestampSpan.textContent = time;

    const usernameSpan = document.createElement("span");
    usernameSpan.style.cssText = "font-weight: bold; margin-right: 5px;";
    usernameSpan.textContent = name + ":";

    messageElement.appendChild(avatarImg);
    messageElement.appendChild(timestampSpan);
    messageElement.appendChild(usernameSpan);

    if (/\.(jpeg|jpg|gif|png|svg)$/i.test(text)) {
        const image = document.createElement("img");
        image.src = text;
        image.style.maxWidth = "75px";
        image.style.maxHeight = "75px";
        image.alt = "Sent image";
        image.onerror = function () {
            image.parentNode.removeChild(image);
            const errorText = document.createElement("span");
            errorText.textContent = " [Invalid image URL]";
            messageElement.appendChild(errorText);
        };
        messageElement.appendChild(image);
    } else {
        const messageText = document.createElement("span");
        messageText.textContent = text;
        messageElement.appendChild(messageText);
    }

    messageArea.appendChild(messageElement);
    setTimeout(() => {
        if (messageArea.contains(messageElement)) {
            messageArea.removeChild(messageElement);
        }
    }, 60000);
}

document.addEventListener("auxclick", function (e) {
    if (e.button === 1 && e.detail === 2) {
        chatDiv.style.display = "flex";
    }
});
