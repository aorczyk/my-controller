myController.onCommand(function() {
    if (myController.isKey("a", KeyState.Pressed)) {
        basic.showString("A")
    }
    if (myController.isKey("a", KeyState.Pressed)) {
        basic.clearScreen()
    }

    if (myController.isSlider(InputSide.Right)) {
        basic.showNumber(myController.getCommandValue())
    }
})

myController.onSetup(SetupConfirmation.Require, function () {
    bluetooth.uartWriteLine("vc;init;")
    bluetooth.uartWriteLine("vc;b;1;0;0;<i class=\"fa-solid fa-volume-high\"></i>;")
})
