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

const enum InputDirection {
    //% block="x"
    x = 1,
    //% block="y"
    y = 2,
}

//% color=#485fc7 icon="\uf11b" block="Controller"
namespace vcController {
    let latestCommands: { [key: string]: number } = {}
    let commandName: string;
    let commandValue: number;

    let rightSliderValue: number;
    let leftSliderValue: number;

    let rightJoystickValueX: number;
    let rightJoystickValueY: number;

    let leftJoystickValueX: number;
    let leftJoystickValueY: number;

    bluetooth.startUartService()

    bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        let commadParts: string[] = []
        let command: string;
        command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
        commadParts = command.split("=")
        latestCommands[commadParts[0]] = parseFloat(commadParts[1])
    })

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

                if (commandName == "sr") {
                    rightSliderValue = commandValue
                }

                if (commandName == "sl") {
                    leftSliderValue = commandValue
                }

                if (commandName == "jrx") {
                    rightJoystickValueX = commandValue
                }

                if (commandName == "jry") {
                    rightJoystickValueY = commandValue
                }

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
    //% block="slider on the %InputSide"
    //% weight=50
    export function isSlider(inputSide: InputSide) {
        let sideMap = {
            1: 'sr',
            2: 'sl'
        }
        return commandName == sideMap[inputSide]
    }

    /**
     * Right slider value.
     */
    //% blockId=vc_right_slider_value
    //% block="right slider value"
    //% weight=50
    export function getRightSliderValue() {
        return rightSliderValue
    }

    /**
     * Left slider value.
     */
    //% blockId=vc_left_slider_value
    //% block="left slider value"
    //% weight=50
    export function getLeftSliderValue() {
        return leftSliderValue
    }

    /**
     * Slider value.
     */
    //% blockId=vc_slider_value
    //% block="%InputSide slider value"
    //% weight=50
    export function getSliderValue(inputSide: InputSide) {
        if (inputSide == 1) {
            return rightSliderValue
        } else {
            return leftSliderValue
        }
    }

    /**
     * Check command comes from joystick.
     */
    //% blockId=vc_is_joystick
    //% block="joystick on the %InputSide direction %InputDirection"
    //% weight=50
    export function isJoystick(inputSide: InputSide, inputDirection: InputDirection) {
        let sideMap = {
            1: 'jr',
            2: 'jl'
        }

        let directionMap = {
            1: 'x',
            2: 'y'
        }

        return commandName == sideMap[inputSide] + directionMap[inputDirection]
    }

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
     * Returns selected command name.
     */
    //% blockId=vc_set_command_name
    //% block="input type: %inputName"
    //% weight=50
    export function setCommandName(inputName: InputName) {
        return commandName == InputNameLabel[inputName]
    }
}