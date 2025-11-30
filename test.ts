myController.onVCsetup(SetupConfirmation.Require, function() {
    bluetooth.uartWriteLine('vc;init;')
})

myController.onVCcommand(function() {
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