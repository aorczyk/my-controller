# My Controller

> Control your micro:bit wirelessly via Bluetooth or USB from an app [my micro:bit](https://mymicrobit.medlight.pl/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![micro:bit](https://img.shields.io/badge/micro%3Abit-v2-blue)](https://microbit.org/)
[![MakeCode](https://img.shields.io/badge/MakeCode-Extension-orange)](https://makecode.microbit.org/)

A powerful MakeCode extension that enables control of your micro:bit through an app [my micro:bit](https://mymicrobit.medlight.pl/) using Bluetooth or WebUSB. Create custom controller interfaces with buttons, sliders, joysticks, and orientation sensors.

## ✨ Features

- 🎮 **Button Controls** - Receive button presses and releases from your mobile device or computer
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
        led.plot(2, 2)
    }
    if (myController.isKey("1", KeyState.Released)) {
        led.unplot(2, 2)
    }
})
```

## 📚 API Reference

### Setup & Configuration

#### `onSetup(requireConfirmation, handler)`

Configures the controller interface when the app connects.

**Parameters:**
- `requireConfirmation` (SetupConfirmation) - `Require` or `NoRequire`. When set to `Require`, the app displays a confirmation dialog before applying settings.
- `handler` (function) - Code to run during setup, typically containing `setButton()` calls

**Example:**
```typescript
myController.onSetup(SetupConfirmation.Require, function () {
    myController.setButton("1", KeyVisibility.Visible, KeyColor.Green, "A")
    myController.setButton("2", KeyVisibility.Visible, KeyColor.Red, "B")
})
```

#### `importSettings(settingsString)`

Imports controller configuration from a settings string exported from the app.

**Parameters:**
- `settingsString` (string) - The settings string copied from the app's export feature

**Example:**
```typescript
myController.onSetup(SetupConfirmation.Require, function () {
    myController.importSettings("vc;init; vc;b;1;1;1;A; vc;b;2;1;4;B;")
})
```

#### `setButton(code, visibility, color, label)`

Configures a button's appearance in the controller app.

**Parameters:**
- `code` (string) - Button code (e.g., "1", "2", "up", "down", "space")
- `visibility` (KeyVisibility) - `Visible` or `Hidden`
- `color` (KeyColor) - `Black`, `Green`, `Blue`, `Yellow`, or `Red`
- `label` (string|number) - Optional text or number to display on the button. You can use also HTML with FontAwesome icons (e.g., `<i class='fa fa-heart'></i>`)

**Example:**
```typescript
myController.onSetup(SetupConfirmation.Require, function () {
    myController.importSettings("vc;init; vc;b;2;1;4;<i class='fa fa-heart'></i>;")
})
```

### Button Input

#### `isKey(keyCode, keyState)`

Returns `true` if the specified button is in the chosen state.

**Parameters:**
- `keyCode` (string) - Button code to check
- `keyState` (KeyState) - `Pressed` or `Released`

**Example:**
```typescript
myController.onCommand(function () {
    if (myController.isKey("1", KeyState.Pressed)) {
        led.plot(2, 2)
    }
    if (myController.isKey("1", KeyState.Released)) {
        led.unplot(2, 2)
    }
})
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
    if (myController.isKey("1", KeyState.Pressed)) {
        if (myController.buttonToggled()) {
            myController.setButton("1", KeyVisibility.Visible, KeyColor.Green, '<i class="fa-solid fa-check"></i>')
            basic.showIcon(IconNames.Yes)
        } else {
            myController.setButton("1", KeyVisibility.Visible, KeyColor.Red, '<i class="fa-solid fa-xmark"></i>')
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
myController.onCommand(function () {
    if (myController.isKey("1", KeyState.Pressed)) {
        state = myController.buttonToggleCount(3)
        myController.setButton("1", KeyVisibility.Visible, KeyColor.Green, state)
        basic.showString("" + (state))
    }
})
let state = 0
state = 0
```

### Analog Inputs

#### `isSlider(inputSide)`

Returns `true` if the specified slider value has changed.

**Parameters:**
- `inputSide` (InputSide) - `Right` or `Left`

**Example:**
```typescript
myController.onCommand(function () {
    if (myController.isSlider(InputSide.Right)) {
        led.setBrightness(myController.getCommandValue())
    }
})
myController.onSetup(SetupConfirmation.NoRequire, function () {
    myController.importSettings("vc;init; vc;show;sr; vc;sr;0;0;255;1;0;0;1;100;")
})
basic.showIcon(IconNames.Heart)
led.setBrightness(100)
```

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

### Controlling a dot on a micro:bit screen using arrow keys, sliders, joystick, and a device orientation:

```typescript
myController.onCommand(function () {
    led.unplot(ledX, ledY)
    if (myController.isSlider(InputSide.Right) || myController.isJoystick(InputSide.Right, JoystickDirection.x) || myController.isOrientation(InputOrientaton.x)) {
        ledX = myController.getCommandValue() + 2
    }
    if (myController.isSlider(InputSide.Left) || myController.isJoystick(InputSide.Right, JoystickDirection.y) || myController.isOrientation(InputOrientaton.y)) {
        ledY = myController.getCommandValue() + 2
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowDown), KeyState.Released) || myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowUp), KeyState.Released)) {
        ledY = 2
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowRight), KeyState.Released) || myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowLeft), KeyState.Released)) {
        ledX = 2
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowUp), KeyState.Pressed)) {
        ledY = 0
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowDown), KeyState.Pressed)) {
        ledY = 4
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowRight), KeyState.Pressed)) {
        ledX = 4
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowLeft), KeyState.Pressed)) {
        ledX = 0
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowRight), KeyState.Pressed) && myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowLeft), KeyState.Pressed)) {
        ledX = 2
    }
    led.plot(ledX, ledY)
})
myController.onSetup(SetupConfirmation.NoRequire, function () {
    myController.importSettings("vc;init; vc;sl;1;-2;2;1;1;0;1;; vc;sr;1;-2;2;1;0;0;0;; vc;jrx;-2;2;1;0;0; vc;jry;-2;2;1;1;0; vc;ox;1;-45;45;-2;2;1;0;0; vc;oy;1;-45;45;-2;2;1;1;0; vc;il;1; vc;ir;2; vc;show;sl,sr,jr,ar;")
})
let ledY = 0
let ledX = 0
ledX = 2
ledY = 2
led.plot(ledX, ledY)
```

## 📋 Requirements

- **micro:bit v2** (with Bluetooth support)
- **Bluetooth enabled** on both micro:bit and mobile device
- **UART Bluetooth service** (automatically started by the extension)
- **Compatible app** for controller interface ([my micro:bit](https://mymicrobit.medlight.pl/))

## 📖 Documentation

For more detailed documentation and tutorials, visit the [my micro:bit](https://mymicrobit.medlight.pl/).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Supported Targets

- **micro:bit** (v2 recommended)
- **PXT/MakeCode**

## 🔗 Links

- [my micro:bit](https://mymicrobit.medlight.pl/)
- [MakeCode Editor](https://makecode.microbit.org/)
- [micro:bit Website](https://microbit.org/)

---

> 📱 Open this page at [https://aorczyk.github.io/my-controller/](https://aorczyk.github.io/my-controller/)

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
