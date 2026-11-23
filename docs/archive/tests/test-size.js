const bubble1 = {
  "type": "bubble",
  "body": {
    "type": "box",
    "layout": "vertical",
    "paddingAll": "12px",
    "spacing": "xs",
    "contents": [
      {
        "type": "text",
        "text": "Test bubble"
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "paddingAll": "12px",
    "spacing": "xs",
    "contents": [
      {
        "type": "button",
        "style": "primary",
        "height": "md",
        "action": {
          "type": "message",
          "label": "Test",
          "text": "Test"
        }
      }
    ]
  }
};

const flexMessage = {
  "type": "carousel",
  "contents": [bubble1, bubble1, bubble1, bubble1, bubble1, bubble1]
};

console.log("Size:", JSON.stringify(flexMessage).length, "bytes");
console.log("JSON:", JSON.stringify(flexMessage));
