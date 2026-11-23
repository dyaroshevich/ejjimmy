const bubble1 = {
  "type": "bubble",
  "body": {
    "type": "box",
    "layout": "vertical",
    "paddingAll": "4px",
    "contents": [
      { "type": "text", "text": "10 kW", "size": "xxs", "color": "#10B981", "weight": "bold" },
      { "type": "text", "text": "Solar System", "size": "md", "weight": "bold" },
      { "type": "text", "text": "฿1500000", "size": "sm", "weight": "bold" },
      { "type": "text", "text": "ประหยัด 50000/เดือน", "size": "xxs", "color": "#10B981", "weight": "bold" },
      { "type": "text", "text": "ผ่อน 10000/เดือน ไม่มีดอกเบี้ย", "size": "xxs", "color": "#64748B" }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "paddingAll": "4px",
    "contents": [
      {
        "type": "button",
        "style": "primary",
        "height": "sm",
        "action": {
          "type": "message",
          "label": "จองสิทธิ์",
          "text": "สนใจ Solar System ครับ"
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
