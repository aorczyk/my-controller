myController.onCommand(function () {
    led.unplot(ledX, ledY)
    if (myController.isSlider(InputSide.Right) || myController.isJoystick(InputSide.Right, JoystickDirection.x) || myController.isOrientation(InputOrientaton.x)) {
        ledX = myController.getCommandValue() + 2
    }
    if (myController.isSlider(InputSide.Left) || myController.isJoystick(InputSide.Right, JoystickDirection.y) || myController.isOrientation(InputOrientaton.y)) {
        ledY = myController.getCommandValue() + 2
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowUp), KeyState.Pressed)) {
        ledY = 0
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowDown), KeyState.Pressed)) {
        ledY = 4
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowUp), KeyState.Released) || myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowDown), KeyState.Released)) {
        ledY = 2
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowRight), KeyState.Pressed)) {
        ledX = 4
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowLeft), KeyState.Pressed)) {
        ledX = 0
    }
    if (myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowRight), KeyState.Released) || myController.isKey(myController.getKeyCodeValue(KeyCode.ArrowLeft), KeyState.Released)) {
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
    led.plot(ledX, ledY)
})
myController.onSetup(SetupConfirmation.NoRequire, function () {
    myController.sendData("vc;init;")
    myController.sendData("vc;sl;1;-2;2;1;1;0;1;;")
    myController.sendData("vc;sr;1;-2;2;1;0;0;0;;")
    myController.sendData("vc;jrx;-2;2;1;0;0;")
    myController.sendData("vc;jry;-2;2;1;1;0;")
    myController.sendData("vc;ox;1;-45;45;-2;2;1;0;0;")
    myController.sendData("vc;oy;1;-45;45;-2;2;1;1;0;")
    myController.sendData("vc;il;1;")
    myController.sendData("vc;show;sl,sr,jr,ar,br,bl;")
    myController.setButton("2", KeyVisibility.Visible, KeyColor.Black, "0")
})
let ledY = 0
let ledX = 0
ledX = 2
ledY = 2
led.plot(ledX, ledY)

