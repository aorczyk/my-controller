const enum KeyCode {
    //% block="Arrow Up"
    ArrowUp = 1,
    //% block="Arrow Down"
    ArrowDown = 2,
    //% block="Arrow Right"
    ArrowRight = 3,
    //% block="Arrow Left"
    ArrowLeft = 4,
    //% block="Enter"
    Enter = 5,
    //% block="Space"
    Space = 6,
}

const KeyCodeLabel: { [n: number]: string } = {
    [KeyCode.ArrowUp]: "up",
    [KeyCode.ArrowDown]: "down",
    [KeyCode.ArrowRight]: "right",
    [KeyCode.ArrowLeft]: "left",
    [KeyCode.Enter]: "enter",
    [KeyCode.Space]: "space",
}

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
    //% block="X"
    x = 1,
    //% block="X"
    y = 2,
}

const enum KeyState {
    //% block="pressed"
    Pressed = 1,
    //% block="released"
    Released = 0,
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

                if (commandName == "jlx") {
                    leftJoystickValueX = commandValue
                }

                if (commandName == "jly") {
                    leftJoystickValueY = commandValue
                }

                handler()
            }
        })
    }

    /**
     * Check command comes from slider.
     */
    //% blockId=vc_is_slider
    //% block="%InputSide slider"
    //% weight=50
    export function isSlider(inputSide: InputSide) {
        let sideMap = {
            1: 'sr',
            2: 'sl'
        }
        return commandName == sideMap[inputSide]
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
    //% block="%InputSide joystick"
    //% weight=50
    export function isJoystick(inputSide: InputSide) {
        let sideMap = {
            1: 'jr',
            2: 'jl'
        }

        return commandName == sideMap[inputSide] + 'x' || commandName == sideMap[inputSide] + 'y'
    }

    /**
     * Joystick value.
     */
    //% blockId=vc_joystick_value
    //% block="%InputSide joystick %InputDirection value"
    //% weight=50
    export function getJoystickValue(inputSide: InputSide, inputDirection: InputDirection) {
        if (inputSide == 1) {
            if (inputDirection == 1) {
                return rightJoystickValueX
            } else {
                return rightJoystickValueY
            }
        } else {
            if (inputDirection == 1) {
                return leftJoystickValueX
            } else {
                return leftJoystickValueY
            }
        }
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


    /**
     * Key pressed.
     */
    //% blockId=vc_is_key
    //% block="%keyCode key %keyState"
    //% weight=50
    export function isKey(keyCode: string, keyState: KeyState) {
        return commandName == (keyState ? '' : '!') + keyCode.toLowerCase()
    }

    // "[Enter] key code"

    /**
     * Key code value.
     */
    //% blockId=vc_key_code_value
    //% block="%keyCode key code"
    //% weight=50
    export function getKeyCodeValue(keyCode: KeyCode) {
        return KeyCodeLabel[keyCode]
    }
}