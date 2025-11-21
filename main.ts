const enum InputName {
    //% block="Right Arrows"
    RightArrows = 1,
    //% block="Right Slider"
    RightSlider = 2,
    //% block="Right Joystick"
    RightJoystick = 3,
    //% block="Left Arrows"
    LeftArrows = -1,
    //% block="Left Slider"
    LeftSlider = -2,
    //% block="Left Joystick"
    LeftJoystick = -3,
}

const InputNameLabel: { [n: number]: string } = {
    [InputName.RightArrows]: "ar",
    [InputName.RightSlider]: "sr",
    [InputName.RightJoystick]: "jr",

    [InputName.LeftArrows]: "al",
    [InputName.LeftSlider]: "sl",
    [InputName.LeftJoystick]: "jl",
};

const enum InputSide {
    //% block="right"
    Right = 1,
    //% block="left"
    Left = 2,
}

//% color=#485fc7 icon="\uf11b" block="Controller"
namespace vcController {
    let latestCommands: { [key: string]: number } = {}
    let commandName: string;
    let commandValue: number;

    bluetooth.startUartService()

    bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        let commadParts: string[] = []
        let command: string;
        command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
        commadParts = command.split("=")
        latestCommands[commadParts[0]] = parseFloat(commadParts[1])
    })

    /**
     * Returns command name.
     */
    //% blockId=vc_command_name
    //% block="command name"
    //% weight=50
    export function getCommandName() {
        return commandName
    }

    /**
     * Returns command value.
     */
    //% blockId=vc_command_value
    //% block="command value"
    //% weight=50
    export function getCommandValue() {
        return commandValue
    }

    /**
     * Returns command value.
     */
    //% blockId=vc_slider_value
    //% block="slider value"
    //% weight=50
    export function getSliderValue() {
        return commandValue
    }


    /**
     * Returns selected command name.
     */
    //% blockId=vc_set_command_name
    //% block="input type: %inputName"
    //% weight=50
    export function setCommandName(inputName: InputName) {
        return commandName == InputNameLabel[inputName]
    }

    //% blockId="vc_on_command"
    //% block="On command received"
    export function onVCcommand(
        handler: () => void
    ) {
        basic.forever(function () {
            while (Object.keys(latestCommands).length) {
                commandName = Object.keys(latestCommands)[0]
                commandValue = latestCommands[commandName]
                delete latestCommands[commandName];

                // if (commandName == "-v") {

                // } else if (commandName == "oy" || commandName == "sl" || commandName == "jry") {

                // } else if (commandName == "ox" || commandName == "sr" || commandName == "jrx") {

                // }
                handler()
            }
        })
    }

    /**
     * Check command comes from slider.
     */
    //% blockId=vc_is_slider
    //% block="is slider on the %InputSide"
    //% weight=50
    export function isSlider(inputSide: InputSide) {
        let sideMap = {
            1: 'sl',
            2: 'sr'
        }
        return commandName == sideMap[inputSide]
    }
}