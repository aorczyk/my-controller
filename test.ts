/**
 * My Controller tests
 * Example code for controlling a dot on a micro:bit screen using arrow keys, sliders, joystick, and device orientation.
 */

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
    if (myController.isKey("1", KeyState.Pressed)) {
        if (myController.buttonToggled()) {
            myController.setButton("1", KeyVisibility.Visible, KeyColor.Green, "")
        } else {
            myController.setButton("1", KeyVisibility.Visible, KeyColor.Black, "")
        }
    }
    if (myController.isKey("2", KeyState.Pressed)) {
        myController.setButton("2", KeyVisibility.Visible, KeyColor.Black, myController.buttonToggleCount(3))
    }
    if (myController.isKey("3", KeyState.Pressed)) {
        basic.showIcon(IconNames.House)
    }
    if (myController.isKey("4", KeyState.Pressed)) {
        basic.showIcon(IconNames.Heart)
    }
    if (myController.isKey("3", KeyState.Released) || myController.isKey("4", KeyState.Released)) {
        basic.clearScreen()
    }
    led.plot(ledX, ledY)
})
myController.onSetup(SetupConfirmation.NoRequire, function () {
    myController.importSettings("vc;init; vc;sl;1;-2;2;1;1;0;1;; vc;sr;1;-2;2;1;0;0;0;; vc;jrx;-2;2;1;0;0; vc;jry;-2;2;1;1;0; vc;b;2;1;0;0; vc;b;3;1;0;<i class=\"fa-solid fa-house\"></i>; vc;b;4;1;0;<i class=\"fa-solid fa-heart\"></i>; vc;ox;1;-45;45;-2;2;1;0;0; vc;oy;1;-45;45;-2;2;1;1;0; vc;il;1; vc;ir;2; vc;show;sl,sr,jr,ar,br,bl;")
    myController.setButton("2", KeyVisibility.Visible, KeyColor.Black, "0")
})
let ledY = 0
let ledX = 0
ledX = 2
ledY = 2
led.plot(ledX, ledY)