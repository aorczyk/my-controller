# My Controller

> Control your BBC micro:bit wirelessly via Bluetooth or USB from an app [my micro:bit](https://mymicrobit.medlight.pl/)

> [!NOTE]
> Works with micro:bit V2 only!

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![micro:bit](https://img.shields.io/badge/micro%3Abit-v2-blue)](https://microbit.org/)
[![MakeCode](https://img.shields.io/badge/MakeCode-Extension-orange)](https://makecode.microbit.org/)

A powerful MakeCode extension that enables control of your BBC micro:bit through an app [my micro:bit](https://mymicrobit.medlight.pl/) using Bluetooth or WebUSB. Create custom controller interfaces with buttons, sliders, joysticks, and orientation sensors.

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
> This extension includes Bluetooth functionality, which will automatically remove other radio features from your project due to BBC micro:bit Bluetooth limitations. The extension automatically manages the Bluetooth UART service for communication.

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

#### `onCommandReceived(handler)`

Runs the code when any command is received from the controller. Use this block to handle all incoming commands including key presses, slider changes, joystick movements, and orientation updates.

**Parameters:**
- `handler` (function) - Code to run when a command is received

#### `commandName()`

Returns the name of the most recently received command.

#### `commandValue()`

Returns the value of the most recently received command (for analog inputs).

### Button Input

#### `isButton(buttonCode, buttonState)`

Returns `true` if the specified button is in the chosen state.

**Parameters:**
- `buttonCode` (string) - Button code to check
- `buttonState` (ButtonState) - `Pressed` or `Released`

**Example:**
```typescript
myController.onCommandReceived(function () {
    if (myController.isButton("1", ButtonState.Pressed)) {
        led.plot(2, 2)
    }
    if (myController.isButton("1", ButtonState.Released)) {
        led.unplot(2, 2)
    }
})
```

#### `areAllButtonsReleased()`

Returns `true` when all buttons have been released.

#### `buttonCode(buttonName)`

Returns the string code for special keys.

**Special Keys:**
- `ButtonName.ArrowUp` → "up"
- `ButtonName.ArrowDown` → "down"
- `ButtonName.ArrowRight` → "right"
- `ButtonName.ArrowLeft` → "left"
- `ButtonName.Enter` → "enter"
- `ButtonName.Space` → "space"

### Utility Functions

#### `toggleButton()`

Returns `true` if the button toggles on, `false` if it toggles off. Maintains individual toggle state for each button.

**Example:**
```typescript
myController.onCommandReceived(function () {
    if (myController.isButton("1", ButtonState.Pressed)) {
        if (myController.toggleButton()) {
            myController.setButton("1", ButtonVisibility.Visible, ButtonColor.Green, '<i class="fa-solid fa-check"></i>')
            basic.showIcon(IconNames.Yes)
        } else {
            myController.setButton("1", ButtonVisibility.Visible, ButtonColor.Red, '<i class="fa-solid fa-xmark"></i>')
            basic.showIcon(IconNames.No)
        }
    }
})
```

#### `nextButtonToggle(maxCount)`

Returns the current toggle count (1 to maxCount). Each press increments the counter until it reaches the maximum, then resets to 0.

**Parameters:**
- `maxCount` (number) - Maximum count before reset (default: 1)

**Example:**
```typescript
myController.onCommandReceived(function () {
    if (myController.isButton("1", ButtonState.Pressed)) {
        state = myController.nextButtonToggle(3)
        myController.setButton("1", ButtonVisibility.Visible, ButtonColor.Green, state)
        basic.showString("" + (state))
    }
})
let state = 0
state = 0
```

### Analog Inputs

#### `isSlider(controllerSide)`

Returns `true` if the specified slider value has changed.

**Parameters:**
- `controllerSide` (ControllerSide) - `Right` or `Left`

**Example - control brightness of the BBC micro:bit LED display:**
```typescript
myController.onCommandReceived(function () {
    if (myController.isSlider(ControllerSide.Right)) {
        led.setBrightness(myController.commandValue())
    }
})
myController.onSetup(SetupConfirmation.NoRequire, function () {
    myController.applySettings("vc;init; vc;show;sr; vc;sr;0;0;255;1;0;0;1;100;")
})
basic.showIcon(IconNames.Heart)
led.setBrightness(100)
```

#### `isJoystick(controllerSide, direction)`

Returns `true` if the specified joystick axis has changed.

**Parameters:**
- `controllerSide` (ControllerSide) - `Right` or `Left`
- `direction` (JoystickDirection) - `x` or `y`

#### `isOrientation(axis)`

Returns `true` if the specified orientation axis has changed.

**Parameters:**
- `axis` (OrientationAxis) - `x`, `y`, `z`, or `compass`

### Setup & Configuration

#### `onSetup(confirmationMode, handler)`

Configures the controller interface when the app connects.

**Parameters:**
- `confirmationMode` (ConfirmationMode) - `Require` or `NoRequire`. When set to `Require`, the app displays a confirmation dialog before applying settings.
- `handler` (function) - Code to run during setup, typically containing `applySettings` call or `setButton` configurations.

**Example:**
```typescript
myController.onSetup(ConfirmationMode.Require, function () {
    myController.setButton("1", ButtonVisibility.Visible, ButtonColor.Green, "A")
    myController.setButton("2", ButtonVisibility.Visible, ButtonColor.Red, "B")
})
```

#### `applySettings(settingsString)`

Imports controller configuration from a settings string exported from the app.

**Parameters:**
- `settingsString` (string) - The settings string copied from the app's export feature

**Example:**
```typescript
myController.onSetup(SetupConfirmation.NoRequire, function () {
    myController.applySettings("vc;init; vc;b;1;1;1;A; vc;b;2;1;4;B;")
})
```

#### `setButton(code, visibility, color, label)`

Configures a button's appearance in the controller app.

**Parameters:**
- `code` (string) - Button code (e.g., "1", "2", "up", "down")
- `visibility` (ButtonVisibility) - `Visible` or `Hidden`
- `color` (ButtonColor) - Optional. `Black`, `Green`, `Blue`, `Yellow`, or `Red`
- `label` (string|number) - Optional text or number to display on the button. You can use also HTML with FontAwesome icons (e.g., `<i class='fa-solid fa-heart'></i>`)

#### `sendData(data)`

Sends a raw data command to the controller app via Bluetooth or WebUSB. Use this block to send custom commands not covered by other blocks.

**Parameters:**
- `data` (string) - The raw command string to send

**Example:**
```typescript
myController.onSetup(ConfirmationMode.NoRequire, function () {
    myController.setButton("1", ButtonVisibility.Visible, ButtonColor.Red, "<i class='fa fa-heart'></i>")
})
```

## 💡 Examples

### Controlling a dot on a BBC micro:bit screen using arrow keys, sliders, joystick, and a device orientation:

```typescript
myController.onCommandReceived(function () {
    led.unplot(ledX, ledY)
    if (myController.isSlider(myController.ControllerSide.Right) || myController.isJoystick(myController.ControllerSide.Right, myController.JoystickDirection.X) || myController.isOrientation(myController.OrientationAxis.X)) {
        ledX = myController.commandValue() + 2
    }
    if (myController.isSlider(myController.ControllerSide.Left) || myController.isJoystick(myController.ControllerSide.Right, myController.JoystickDirection.Y) || myController.isOrientation(myController.OrientationAxis.Y)) {
        ledY = myController.commandValue() + 2
    }
    if (myController.isButton(myController.buttonCode(myController.ButtonName.ArrowDown), myController.ButtonState.Released) || myController.isButton(myController.buttonCode(myController.ButtonName.ArrowUp), myController.ButtonState.Released)) {
        ledY = 2
    }
    if (myController.isButton(myController.buttonCode(myController.ButtonName.ArrowRight), myController.ButtonState.Released) || myController.isButton(myController.buttonCode(myController.ButtonName.ArrowLeft), myController.ButtonState.Released)) {
        ledX = 2
    }
    if (myController.isButton(myController.buttonCode(myController.ButtonName.ArrowUp), myController.ButtonState.Pressed)) {
        ledY = 0
    }
    if (myController.isButton(myController.buttonCode(myController.ButtonName.ArrowDown), myController.ButtonState.Pressed)) {
        ledY = 4
    }
    if (myController.isButton(myController.buttonCode(myController.ButtonName.ArrowRight), myController.ButtonState.Pressed)) {
        ledX = 4
    }
    if (myController.isButton(myController.buttonCode(myController.ButtonName.ArrowLeft), myController.ButtonState.Pressed)) {
        ledX = 0
    }
    if (myController.isButton(myController.buttonCode(myController.ButtonName.ArrowRight), myController.ButtonState.Pressed) && myController.isButton(myController.buttonCode(myController.ButtonName.ArrowLeft), myController.ButtonState.Pressed)) {
        ledX = 2
    }
    if (myController.isButton("1", myController.ButtonState.Pressed)) {
        if (myController.toggleButton()) {
            myController.setButton("1", myController.ButtonVisibility.Visible, myController.ButtonColor.Green, "")
        } else {
            myController.setButton("1", myController.ButtonVisibility.Visible, myController.ButtonColor.Black, "")
        }
    }
    if (myController.isButton("2", myController.ButtonState.Pressed)) {
        myController.setButton("2", myController.ButtonVisibility.Visible, myController.ButtonColor.Black, myController.nextButtonToggle(3))
    }
    if (myController.isButton("3", myController.ButtonState.Pressed)) {
        basic.showIcon(IconNames.House)
    }
    if (myController.isButton("4", myController.ButtonState.Pressed)) {
        basic.showIcon(IconNames.Heart)
    }
    if (myController.isButton("3", myController.ButtonState.Released) || myController.isButton("4", myController.ButtonState.Released)) {
        basic.clearScreen()
    }
    led.plot(ledX, ledY)
})
myController.onSetup(myController.ConfirmationMode.NoRequire, function () {
    myController.applySettings("vc;init; vc;sl;1;-2;2;1;1;0;1;; vc;sr;1;-2;2;1;0;0;0;; vc;jrx;-2;2;1;0;0; vc;jry;-2;2;1;1;0; vc;b;2;1;0;0; vc;b;3;1;0;<i class=\"fa-solid fa-house\"></i>; vc;b;4;1;0;<i class=\"fa-solid fa-heart\"></i>; vc;ox;1;-45;45;-2;2;1;0;0; vc;oy;1;-45;45;-2;2;1;1;0; vc;il;1; vc;ir;2; vc;show;sl,sr,jr,ar,br,bl;")
    myController.setButton("2", myController.ButtonVisibility.Visible, myController.ButtonColor.Black, "0")
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
- **Bluetooth enabled** on both BBC micro:bit and mobile device
- **UART Bluetooth service** (automatically started by the extension)
- **Compatible app** for controller interface ([my micro:bit](https://mymicrobit.medlight.pl/))

## 📖 Documentation

For more detailed documentation and tutorials, visit the [my micro:bit](https://mymicrobit.medlight.pl/).

## License

Copyright (C) 2025 Adam Orczyk

Licensed under the MIT License (MIT). See LICENSE file for more details.

## Supported targets

* for PXT/microbit
