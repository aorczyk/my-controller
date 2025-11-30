
# My Controller - micro:bit Extension

> Control your micro:bit via Bluetooth from a mobile app

A MakeCode extension that enables wireless control of your micro:bit through a mobile app using Bluetooth UART. Create custom controller interfaces with buttons, sliders, joysticks, and orientation sensors.

## Features

- 📱 **Button Controls** - Receive button presses and releases from your mobile device
- 🎚️ **Sliders** - Read analog slider values for smooth input control
- 🕹️ **Joysticks** - Get X and Y joystick positions for directional input
- 🧭 **Orientation** - Monitor device orientation (X, Y, Z axes and compass)
- 🎨 **Custom Layouts** - Configure button colors, labels, and visibility
- 📤 **Export/Import** - Export controller configurations from the app and import them directly into your code

## Getting Started

### Installation

This repository can be added as an **extension** in MakeCode:

1. Open [https://makecode.microbit.org/](https://makecode.microbit.org/)
2. Click on **New Project**
3. Click on **Extensions** under the gearwheel menu
4. Search for **https://github.com/aorczyk/my-controller** and import

### Basic Usage

```typescript
// Handle button presses
myController.onVCcommand(function () {
    if (myController.isKey("a", KeyState.Pressed)) {
        basic.showString("A")
    }
    if (myController.isKey("a", KeyState.Released)) {
        basic.clearScreen()
    }
})
```

### Setup Controller Interface

```typescript
// Configure your controller layout
myController.onVCsetup(true, function () {
    myController.setButton("1", KeyVisibility.Visible, KeyColor.Green, "A")
    myController.setButton("up", KeyVisibility.Visible, KeyColor.Red)
})
```

## API Reference

### Setup

#### `onVCsetup(requireConfirmation, handler)`
Configures the controller interface when the app connects.

**Parameters:**
- `requireConfirmation` (boolean) - When `true`, the app displays a confirmation dialog before applying settings.
- `handler` (function) - Code to run during setup.

**Tip:** You can paste exported configuration code from the controller app directly into this function in the MakeCode JavaScript mode.

#### `setButton(code, visibility, color, label)`
Configures a button's appearance in the controller app.

**Parameters:**
- `code` (string) - Button code (e.g., "a", "b", "up", "down")
- `visibility` (KeyVisibility) - `Visible` or `Hidden`
- `color` (KeyColor) - `Black`, `Green`, `Blue`, `Yellow`, or `Red`
- `label` (string|number) - Optional text or number to display on the button. Could be also html code from Fontawesome icons.

### Button Input

#### `isKey(keyCode, keyState)`
Returns `true` if the specified button is in the chosen state.

**Parameters:**
- `keyCode` (string) - Button code to check
- `keyState` (KeyState) - `Pressed` or `Released`

#### `areAllKeysReleased()`
Returns `true` when all buttons have been released.

#### `getKeyCodeValue(keyCode)`
Returns the string code for special keys (Arrow Up, Arrow Down, Arrow Right, Arrow Left, Enter, Space).

### Utility

#### `buttonToggled()`
Returns `true` if the button toggles on, `false` if it toggles off. Maintains toggle state for each button based on the most recently pressed button code.

#### `buttonToggleCount(toggleMaxCount)`
Returns the current toggle count (0 to max). Each press increments the counter until it reaches the maximum, then resets to 0. Maintains toggle state based on the most recently pressed button code.

**Parameters:**
- `toggleMaxCount` (number) - Maximum count value before resetting to 0

### Sliders

#### `isSlider(inputSide)`
Returns `true` if the specified slider value has changed.

**Parameters:**
- `inputSide` (InputSide) - `Right` or `Left`

### Joysticks

#### `isJoystick(inputSide, inputDirection)`
Returns `true` if the specified joystick axis has changed.

**Parameters:**
- `inputSide` (InputSide) - `Right` or `Left`
- `inputDirection` (JoystickDirection) - `X` or `Y`

### Orientation

#### `isOrientation(inputOrient)`
Returns `true` if the specified orientation axis has changed.

**Parameters:**
- `inputOrient` (InputOrientaton) - `X`, `Y`, `Z`, or `Compass`

### Commands

#### `getCommandName()`
Returns the name of the most recently received command.

#### `getCommandValue()`
Returns the value of the most recently received command.

## Examples

### Toggle Button

```typescript
myController.onVCcommand(function () {
    if (myController.isKey("a", KeyState.Pressed)) {
        if (myController.buttonToggled()) {
            basic.showIcon(IconNames.Yes)
        } else {
            basic.showIcon(IconNames.No)
        }
    }
})
```

### Multi-State Button

```typescript
myController.onVCcommand(function () {
    if (myController.isKey("b", KeyState.Pressed)) {
        let state = myController.buttonToggleCount(3)
        basic.showNumber(state)
    }
})
```

## Requirements

- **Bluetooth** must be enabled on both the micro:bit and mobile device
- **UART Bluetooth service** is automatically started by the extension

## License

MIT

## Supported Targets

- PXT/microbit

---

> Open this page at [https://aorczyk.github.io/my-controller/](https://aorczyk.github.io/my-controller/)

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
