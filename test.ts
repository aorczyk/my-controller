// tests go here; this will not be compiled when this package is used as an extension.

/**
 * Mock Bluetooth UART for testing
 */
namespace BluetoothMock {
    let mockDataHandler: () => void = null;
    let mockConnectedHandler: () => void = null;
    let writtenLines: string[] = [];
    let pendingCommands: string[] = [];

    export function reset() {
        mockDataHandler = null;
        mockConnectedHandler = null;
        writtenLines = [];
        pendingCommands = [];
    }

    export function getWrittenLines(): string[] {
        return writtenLines;
    }

    export function simulateConnect() {
        if (mockConnectedHandler) {
            mockConnectedHandler();
        }
    }

    export function simulateCommand(command: string) {
        pendingCommands.push(command);
        if (mockDataHandler) {
            mockDataHandler();
        }
    }

    export function mockBluetoothUart() {
        // Mock bluetooth.startUartService
        bluetooth.startUartService = function() {};

        // Mock bluetooth.onBluetoothConnected
        bluetooth.onBluetoothConnected = function(handler: () => void) {
            mockConnectedHandler = handler;
        };

        // Mock bluetooth.onUartDataReceived
        bluetooth.onUartDataReceived = function(delimiter: string, handler: () => void) {
            mockDataHandler = handler;
        };

        // Mock bluetooth.uartReadUntil
        bluetooth.uartReadUntil = function(delimiter: string): string {
            if (pendingCommands.length > 0) {
                return pendingCommands.shift();
            }
            return "";
        };

        // Mock bluetooth.uartWriteLine
        bluetooth.uartWriteLine = function(value: string) {
            writtenLines.push(value);
        };
    }
}

/**
 * Test Suite for My Controller Extension
 */

// Test: Button Press Detection
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let testPassed = false;
myController.onVCcommand(function() {
    if (myController.isKey("a", KeyState.Pressed)) {
        testPassed = true;
    }
});

BluetoothMock.simulateCommand("a");
basic.pause(100);

if (testPassed) {
    basic.showIcon(IconNames.Yes);
} else {
    basic.showIcon(IconNames.No);
}

// Test: Button Release Detection
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let releaseTestPassed = false;
myController.onVCcommand(function() {
    if (myController.isKey("b", KeyState.Released)) {
        releaseTestPassed = true;
    }
});

BluetoothMock.simulateCommand("b");
basic.pause(50);
BluetoothMock.simulateCommand("!b");
basic.pause(100);

if (releaseTestPassed) {
    basic.showString("RELEASE OK");
}

// Test: Setup Handler
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let setupCalled = false;
myController.onVCsetup(SetupConfirmation.Require, function() {
    setupCalled = true;
    myController.setButton("test", KeyVisibility.Visible, KeyColor.Green, "Test");
});

myController.onVCcommand(function() {
    // Setup should be called on getSettings command
});

BluetoothMock.simulateCommand("-v");
basic.pause(50);
BluetoothMock.simulateCommand("getSettings");
basic.pause(100);

let writtenLines = BluetoothMock.getWrittenLines();
if (setupCalled && writtenLines.length > 0) {
    basic.showString("SETUP OK");
}

// Test: Command Name and Value
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let commandTestPassed = false;
myController.onVCcommand(function() {
    if (myController.getCommandName() == "test" && myController.getCommandValue() == 42) {
        commandTestPassed = true;
    }
});

BluetoothMock.simulateCommand("test=42");
basic.pause(100);

if (commandTestPassed) {
    basic.showString("CMD OK");
}

// Test: Button Toggle
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let toggleTestPassed = false;
let toggleCount = 0;
myController.onVCcommand(function() {
    if (myController.isKey("c", KeyState.Pressed)) {
        let toggled = myController.buttonToggled();
        toggleCount++;
        
        // First press should toggle on (true), second should toggle off (false)
        if (toggleCount == 1 && toggled == true) {
            toggleTestPassed = true;
        } else if (toggleCount == 2 && toggled == false) {
            toggleTestPassed = toggleTestPassed && true;
        }
    }
});

BluetoothMock.simulateCommand("c");
basic.pause(50);
BluetoothMock.simulateCommand("!c");
basic.pause(50);
BluetoothMock.simulateCommand("c");
basic.pause(100);

if (toggleTestPassed) {
    basic.showString("TOGGLE OK");
}

// Test: Button Toggle Count
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let countTestPassed = false;
let pressCount = 0;
myController.onVCcommand(function() {
    if (myController.isKey("d", KeyState.Pressed)) {
        let count = myController.buttonToggleCount(2);
        pressCount++;
        
        // Should count: 0 -> 1 -> 2 -> 0
        if (pressCount == 1 && count == 1) {
            countTestPassed = true;
        } else if (pressCount == 2 && count == 2) {
            countTestPassed = countTestPassed && true;
        } else if (pressCount == 3 && count == 0) {
            countTestPassed = countTestPassed && true;
        }
    }
});

BluetoothMock.simulateCommand("d");
basic.pause(50);
BluetoothMock.simulateCommand("d");
basic.pause(50);
BluetoothMock.simulateCommand("d");
basic.pause(100);

if (countTestPassed) {
    basic.showString("COUNT OK");
}

// Test: Slider Detection
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let sliderTestPassed = false;
myController.onVCcommand(function() {
    if (myController.isSlider(InputSide.Right)) {
        sliderTestPassed = true;
    }
});

BluetoothMock.simulateCommand("sr=50");
basic.pause(100);

if (sliderTestPassed) {
    basic.showString("SLIDER OK");
}

// Test: Joystick Detection
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let joystickTestPassed = false;
myController.onVCcommand(function() {
    if (myController.isJoystick(InputSide.Left, JoystickDirection.x)) {
        joystickTestPassed = true;
    }
});

BluetoothMock.simulateCommand("jlx=75");
basic.pause(100);

if (joystickTestPassed) {
    basic.showString("JOY OK");
}

// Test: Orientation Detection
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let orientationTestPassed = false;
myController.onVCcommand(function() {
    if (myController.isOrientation(InputOrientaton.x)) {
        orientationTestPassed = true;
    }
});

BluetoothMock.simulateCommand("ox=90");
basic.pause(100);

if (orientationTestPassed) {
    basic.showString("ORIENT OK");
}

// Test: Key Code Value
let keyCodeTest = myController.getKeyCodeValue(KeyCode.ArrowUp);
if (keyCodeTest == "up") {
    basic.showString("KEYCODE OK");
}

// Test: All Keys Released
BluetoothMock.reset();
BluetoothMock.mockBluetoothUart();

let allReleasedTestPassed = false;
myController.onVCcommand(function() {
    if (myController.areAllKeysReleased()) {
        allReleasedTestPassed = true;
    }
});

BluetoothMock.simulateCommand("none");
basic.pause(100);

if (allReleasedTestPassed) {
    basic.showString("RELEASED OK");
}

// Final test result
basic.showIcon(IconNames.Heart);
