const bubble1 = {
  "type": "bubble",
  "body": {
    "type": "box",
    "layout": "vertical",
    "paddingAll": "2px",
    "contents": [
      { "type": "text", "text": "10 kW", "size": "xxs", "color": "#10B981" },
      { "type": "text", "text": "Solar System", "size": "md", "weight": "bold" },
      { "type": "text", "text": "฿1500000", "size": "sm" }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "paddingAll": "2px",
    "contents": [
      {
        "type": "button",
        "style": "primary",
        "height": "sm",
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
  "contents": [bubble1, bubble1, bubble1]
};

console.log("Size:", JSON.stringify(flexMessage).length, "bytes");
console.log("JSON:", JSON.stringify(flexMessage));
