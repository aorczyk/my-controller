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

const enum InputSide {
    //% block="right"
    Right = 1,
    //% block="left"
    Left = 2,
}

const enum InputDirection {
    //% block="X"
    x = 1,
    //% block="Y"
    y = 2,
}

const enum KeyState {
    //% block="pressed"
    Pressed = 1,
    //% block="released"
    Released = 0,
}

//% color=#485fc7 icon="\uf11b" block="My Controller"
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

    /**
     * Runs the code inside when a command is received.
     */
    //% blockId="vc_on_command"
    //% block="On command received"
    //% weight=90
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
     * Checks whether the selected key is in the chosen state.
     */
    //% blockId=vc_is_key
    //% block="%keyCode key %keyState"
    //% weight=89
    export function isKey(keyCode: string, keyState: KeyState) {
        return commandName == (keyState ? '' : '!') + keyCode.toLowerCase()
    }

    /**
     * Checks whether the selected key is in the chosen state.
     */
    //% blockId=vc_is_special_key
    //% block="%keyCode key %keyState"
    //% weight=88
    export function isSpecialKey(keyCode: KeyCode, keyState: KeyState) {
        return commandName == (keyState ? '' : '!') + KeyCodeLabel[keyCode]
    }

    /**
     * Key code value.
     */
    //% blockId=vc_key_code_value
    //% block="code of %keyCode key"
    //% weight=87
    // export function getKeyCodeValue(keyCode: KeyCode) {
    //     return KeyCodeLabel[keyCode]
    // }

    /**
     * True if the command comes from the slider.
     */
    //% blockId=vc_is_slider
    //% block="%InputSide slider"
    //% weight=79
    export function isSlider(inputSide: InputSide) {
        return commandName == (inputSide == 1 ? 'sr' : 'sl')
    }

    /**
     * Slider value.
     */
    //% blockId=vc_slider_value
    //% block="%InputSide slider value"
    //% weight=78
    export function getSliderValue(inputSide: InputSide) {
        if (inputSide == 1) {
            return rightSliderValue
        } else {
            return leftSliderValue
        }
    }

    /**
     * True if the command comes from the joystick.
     */
    //% blockId=vc_is_joystick
    //% block="%InputSide joystick %InputDirection direction"
    //% weight=69
    export function isJoystick(inputSide: InputSide, inputDirection: InputDirection) {
        return commandName == (inputSide == 1 ? 'jr' : 'jl') + (inputDirection == 1 ? 'x' : 'y')
    }

    /**
     * Joystick value.
     */
    //% blockId=vc_joystick_value
    //% block="%InputSide joystick %InputDirection value"
    //% weight=68
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
     * Command name.
     */
    //% blockId=vc_command_name
    //% block="command name"
    //% weight=59
    export function getCommandName() {
        return commandName
    }

    /**
     * Command value.
     */
    //% blockId=vc_command_value
    //% block="command value"
    //% weight=58
    export function getCommandValue() {
        return commandValue
    }
}