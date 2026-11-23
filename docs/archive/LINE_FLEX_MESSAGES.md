# LINE Flex Message Documentation

## LINE API Spec Rules

### Critical Rules
- **box**: requires `contents: []` array (empty array is valid)
- **text**: use EITHER `text` property OR `contents` (for spans) — NOT both
- **hero.image**: uses `url` property (NOT `originalContentUrl`)
- **body.image**: uses `url` property (same as hero)
- **text with spans**: use `contents: [{ type: 'span', ... }]` array

### Optional Properties

#### Text Component
- `lineSpacing`: Control line spacing in wrapping text (e.g., '20px')
- `maxLines`: Max number of lines (0 = unlimited)
- `weight`: 'regular' or 'bold'
- `decoration`: 'none', 'underline', 'line-through'
- `style`: 'normal' or 'italic'
- `scaling`: true for auto-shrink font to fit width

#### Box Component
- `background`: supports `linearGradient` with `startColor`, `endColor`, `centerColor`, `angle`, `centerPosition`
- `position`: 'relative' (default) or 'absolute'
- `offsetTop`, `offsetBottom`, `offsetStart`, `offsetEnd`: pixel values for absolute positioning
- `paddingAll`, `paddingTop`, `paddingStart`, `paddingEnd`, `paddingBottom`: box padding

#### Image Component
- `animated`: true for APNG animation (max 300KB)
- `num_plays`: animation repeat count (0 = infinite)

#### Hero Block
- `type: 'image'`: uses `url`
- `type: 'video'`: uses `url` + `previewUrl` + `altContent`

#### Block Styles (styles on bubble)
- `header`, `hero`, `body`, `footer`: each can have:
  - `backgroundColor`: hex color
  - `separator`: true/false (show line above block)
  - `separatorColor`: hex color for separator line

### Component Hierarchy
```
flex
├── altText (required)
└── contents (bubble or carousel)
    ├── bubble
    │   ├── styles (optional)
    │   ├── header (box)
    │   ├── hero (image or video)
    │   ├── body (box)
    │   └── footer (box)
    └── carousel
        └── contents (bubble[])
```

### Box Layout
- `horizontal`: renders children left-to-right
- `vertical`: renders children top-to-bottom
- `baseline`: aligns text/icon on baseline

### Spacing Keywords
`none`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`

### Margin Keywords
`none`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`

## Common Patterns

### Hero Image
```json
{
  "type": "bubble",
  "hero": {
    "type": "image",
    "url": "https://...",
    "size": "full",
    "aspectRatio": "1.51:1",
    "aspectMode": "cover"
  }
}
```

### Hero Video
```json
{
  "type": "bubble",
  "hero": {
    "type": "video",
    "url": "https://example.com/video.mp4",
    "previewUrl": "https://example.com/preview.jpg",
    "altContent": {
      "type": "image",
      "url": "https://example.com/fallback.jpg",
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover"
    },
    "aspectRatio": "20:13"
  }
}
```

### Box with Linear Gradient
```json
{
  "type": "box",
  "layout": "vertical",
  "contents": [],
  "background": {
    "type": "linearGradient",
    "angle": "90deg",
    "startColor": "#FFFF00",
    "endColor": "#0080ff"
  }
}
```

### Box with Absolute Positioning
```json
{
  "type": "box",
  "layout": "horizontal",
  "contents": [
    { "type": "text", "text": "TARGET" }
  ],
  "position": "absolute",
  "offsetTop": "10px",
  "offsetStart": "40px"
}
```

### Text with Spans
```json
{
  "type": "text",
  "contents": [
    { "type": "span", "text": "Hello", "weight": "bold" },
    { "type": "span", "text": " world", "color": "#FF0000" }
  ],
  "wrap": true
}
```

### Text with Line Spacing
```json
{
  "type": "text",
  "text": "Line 1\nLine 2\nLine 3",
  "wrap": true,
  "lineSpacing": "20px"
}
```

### Text with Decoration
```json
{
  "type": "span",
  "text": "underline me",
  "decoration": "underline"
}
```

### Animated Image (APNG)
```json
{
  "type": "image",
  "url": "https://example.com/animated.png",
  "animated": true,
  "num_plays": 0
}
```

### Block Styles with Separator
```json
{
  "type": "bubble",
  "styles": {
    "header": { "backgroundColor": "#00ffff" },
    "hero": { "separator": true, "separatorColor": "#000000" },
    "footer": { "backgroundColor": "#00ffff", "separator": true }
  }
}
```

### Image in Body
```json
{
  "type": "image",
  "url": "https://example.com/image.jpg",
  "size": "sm",
  "aspectRatio": "1:1",
  "aspectMode": "cover"
}
```

### Icon Component
```json
{
  "type": "icon",
  "url": "https://example.com/star.png",
  "size": "sm",
  "aspectRatio": "1.91:1"
}
```

## Test Commands
```bash
npm run test:flex    # Run flex message validation tests
```

## LINE Flex Simulator
https://developers.line.biz/en/docs/messaging-api/flex-message-simulator/

## References
- https://developers.line.biz/en/docs/messaging-api/flex-message-elements/
- https://developers.line.biz/en/docs/messaging-api/flex-message-layout/
- https://developers.line.biz/en/reference/messaging-api/