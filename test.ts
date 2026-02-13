/**
 * My Controller tests
 */

basic.clearScreen()
myController.useBluetooth()
let output = ""
let testCaseName = ''
let testCaseCounter = 0

myController.onCommandReceived(function () {
    console.log('> ' + myController.commandName() + ' : ' + myController.commandValue())
    
    if (testCaseName == 'Basic') {
        // Test Slider
        if (myController.rightSliderChanged()) {
            output = "Right slider = " + myController.commandValue()
        }
        if (myController.leftSliderChanged()) {
            output = "Left slider = " + myController.commandValue()
        }

        // Test Joystick
        if (myController.rightJoystickChanged(myController.JoystickDirection.X)) {
            output = "Right joystick X = " + myController.commandValue ()
        }
        if (myController.rightJoystickChanged(myController.JoystickDirection.Y)) {
            output = "Right joystick Y = " + myController.commandValue ()
        }
        if (myController.leftJoystickChanged(myController.JoystickDirection.X)) {
            output = "Left joystick X = " + myController.commandValue ()
        }
        if (myController.leftJoystickChanged(myController.JoystickDirection.Y)) {
            output = "Left joystick Y = " + myController.commandValue ()
        }

        // Test Orientation
        if (myController.orientationChanged(myController.OrientationAxis.X)) {
            output = "Orientation X = " + myController.commandValue()
        }
        if (myController.orientationChanged(myController.OrientationAxis.Y)) {
            output = "Orientation Y = " + myController.commandValue()
        }
        if (myController.orientationChanged(myController.OrientationAxis.Z)) {
            output = "Orientation Z = " + myController.commandValue()
        }
        if (myController.orientationChanged(myController.OrientationAxis.Compass)) {
            output = "Orientation Compass = " + myController.commandValue()
        }

        // Test Button
        if (myController.isButtonPressed("up")) {
            output = "Button up pressed"
        }

        // Test buttonWasReleased - Released
        if (myController.buttonWasReleased("up")) {
            output = "Button up released"
        }

        // Test toggleButton
        if (myController.isButtonPressed("space")) {
            let toggleState = myController.toggleButton()
            output = "Toggle: " + toggleState
        }

        // Test toggleButton
        if (myController.isButtonPressed("enter")) {
            let toggleState = myController.nextButtonToggle(2)
            output = "Toggle count: " + toggleState
        }
    }

    if (testCaseName == 'Two buttons pressed') {
        if (myController.buttonWasReleased("a") && myController.noButtonIsPressed()) {
            output = "no button pressed"
        }

        if (myController.isButtonPressed("a") && myController.isButtonPressed("b")) {
            output = "a and b pressed"
        }
    }

    if (testCaseName == 'All buttons released') {
        if (myController.allButtonsReleased()) {
            output = "all buttons released"
        } else {
            output = ""
        }
    }

    if (testCaseName == 'Buttons - multiple times pressed') {
        if (myController.isButtonPressed("a")) {
            // Do someting time consuming.
            console.log('waiting 500 ms')
            basic.pause(500)
        }
        if (myController.isButtonPressed("b")) {
            output = 'b pressed'
        }
    }

    if (testCaseName == 'Slider - multiple times changed') {
        if (myController.isButtonPressed("a")) {
            // Do someting time consuming.
            console.log('waiting 500 ms')
            basic.pause(500)
        }
        if (myController.rightSliderChanged()) {
            output = "sr = " + myController.commandValue()
        }
    }

    if (testCaseName == 'Button and right slider') {
        if (myController.isButtonPressed("a") && myController.rightSliderChanged()) {
            output = "a and sr = " + myController.commandValue()
        }
    }
})

// Basic test cases
testCaseName = 'Basic'
const testCases: [string, string, string][] = [
    ['Slider - Right', 'sr=1', 'Right slider = 1'],
    ['Slider - Left', 'sl=50', 'Left slider = 50'],

    ['Joystick - Right X', 'jrx=100', 'Right joystick X = 100'],
    ['Joystick - Right Y', 'jry=-50', 'Right joystick Y = -50'],
    ['Joystick - Left X', 'jlx=25', 'Left joystick X = 25'],
    ['Joystick - Left Y', 'jly=-75', 'Left joystick Y = -75'],

    ['Orientation - X', 'ox=45', 'Orientation X = 45'],
    ['Orientation - Y', 'oy=-30', 'Orientation Y = -30'],
    ['Orientation - Z', 'oz=90', 'Orientation Z = 90'],
    ['Orientation - Compass', 'oc=180', 'Orientation Compass = 180'],

    ['Button - Pressed', 'up', 'Button up pressed'],
    ['Button - Released', '!up', 'Button up released'],

    ['toggleButton - First', 'space', 'Toggle: true'],
    ['space released', '!space', ''],
    ['toggleButton - Second', 'space', 'Toggle: false'],
    ['space released', '!space', ''],

    ['toggleButtonCount - 1', 'enter', 'Toggle count: 1'],
    ['space released', '!enter', ''],
    ['toggleButtonCount - 2', 'enter', 'Toggle count: 2'],
    ['space released', '!enter', ''],
    ['toggleButtonCount - 0', 'enter', 'Toggle count: 0'],
    ['space released', '!enter', ''],
];

testCases.forEach((test) => {
    testCaseCounter++;
    let [name, command, expect] = test
    let [commandName, commandValue] = command.split("=")

    output = ''
    myController.onDataReceived(command)

    basic.pause(20)

    if (expect) {
        console.log(testCaseCounter + '. ' + name)

        while (myController.commandName() != commandName && '!' + myController.commandName() != commandName) {
            basic.pause(20)
        }
        control.assert(
            output == expect,
            `command: ${command}\noutput: ${output}\nexpect: ${expect}`
        )
    }
});


(function () {
    testCaseCounter++;
    testCaseName = 'Two buttons pressed'
    console.log(testCaseCounter + '. ' + testCaseName)

    output = ''

    myController.onDataReceived('a')
    basic.pause(20)
    myController.onDataReceived('!a')
    basic.pause(20)

    let expect = 'no button pressed'
    basic.pause(20)
    control.assert(
        output == expect,
        `output: ${output}\nexpect: ${expect}`
    )

    basic.pause(20)

    myController.onDataReceived('a')
    basic.pause(20)
    myController.onDataReceived('b')
    basic.pause(20)

    expect = 'a and b pressed'

    control.assert(
        output == expect,
        `output: ${output}\nexpect: ${expect}`
    )

    myController.onDataReceived('!a')
    basic.pause(20)
    myController.onDataReceived('!b')
    basic.pause(20)
})();


(function () {
    testCaseCounter++;
    testCaseName = 'All buttons released'
    console.log(testCaseCounter + '. ' + testCaseName + ' - 1')

    output = ''

    myController.onDataReceived('a')
    basic.pause(20)
    myController.onDataReceived('b')
    basic.pause(20)
    myController.onDataReceived('!a')
    basic.pause(20)
    myController.onDataReceived('!b')
    basic.pause(20)
    
    let expect = 'all buttons released'

    control.assert(
        output == expect,
        `output: ${output}\nexpect: ${expect}`
    )

    console.log(testCaseCounter + '. ' + testCaseName + ' - 2')

    output = ''

    myController.onDataReceived('a')
    basic.pause(20)
    myController.onDataReceived('!a')
    basic.pause(20)
    // myController.onDataReceived('a')
    basic.pause(20)
    myController.onDataReceived('none')
    basic.pause(200)


    expect = 'all buttons released'
    basic.pause(50)
    control.assert(
        output == expect,
        `output: ${output}\nexpect: ${expect}`
    )

    output = ''

    myController.onDataReceived('sr=100')
    basic.pause(20)

    expect = ''

    control.assert(
        output == expect,
        `output: ${output}\nexpect: ${expect}`
    )
})();


(function () {
    testCaseCounter++;
    testCaseName = 'Buttons - multiple times pressed'
    console.log(testCaseCounter + '. ' + testCaseName)

    output = ''
    myController.onDataReceived('a')
    basic.pause(20)
    myController.onDataReceived('!a')
    basic.pause(20)
    
    myController.onDataReceived('b')
    basic.pause(20)
    myController.onDataReceived('!b')
    basic.pause(20)
    myController.onDataReceived('b')
    basic.pause(20)
    myController.onDataReceived('!b')
    basic.pause(20)
    myController.onDataReceived('b')

    let expect = 'b pressed'

    basic.pause(500)

    control.assert(
        output == expect,
        `output: ${output}\nexpect: ${expect}`
    )
})();


(function () {
    testCaseCounter++;
    testCaseName = 'Slider - multiple times changed'
    console.log(testCaseCounter + '. ' + testCaseName)

    output = ''
    myController.onDataReceived('a')
    basic.pause(20)
    myController.onDataReceived('!a')
    basic.pause(20)

    myController.onDataReceived('sr=1')
    basic.pause(20)
    myController.onDataReceived('sr=2')
    basic.pause(20)
    myController.onDataReceived('sr=3')
    basic.pause(20)
    myController.onDataReceived('sr=4')
    basic.pause(20)
    myController.onDataReceived('sr=5')
    basic.pause(600)

    let expect = 'sr = 5'
    control.assert(
        output == expect,
        `output: ${output}\nexpect: ${expect}`
    )
})();


(function () {
    testCaseCounter++;
    testCaseName = 'Button and right slider'
    console.log(testCaseCounter + '. ' + testCaseName)

    output = ''
    myController.onDataReceived('a')
    basic.pause(20)
    myController.onDataReceived('sr=1')
    basic.pause(50)

    let expect = 'a and sr = 1'

    control.assert(
        output == expect,
        `output: ${output}\nexpect: ${expect}`
    )

    myController.onDataReceived('!a')
    basic.pause(20)
})();

console.log('Test end: ' + testCaseCounter)
basic.showIcon(IconNames.Yes)