# 🏆 LINE Flex Message: 100% Technical Reference & Roadmap

This document serves as the master technical reference for upgrading Tawan Power's LINE interface from a prototype to a premium professional system.

---

## 📚 1. Technical Code Examples (Master Specs)

### 🎨 A. Backgrounds & Gradients
Use `linearGradient` to create depth.
```json
{
  "type": "box",
  "layout": "vertical",
  "background": {
    "type": "linearGradient",
    "angle": "135deg",
    "startColor": "#003366",
    "endColor": "#10B981"
  },
  "contents": []
}
```

### 🖋️ B. Rich Text (Spans)
Combine different styles in a single line.
```json
{
  "type": "text",
  "contents": [
    { "type": "span", "text": "Saving: ", "color": "#999999", "size": "sm" },
    { "type": "span", "text": "฿5,000", "weight": "bold", "color": "#D4AF37", "size": "xl" },
    { "type": "span", "text": " /month", "style": "italic", "color": "#999999", "size": "xs" }
  ]
}
```

### 🚀 C. Absolute Positioning
Overlay elements (e.g., price badges, status tags).
```json
{
  "type": "box",
  "layout": "vertical",
  "position": "absolute",
  "offsetTop": "10px",
  "offsetEnd": "10px",
  "backgroundColor": "#D4AF37CC",
  "cornerRadius": "md",
  "paddingAll": "sm",
  "contents": [
    { "type": "text", "text": "PREMIUM", "color": "#FFFFFF", "size": "xxs", "weight": "bold" }
  ]
}
```

### 📹 D. Video Component (Hero Block)
Engage users with real footage.
```json
{
  "type": "video",
  "url": "https://tawanpower.vercel.app/videos/installation.mp4",
  "previewUrl": "https://tawanpower.vercel.app/images/video-thumb.jpg",
  "altContent": {
    "type": "image",
    "url": "https://tawanpower.vercel.app/images/hero.jpg",
    "size": "full",
    "aspectRatio": "20:13",
    "aspectMode": "cover"
  },
  "aspectRatio": "20:13"
}
```

### 📅 E. DateTimePicker
Native date selection for site surveys.
```json
{
  "type": "button",
  "style": "primary",
  "action": {
    "type": "datetimepicker",
    "label": "📅 Book Site Survey",
    "data": "action=book_survey",
    "mode": "datetime"
  }
}
```

---

## 🗺️ 2. Roadmap to 100% Functionality

### Phase 1: Foundation Styling (Quick Wins)
- [ ] **Gradients**: Replace solid green buttons and headers with "Andaman Gradients".
- [ ] **Rich Spans**: Refactor all price and saving displays to use multi-style spans.
- [ ] **Baseline Alignment**: Fix icon + text alignment using the `baseline` layout.

### Phase 2: Structural Mastery (Pro Layout)
- [ ] **Absolute Badges**: Add "Best Seller" and "Eco-Choice" floating badges to product images.
- [ ] **Custom Corner Radii**: Standardize all bubbles to `24px` radius for a modern feel.
- [ ] **Shrink-to-fit**: Enable auto-scaling for long product titles.

### Phase 3: Interactive & Media (The "Wow" Effect)
- [ ] **Video Integration**: Add 10s installation loops to system detail cards.
- [ ] **Native Picker**: Implement `dateTimePicker` for the "Request Survey" flow.
- [ ] **Location Action**: Allow users to send their precise GPS coordinates for logistics.

### Phase 4: Full Ecosystem Redesign
- [ ] **The "App-like" Welcome**: A giga-sized welcome card with a feature grid.
- [ ] **Comparison Carousel**: 12-item carousel for detailed system comparison.
- [ ] **Post-Lead Receipt**: An absolute-positioned "official receipt" card.

---

## 🧪 3. Validation & Testing Strategy

### Step 1: Design Confirmation
For every new template, I will generate a **JSON Snapshot**. You can paste this into the [LINE Flex Message Simulator](https://developers.line.biz/flex-simulator/) to verify the look on your phone before I commit the code.

### Step 2: Logic Verification
I will create a hidden test route: `/api/test-line-design`.
- Calling this route with your `userId` will send the "Draft" design directly to your LINE.
- We will verify that buttons, postbacks, and data extraction work in a real environment.

### Step 3: Progressive Rollout
We will update functions one by one:
1. `createWelcomeMessage` (First impression)
2. `createCatalogCarousel` (Commercial impact)
3. `createLeadConfirmMessage` (Trust builder)
