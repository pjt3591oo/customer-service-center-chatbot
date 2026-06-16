---
name: Serene Dialogue
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#424754'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#595c5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#727577'
  on-tertiary-container: '#fbfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  chat-bubble:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 1rem
  bubble-padding-x: 1rem
  bubble-padding-y: 0.75rem
  stack-gap-sm: 0.5rem
  stack-gap-md: 1rem
  card-padding: 1.25rem
  max-width-mobile: 100%
---

## Brand & Style

The design system is centered on a **Modern / Corporate** aesthetic that leans into a "Friendly Professionalism." It is designed for users seeking efficient, intelligent assistance without the coldness often associated with enterprise software. 

The visual language emphasizes clarity and approachability through ample whitespace, soft surfaces, and a systematic approach to depth. By combining high-legibility typography with a calming color palette, the UI fosters a sense of reliability and ease. The emotional response should be one of "effortless support"—where the technology recedes to highlight the conversation.

## Colors

The palette is anchored by a vibrant yet soft Primary Blue, used for main calls to action and user-state indicators. The Secondary Slate Gray provides a grounded, neutral framework for text and structural borders. 

- **Primary (#3B82F6):** Used for user message bubbles, primary action buttons, and active toggle states.
- **Secondary (#64748B):** Reserved for supporting text, icons, and non-interactive UI elements.
- **Backgrounds:** The interface utilizes a tiered system of off-whites (Tertiary) to separate the chat canvas from the input area and action cards.
- **Message Contrast:** User messages utilize the Primary color with white text, while Bot messages use a light neutral background with dark text to differentiate the two parties clearly.

## Typography

This design system utilizes **Inter** for its exceptional legibility on mobile screens and its neutral, modern character. 

Hierarchy is established primarily through font weight and subtle color shifts rather than dramatic size changes. For conversational elements, the `chat-bubble` token is optimized for long-form reading within confined horizontal spaces. Headlines are tight and bold to provide clear landmarks, while labels use slightly increased letter spacing to ensure clarity at small sizes.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile-first interaction. 

- **Chat Canvas:** Uses a standard 16px (1rem) safe-area margin on both sides.
- **Message Stacking:** Messages from the same sender have a 4px gap, while transitions between different senders use a 16px gap to visually group thoughts.
- **Action Cards:** These elements span the full width of the chat container minus the side margins.
- **Input Area:** Fixed to the bottom of the viewport with a dynamic height that expands up to four lines of text before scrolling internally.

## Elevation & Depth

Depth is used sparingly to maintain a "clean" feel. The system relies on **Ambient Shadows** and **Tonal Layers** rather than heavy outlines.

- **Level 0 (Floor):** The main background of the chat app (#FFFFFF).
- **Level 1 (Subtle):** Action cards use a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to appear slightly lifted from the background.
- **Level 2 (Active):** The message input bar and primary action buttons use a more defined shadow to signal interactability and importance.
- **Surface Tints:** Bot messages use a slight tint (#F1F5F9) to sit "behind" the user's Primary color bubbles in terms of visual weight.

## Shapes

The design system adopts a **Rounded** shape language to reinforce the "Friendly" aspect of the brand. 

Standard components like buttons and cards use a 0.5rem (8px) radius. However, message bubbles use a more pronounced 1.25rem (20px) radius to create the "bubble" effect. Asymmetric rounding is applied to chat bubbles—the corner pointing toward the sender's side of the screen is sharpened to 4px to act as a directional "tail."

## Components

### Message Bubbles
- **User:** Background `primary_color_hex`, Text white. Right-aligned.
- **Bot:** Background `tertiary_color_hex`, Text `neutral_color_hex`. Left-aligned.

### Action Cards
These are used for structured data or rich suggestions.
- **Container:** Background white, Border 1px solid `tertiary_color_hex`.
- **Iconography:** Use 20px glyphs in `primary_color_hex` contained within a 32px circular light-blue wash.
- **Interaction:** On tap, the card background shifts to `tertiary_color_hex` for tactile feedback.

### Input Field
- **Structure:** A pill-shaped container with a subtle shadow. 
- **Actions:** The "Send" button is a 40px circle with a white icon on a `primary_color_hex` background, positioned to the right of the text input.

### Quick Replies (Chips)
- **Style:** Small, horizontal scrolling pills.
- **Border:** 1.5px solid `primary_color_hex` with 40% opacity.
- **Text:** `primary_color_hex`, semi-bold.

### Checkboxes & Radios
- **Visuals:** Standard geometric shapes with 4px corner radius for checkboxes and full circles for radios. When selected, they fill with the Primary color and animate a white check/dot.