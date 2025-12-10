# My Controller

> Control your micro:bit wirelessly via Bluetooth or USB from an app [my micro:bit](https://mymicrobit.medlight.pl/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![micro:bit](https://img.shields.io/badge/micro%3Abit-v2-blue)](https://microbit.org/)
[![MakeCode](https://img.shields.io/badge/MakeCode-Extension-orange)](https://makecode.microbit.org/)

A powerful MakeCode extension that enables control of your micro:bit through an app [my micro:bit](https://mymicrobit.medlight.pl/) using Bluetooth UART or WebUSB. Create custom controller interfaces with buttons, sliders, joysticks, and orientation sensors.

## ✨ Features

- 🎮 **Button Controls** - Receive button presses and releases from your mobile device
- 🎚️ **Sliders** - Read analog slider values for smooth input control
- 🕹️ **Joysticks** - Get X and Y joystick positions for directional input
- 🧭 **Orientation Sensors** - Monitor device orientation (X, Y, Z axes and compass)
- 🎨 **Custom Layouts** - Configure button colors, labels, and visibility
- 📤 **Export/Import** - Export controller configurations from the app and paste directly into your code
- 🔄 **Toggle States** - Built-in support for button toggle and multi-state buttons

## 🚀 Getting Started

### Installation

Add this extension to your MakeCode project:

1. Open [https://makecode.microbit.org/](https://makecode.microbit.org/)
2. Click **New Project**
3. Click **Extensions** (gear icon menu)
4. Search for `https://github.com/aorczyk/my-controller`
5. Click to import

### Quick Start

```typescript
// Handle button presses
myController.onCommand(function () {
    if (myController.isKey("1", KeyState.Pressed)) {
        basic.showString("A")
    }
    if (myController.isKey("1", KeyState.Released)) {
        basic.clearScreen()
    }
})
```

## 📚 API Reference

### Setup & Configuration

#### `onSetup(requireConfirmation, handler)`

Configures the controller interface when the mobile app connects.

**Parameters:**
- `requireConfirmation` (SetupConfirmation) - `Require` or `NoRequire`. When set to `Require`, the app displays a confirmation dialog before applying settings.
- `handler` (function) - Code to run during setup, typically containing `setButton()` calls

**Example:**
```typescript
myController.onSetup(SetupConfirmation.Require, function () {
    myController.setButton("1", KeyVisibility.Visible, KeyColor.Green, "↑")
    myController.setButton("2", KeyVisibility.Visible, KeyColor.Green, "↓")
})
```

> 💡 **Tip:** You can paste exported configuration code from the controller app website directly into this function!

#### `setButton(code, visibility, color, label)`

Configures a button's appearance in the controller app.

**Parameters:**
- `code` (string) - Button code (e.g., "a", "b", "up", "down", "space")
- `visibility` (KeyVisibility) - `Visible` or `Hidden`
- `color` (KeyColor) - `Black`, `Green`, `Blue`, `Yellow`, or `Red`
- `label` (string|number) - Optional text or number to display on the button

### Button Input

#### `isKey(keyCode, keyState)`

Returns `true` if the specified button is in the chosen state.

**Parameters:**
- `keyCode` (string) - Button code to check
- `keyState` (KeyState) - `Pressed` or `Released`

**Example:**
```typescript
if (myController.isKey("a", KeyState.Pressed)) {
    // Button A is pressed
}
```

#### `areAllKeysReleased()`

Returns `true` when all buttons have been released.

#### `getKeyCodeValue(keyCode)`

Returns the string code for special keys.

**Special Keys:**
- `KeyCode.ArrowUp` → "up"
- `KeyCode.ArrowDown` → "down"
- `KeyCode.ArrowRight` → "right"
- `KeyCode.ArrowLeft` → "left"
- `KeyCode.Enter` → "enter"
- `KeyCode.Space` → "space"

### Utility Functions

#### `buttonToggled()`

Returns `true` if the button toggles on, `false` if it toggles off. Maintains individual toggle state for each button.

**Example:**
```typescript
myController.onCommand(function () {
    if (myController.isKey("a", KeyState.Pressed)) {
        if (myController.buttonToggled()) {
            basic.showIcon(IconNames.Yes)
        } else {
            basic.showIcon(IconNames.No)
        }
    }
})
```

#### `buttonToggleCount(maxCount)`

Returns the current toggle count (0 to maxCount). Each press increments the counter until it reaches the maximum, then resets to 0.

**Parameters:**
- `maxCount` (number) - Maximum count before reset (default: 1)

**Example:**
```typescript
if (myController.isKey("b", KeyState.Pressed)) {
    let state = myController.buttonToggleCount(3) // Cycles: 0→1→2→3→0
    basic.showNumber(state)
}
```

### Analog Inputs

#### `isSlider(inputSide)`

Returns `true` if the specified slider value has changed.

**Parameters:**
- `inputSide` (InputSide) - `Right` or `Left`

#### `isJoystick(inputSide, direction)`

Returns `true` if the specified joystick axis has changed.

**Parameters:**
- `inputSide` (InputSide) - `Right` or `Left`
- `direction` (JoystickDirection) - `X` or `Y`

#### `isOrientation(axis)`

Returns `true` if the specified orientation axis has changed.

**Parameters:**
- `axis` (InputOrientaton) - `X`, `Y`, `Z`, or `Compass`

### Command Information

#### `getCommandName()`

Returns the name of the most recently received command.

#### `getCommandValue()`

Returns the value of the most recently received command (for analog inputs).

## 💡 Examples

### Simple Game Controller

```typescript
myController.onSetup(SetupConfirmation.Require, function () {
    myController.setButton("w", KeyVisibility.Visible, KeyColor.Green, "↑")
    myController.setButton("s", KeyVisibility.Visible, KeyColor.Green, "↓")
    myController.setButton("a", KeyVisibility.Visible, KeyColor.Green, "←")
    myController.setButton("d", KeyVisibility.Visible, KeyColor.Green, "→")
    myController.setButton("space", KeyVisibility.Visible, KeyColor.Red, "Fire")
})

myController.onCommand(function () {
    if (myController.isKey("w", KeyState.Pressed)) {
        // Move forward
        basic.showArrow(ArrowNames.North)
    }
    if (myController.isKey("s", KeyState.Pressed)) {
        // Move backward
        basic.showArrow(ArrowNames.South)
    }
    if (myController.isKey("space", KeyState.Pressed)) {
        // Fire weapon
        basic.showIcon(IconNames.Target)
    }
})
```

### LED Control with Toggle

```typescript
let ledState = false

myController.onCommand(function () {
    if (myController.isKey("l", KeyState.Pressed)) {
        ledState = myController.buttonToggled()
        if (ledState) {
            led.plot(2, 2)
        } else {
            led.unplot(2, 2)
        }
    }
})
```

### Multi-Mode Controller

```typescript
myController.onCommand(function () {
    if (myController.isKey("m", KeyState.Pressed)) {
        let mode = myController.buttonToggleCount(3)
        if (mode == 0) {
            basic.showString("OFF")
        } else if (mode == 1) {
            basic.showString("LOW")
        } else if (mode == 2) {
            basic.showString("MED")
        } else if (mode == 3) {
            basic.showString("HIGH")
        }
    }
})
```

### Slider Control

```typescript
myController.onCommand(function () {
    if (myController.isSlider(InputSide.Right)) {
        let brightness = myController.getCommandValue()
        led.setBrightness(brightness)
    }
})
```

## 📋 Requirements

- **micro:bit v2** (with Bluetooth support)
- **Bluetooth enabled** on both micro:bit and mobile device
- **UART Bluetooth service** (automatically started by the extension)
- **Compatible mobile app** for controller interface

## 🗂️ Block Categories

Blocks are organized into intuitive groups in MakeCode:

- **Setup** - Configure controller interface and button layouts
- **Buttons** - Button press/release detection
- **Inputs** - Sliders, joysticks, and orientation sensors
- **Utility** - Toggle states and helper functions

## 🔧 Technical Details

- Uses **Bluetooth UART service** for communication
- Supports **custom button layouts** with up to 5 colors
- **Export/Import functionality** for easy configuration sharing
- Maintains **individual state** for each button toggle
- **Non-blocking event-driven** architecture

## 📖 Documentation

For more detailed documentation and tutorials, visit the [project wiki](https://github.com/aorczyk/my-controller/wiki).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Supported Targets

- **micro:bit** (v2 recommended)
- **PXT/MakeCode**

## 🔗 Links

- [MakeCode Editor](https://makecode.microbit.org/)
- [micro:bit Website](https://microbit.org/)
- [Issue Tracker](https://github.com/aorczyk/my-controller/issues)

---

> 📱 Open this page at [https://aorczyk.github.io/my-controller/](https://aorczyk.github.io/my-controller/)

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
