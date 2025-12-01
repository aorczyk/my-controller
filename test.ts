myController.onCommand(function () {
    if (myController.isKey("a", KeyState.Pressed)) {
        basic.showString("A")
    }
    if (myController.isKey("a", KeyState.Released) || myController.isKey("s", KeyState.Released) || myController.isKey("d", KeyState.Released)) {
        basic.clearScreen()
    }
    if (myController.isKey("s", KeyState.Pressed) && myController.isKey("d", KeyState.Pressed)) {
        basic.showString("2")
    }
    if (myController.isSlider(InputSide.Right)) {
        basic.showNumber(myController.getCommandValue())
    }
})

myController.onSetup(SetupConfirmation.Require, function() {
    basic.showIcon(IconNames.Heart)
    bluetooth.uartWriteLine("vc;init;")
    bluetooth.uartWriteLine("vc;b;1;0;0;<i class=\"fa-solid fa-volume-high\"></i>;")
})