# My Controller

> Control your micro:bit wirelessly via Bluetooth or USB from an app [my micro:bit](https://mymicrobit.medlight.pl/)

> [!NOTE]
> Works with micro:bit V2 only!

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

> [!NOTE]
> This extension includes Bluetooth functionality, which will automatically remove other radio features from your project due to micro:bit Bluetooth limitations. The extension automatically manages the Bluetooth UART service for communication.

## 📚 API Reference

### Communication

#### `useBluetooth()`

Initializes Bluetooth communication with the controller app. Call this at the start of your program to enable Bluetooth control.

**Example:**
```typescript
myController.useBluetooth()
```

#### `useSerial()`

Initializes WebUSB communication with the controller app. Call this at the start of your program to enable WebUSB control.

**Example:**
```typescript
myController.useSerial()
```

### Commands handling

#### `onCommand(handler)`

Runs the code inside when any command is received from the controller. Use this block to handle all incoming commands including key presses, slider changes, joystick movements, and orientation updates.

**Parameters:**
- `handler` (function) - Code to run when a command is received

#### `commandName()`

Returns the name of the most recently received command.

#### `commandValue()`

Returns the value of the most recently received command (for analog inputs).

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

**Example - control brightness of the micro:bit LED display:**
```typescript
myController.onCommand(function () {
    if (myController.isSlider(InputSide.Right)) {
        led.setBrightness(myController.commandValue())
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
- `direction` (JoystickDirection) - `x` or `y`

#### `isOrientation(axis)`

Returns `true` if the specified orientation axis has changed.

**Parameters:**
- `axis` (InputOrientation) - `x`, `y`, `z`, or `compass`

### Setup & Configuration

#### `onSetup(requireConfirmation, handler)`

Configures the controller interface when the app connects.

**Parameters:**
- `requireConfirmation` (SetupConfirmation) - `Require` or `NoRequire`. When set to `Require`, the app displays a confirmation dialog before applying settings.
- `handler` (function) - Code to run during setup, typically containing `importSettings` call or `setButton` configurations.

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
myController.onSetup(SetupConfirmation.NoRequire, function () {
    myController.importSettings("vc;init; vc;b;1;1;1;A; vc;b;2;1;4;B;")
})
```

#### `setButton(code, visibility, color, label)`

Configures a button's appearance in the controller app.

**Parameters:**
- `code` (string) - Button code (e.g., "1", "2", "up", "down")
- `visibility` (KeyVisibility) - `Visible` or `Hidden`
- `color` (KeyColor) - Optional. `Black`, `Green`, `Blue`, `Yellow`, or `Red`
- `label` (string|number) - Optional text or number to display on the button. You can use also HTML with FontAwesome icons (e.g., `<i class='fa-solid fa-heart'></i>`)

#### `sendData(data)`

Sends a raw data command to the controller app via Bluetooth or WebUSB. Use this block to send custom commands not covered by other blocks.

**Parameters:**
- `data` (string) - The raw command string to send

**Example:**
```typescript
myController.onSetup(SetupConfirmation.NoRequire, function () {
    myController.setButton("1", KeyVisibility.Visible, KeyColor.Red, "<i class='fa fa-heart'></i>")
})
```

## 💡 Examples

### Controlling a dot on a micro:bit screen using arrow keys, sliders, joystick, and a device orientation:

```typescript
myController.onCommand(function () {
    led.unplot(ledX, ledY)
    if (myController.isSlider(myController.InputSide.Right) || myController.isJoystick(myController.InputSide.Right, myController.JoystickDirection.X) || myController.isOrientation(myController.InputOrientation.X)) {
        ledX = myController.commandValue() + 2
    }
    if (myController.isSlider(myController.InputSide.Left) || myController.isJoystick(myController.InputSide.Right, myController.JoystickDirection.Y) || myController.isOrientation(myController.InputOrientation.Y)) {
        ledY = myController.commandValue() + 2
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowDown), myController.KeyState.Released) || myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowUp), myController.KeyState.Released)) {
        ledY = 2
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowRight), myController.KeyState.Released) || myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowLeft), myController.KeyState.Released)) {
        ledX = 2
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowUp), myController.KeyState.Pressed)) {
        ledY = 0
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowDown), myController.KeyState.Pressed)) {
        ledY = 4
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowRight), myController.KeyState.Pressed)) {
        ledX = 4
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowLeft), myController.KeyState.Pressed)) {
        ledX = 0
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowRight), myController.KeyState.Pressed) && myController.isKey(myController.getKeyCodeValue(myController.KeyCode.ArrowLeft), myController.KeyState.Pressed)) {
        ledX = 2
    }
    if (myController.isKey("1", myController.KeyState.Pressed)) {
        if (myController.buttonToggled()) {
            myController.setButton("1", myController.KeyVisibility.Visible, myController.KeyColor.Green, "")
        } else {
            myController.setButton("1", myController.KeyVisibility.Visible, myController.KeyColor.Black, "")
        }
    }
    if (myController.isKey("2", myController.KeyState.Pressed)) {
        myController.setButton("2", myController.KeyVisibility.Visible, myController.KeyColor.Black, myController.buttonToggleCount(3))
    }
    if (myController.isKey("3", myController.KeyState.Pressed)) {
        basic.showIcon(IconNames.House)
    }
    if (myController.isKey("4", myController.KeyState.Pressed)) {
        basic.showIcon(IconNames.Heart)
    }
    if (myController.isKey("3", myController.KeyState.Released) || myController.isKey("4", myController.KeyState.Released)) {
        basic.clearScreen()
    }
    led.plot(ledX, ledY)
})
myController.onSetup(myController.SetupConfirmation.NoRequire, function () {
    myController.importSettings("vc;init; vc;sl;1;-2;2;1;1;0;1;; vc;sr;1;-2;2;1;0;0;0;; vc;jrx;-2;2;1;0;0; vc;jry;-2;2;1;1;0; vc;b;2;1;0;0; vc;b;3;1;0;<i class=\"fa-solid fa-house\"></i>; vc;b;4;1;0;<i class=\"fa-solid fa-heart\"></i>; vc;ox;1;-45;45;-2;2;1;0;0; vc;oy;1;-45;45;-2;2;1;1;0; vc;il;1; vc;ir;2; vc;show;sl,sr,jr,ar,br,bl;")
    myController.setButton("2", myController.KeyVisibility.Visible, myController.KeyColor.Black, "0")
})
let ledY = 0
let ledX = 0
ledX = 2
ledY = 2
led.plot(ledX, ledY)
myController.useBluetooth()
```

## 📋 Requirements

- **micro:bit v2** (with Bluetooth support)
- **Bluetooth enabled** on both micro:bit and mobile device
- **UART Bluetooth service** (automatically started by the extension)
- **Compatible app** for controller interface ([my micro:bit](https://mymicrobit.medlight.pl/))

## 📖 Documentation

For more detailed documentation and tutorials, visit the [my micro:bit](https://mymicrobit.medlight.pl/).

## License

Copyright (C) 2025 Adam Orczyk

Licensed under the MIT License (MIT). See LICENSE file for more details.

## Supported targets

* for PXT/microbit
