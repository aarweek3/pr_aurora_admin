# Technical Specification: AvSpinner Component (v2.0)

## 1. Overview

The `AvSpinner` is a high-performance, accessible loading indicator. It supports multiple animation styles, customizable overlays, and smart visibility logic to provide a premium user experience.

## 2. Component Interface (Inputs)

| Property          | Type                                                                                            | Default     | Description                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `size`            | `'tiny' \| 'small' \| 'default' \| 'large' \| 'huge' \| number`                                 | `'default'` | Size in presets or literal pixels (if number).                     |
| `color`           | `'primary' \| 'success' \| 'warning' \| 'error' \| 'neutral' \| 'white' \| 'inherit' \| string` | `'primary'` | Color scheme. `inherit` takes color from parent.                   |
| `animation`       | `'spin' \| 'pulse' \| 'none'`                                                                   | `'spin'`    | Animation type. `spin` is rotation, `pulse` is opacity/scale fade. |
| `label`           | `string`                                                                                        | `''`        | Main text (e.g., "Loading").                                       |
| `tip`             | `string`                                                                                        | `''`        | Secondary small text under the label.                              |
| `labelPosition`   | `'bottom' \| 'right'`                                                                           | `'bottom'`  | Label placement.                                                   |
| `overlay`         | `boolean`                                                                                       | `false`     | Contextual overlay (requires parent with `relative`).              |
| `fullScreen`      | `boolean`                                                                                       | `false`     | Fixed full-viewport overlay.                                       |
| `backdropOpacity` | `number`                                                                                        | `0.6`       | Transparency of the backdrop (0 to 1).                             |
| `backdropBlur`    | `number`                                                                                        | `2`         | Blur amount in px (for `backdrop-filter`).                         |
| `delay`           | `number`                                                                                        | `0`         | Delay in ms before becoming visible (prevents layout flickering).  |
| `strokeWidth`     | `number`                                                                                        | `undefined` | Thickness of the spinner line (defaults scaled by size).           |
| `zIndex`          | `number`                                                                                        | `1000`      | Z-index for overlay/fullScreen modes.                              |

## 3. Visual & Animation Logic

### Spin Animation (Default)

SVG circle with `stroke-dasharray` and `stroke-dashoffset` animated via `@keyframes`.

- **Primary**: Smooth 0.8s rotation.

### Pulse Animation

The entire component fades in/out and subtly scales. Ideal for small inline indicators (e.g., "Saving...").

### Sizing Scale

- `tiny`: 14px (1.5px stroke)
- `small`: 20px (2px stroke)
- `default`: 32px (3px stroke)
- `large`: 48px (4px stroke)
- `huge`: 80px (6px stroke)

## 4. Advanced Features

### Smart Visibility (Delay)

The component should use a timer-based visibility flag. If the process finishes before the `delay` expires, the spinner never flashes in the DOM.

### Color Inheritance

When `color="inherit"`, the SVG `stroke` should be set to `currentColor`, allowing it to match parent text color (perfect for buttons).

## 5. Accessibility (A11y)

- Automatically adds `role="status"` and `aria-live="polite"`.
- Uses `aria-busy="true"` on the parent container if `overlay` is active.
- Visible label reflects in `aria-label`.

## 6. Implementation Scenarios

### 1. In-Button Loading

```html
<button av-button avType="primary">
  @if (loading()) {
  <av-spinner size="small" color="inherit" style="margin-right: 8px"></av-spinner>
  } Submit
</button>
```

### 2. Table Row-Level Loading

```html
<tr style="position: relative;">
  @if (rowLoading()) {
  <av-spinner [overlay]="true" [backdropBlur]="0" [backdropOpacity]="0.4" size="small"></av-spinner>
  }
  <td>...</td>
</tr>
```

### 3. Full Screen Initializing

```html
<av-spinner
  [fullScreen]="true"
  [delay]="500"
  label="System is waking up..."
  tip="This may take a few seconds"
  [backdropBlur]="10"
></av-spinner>
```

## 7. Quality Assurance (Testing Requirements)

- **Visual**: Verify stroke scaling relative to custom `number` sizes.
- **Timing**: Ensure `delay` logic prevents rendering on fast toggles.
- **Theme**: Check contrast in both Light and Dark modes.
- **A11y**: Inspect `aria-live` regions in dev tools.
