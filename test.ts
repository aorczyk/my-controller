/**
 * My Controller tests
 * Example code for controlling a dot on a micro:bit screen using arrow keys, sliders, joystick, and device orientation.
 */

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