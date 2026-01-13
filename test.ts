/**
 * My Controller tests
 * Example code for controlling a dot on a micro:bit screen using arrow keys, sliders, joystick, and device orientation.
 */

myController.onCommand(function () {
    led.unplot(ledX, ledY)
    if (myController.isSlider(myController.InputSide.Right) || myController.isJoystick(myController.InputSide.Right, myController.JoystickDirection.x) || myController.isOrientation(myController.InputOrientaton.x)) {
        ledX = myController.commandValue() + 2
    }
    if (myController.isSlider(myController.InputSide.Left) || myController.isJoystick(myController.InputSide.Right, myController.JoystickDirection.y) || myController.isOrientation(myController.InputOrientaton.y)) {
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