/**
 * My Controller tests
 * Example code for controlling a dot on a micro:bit screen using arrow keys, sliders, joystick, and device orientation.
 */

myController.onCommand(function () {
    led.unplot(ledX, ledY)
    if (myController.isSlider(MyControllerInputSide.Right) || myController.isJoystick(MyControllerInputSide.Right, MyControllerJoystickDirection.x) || myController.isOrientation(MyControllerInputOrientaton.x)) {
        ledX = myController.getCommandValue() + 2
    }
    if (myController.isSlider(MyControllerInputSide.Left) || myController.isJoystick(MyControllerInputSide.Right, MyControllerJoystickDirection.y) || myController.isOrientation(MyControllerInputOrientaton.y)) {
        ledY = myController.getCommandValue() + 2
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowDown), MyControllerKeyState.Released) || myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowUp), MyControllerKeyState.Released)) {
        ledY = 2
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowRight), MyControllerKeyState.Released) || myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowLeft), MyControllerKeyState.Released)) {
        ledX = 2
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowUp), MyControllerKeyState.Pressed)) {
        ledY = 0
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowDown), MyControllerKeyState.Pressed)) {
        ledY = 4
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowRight), MyControllerKeyState.Pressed)) {
        ledX = 4
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowLeft), MyControllerKeyState.Pressed)) {
        ledX = 0
    }
    if (myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowRight), MyControllerKeyState.Pressed) && myController.isKey(myController.getKeyCodeValue(myController.MyControllerKeyCode.ArrowLeft), MyControllerKeyState.Pressed)) {
        ledX = 2
    }
    if (myController.isKey("1", MyControllerKeyState.Pressed)) {
        if (myController.buttonToggled()) {
            myController.setButton("1", MyControllerKeyVisibility.Visible, MyControllerKeyColor.Green, "")
        } else {
            myController.setButton("1", MyControllerKeyVisibility.Visible, MyControllerKeyColor.Black, "")
        }
    }
    if (myController.isKey("2", MyControllerKeyState.Pressed)) {
        myController.setButton("2", MyControllerKeyVisibility.Visible, MyControllerKeyColor.Black, myController.buttonToggleCount(3))
    }
    if (myController.isKey("3", MyControllerKeyState.Pressed)) {
        basic.showIcon(IconNames.House)
    }
    if (myController.isKey("4", MyControllerKeyState.Pressed)) {
        basic.showIcon(IconNames.Heart)
    }
    if (myController.isKey("3", MyControllerKeyState.Released) || myController.isKey("4", MyControllerKeyState.Released)) {
        basic.clearScreen()
    }
    led.plot(ledX, ledY)
})
myController.onSetup(MyControllerSetupConfirmation.NoRequire, function () {
    myController.importSettings("vc;init; vc;sl;1;-2;2;1;1;0;1;; vc;sr;1;-2;2;1;0;0;0;; vc;jrx;-2;2;1;0;0; vc;jry;-2;2;1;1;0; vc;b;2;1;0;0; vc;b;3;1;0;<i class=\"fa-solid fa-house\"></i>; vc;b;4;1;0;<i class=\"fa-solid fa-heart\"></i>; vc;ox;1;-45;45;-2;2;1;0;0; vc;oy;1;-45;45;-2;2;1;1;0; vc;il;1; vc;ir;2; vc;show;sl,sr,jr,ar,br,bl;")
    myController.setButton("2", MyControllerKeyVisibility.Visible, MyControllerKeyColor.Black, "0")
})
let ledY = 0
let ledX = 0
ledX = 2
ledY = 2
led.plot(ledX, ledY)