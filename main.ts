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

const enum JoystickDirection {
    //% block="X"
    x = 1,
    //% block="Y"
    y = 2,
}

const enum InputOrientaton {
    //% block="X"
    x = 1,
    //% block="Y"
    y = 2,
    //% block="Z"
    z = 3,
    //% block="Compass"
    c = 4,
}

const enum KeyState {
    //% block="pressed"
    Pressed = 1,
    //% block="released"
    Released = 0,
}

const enum KeyColor {
    //% block="black"
    Black = 0,
    //% block="green"
    Green = 1,
    //% block="blue"
    Blue = 2,
    //% block="yellow"
    Yellow = 3,
    //% block="red"
    Red = 4,
}

const enum KeyVisibility {
    //% block="visible"
    Visible = 1,
    //% block="hidden"
    Hidden = 0,
}

//% color=#485fc7 icon="\uf11b" block="My Controller"
namespace vcController {
    let latestCommands: { [key: string]: number } = {}
    let commandName: string;
    let commandValue: number;
    let pressedKeys: string[] = [];
    let setup = (commandName: string) => { };

    // let rightSliderValue: number;
    // let leftSliderValue: number;

    // let rightJoystickXvalue: number;
    // let rightJoystickYvalue: number;

    // let leftJoystickXvalue: number;
    // let leftJoystickYvalue: number;

    // let orientationXvalue: number;
    // let orientationYvalue: number;
    // let orientationZvalue: number;
    // let orientationCompassValue: number;

    bluetooth.startUartService()

    bluetooth.onBluetoothConnected(() => {
        pressedKeys = []
    })

    bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        let commadParts: string[] = []
        let command: string;
        command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
        commadParts = command.split("=")
        latestCommands[commadParts[0]] = parseFloat(commadParts[1])
    })

    /**
     * Runs the code inside when any command is received from the controller.
     * Use this block to handle all incoming commands including key presses, slider changes, joystick movements, and orientation updates.
     */
    //% blockId="vc_on_command"
    //% block="on command received"
    //% weight=92
    export function onVCcommand(
        handler: () => void
    ) {
        basic.forever(function () {
            while (Object.keys(latestCommands).length) {
                commandName = Object.keys(latestCommands)[0]
                commandValue = latestCommands[commandName]
                delete latestCommands[commandName];

                setup(commandName)

                if (commandName.indexOf(';') == -1) {
                    if (commandName[0] == '!') {
                        pressedKeys.splice(pressedKeys.indexOf(commandName.slice(1)), 1)
                    } else {
                        pressedKeys.push(commandName)
                    }
                }

                // if (commandName == "sr") {
                //     rightSliderValue = commandValue
                // }

                // if (commandName == "sl") {
                //     leftSliderValue = commandValue
                // }

                // if (commandName == "jrx") {
                //     rightJoystickXvalue = commandValue
                // }

                // if (commandName == "jry") {
                //     rightJoystickYvalue = commandValue
                // }

                // if (commandName == "jlx") {
                //     leftJoystickXvalue = commandValue
                // }

                // if (commandName == "jly") {
                //     leftJoystickYvalue = commandValue
                // }

                handler()
            }
        })
    }

    /**
     * Returns the name of the most recently received command.
     */
    //% blockId=vc_command_name
    //% block="command name"
    //% weight=91
    export function getCommandName() {
        return commandName
    }

    /**
     * Returns the value of the most recently received command.
     */
    //% blockId=vc_command_value
    //% block="command value"
    //% weight=90
    export function getCommandValue() {
        return commandValue
    }

    /**
     * Returns true if the specified button is in the chosen state.
     */
    //% blockId=vc_is_key
    //% block="button %keyCode %keyState"
    //% weight=89
    export function isKey(keyCode: string, keyState: KeyState) {
        // return commandName == (keyState ? '' : '!') + keyCode.toLowerCase()
        let code = keyCode.toLowerCase();
        return keyState ? pressedKeys.indexOf(code) != -1 : commandName == '!' + code
    }

    /**
     * Returns true if the selected button is in the chosen state.
     */
    //% blockId=vc_is_special_key
    //% block="%keyCode is %keyState"
    //% weight=88
    // export function isSpecialKey(keyCode: KeyCode, keyState: KeyState) {
    //     return isKey(KeyCodeLabel[keyCode], keyState)
    // }

    /**
     * Returns the string code for the specified button.
     */
    //% blockId=vc_key_code_value
    //% block="code of %keyCode button"
    //% weight=87
    export function getKeyCodeValue(keyCode: KeyCode) {
        return KeyCodeLabel[keyCode]
    }

    /**
     * Returns true if all keys have been released.
     */
    //% blockId=vc_are_all_keys_released
    //% block="all keys released"
    //% weight=86
    export function areAllKeysReleased() {
        return commandName == 'none'
    }

    /**
     * Returns true if the specified slider value has changed.
     */
    //% blockId=vc_is_slider
    //% block="%InputSide slider changed"
    //% weight=79
    export function isSlider(inputSide: InputSide) {
        return commandName == (inputSide == 1 ? 'sr' : 'sl')
    }

    /**
     * Returns the value of the specified slider.
     */
    //% blockId=vc_slider_value
    //% block="%InputSide slider value"
    //% weight=78
    // export function getSliderValue(inputSide: InputSide) {
    //     if (inputSide == 1) {
    //         return rightSliderValue
    //     } else {
    //         return leftSliderValue
    //     }
    // }

    /**
     * Returns true if the specified joystick axis value has changed.
     */
    //% blockId=vc_is_joystick
    //% block="%InputSide joystick %JoystickDirection changed"
    //% weight=69
    export function isJoystick(inputSide: InputSide, inputDirection: JoystickDirection) {
        return commandName == (inputSide == 1 ? 'jr' : 'jl') + (inputDirection == 1 ? 'x' : 'y')
    }

    /**
     * Returns the value of the specified joystick axis.
     */
    //% blockId=vc_joystick_value
    //% block="%InputSide joystick %JoystickDirection value"
    //% weight=68
    // export function getJoystickValue(inputSide: InputSide, inputDirection: JoystickDirection) {
    //     if (inputSide == 1) {
    //         if (inputDirection == 1) {
    //             return rightJoystickXvalue
    //         } else {
    //             return rightJoystickYvalue
    //         }
    //     } else {
    //         if (inputDirection == 1) {
    //             return leftJoystickXvalue
    //         } else {
    //             return leftJoystickYvalue
    //         }
    //     }
    // }

    /**
     * Returns true if the specified orientation axis value has changed.
     */
    //% blockId=vc_is_orientation
    //% block="orientation %InputOrientaton changed"
    //% weight=67
    export function isOrientation(inputOrient: InputOrientaton) {
        let modes = {
            1: 'ox',
            2: 'oy',
            3: 'oz',
            4: 'oc',
        }
        return commandName == modes[inputOrient]
    }

    /**
     * Returns the value of the specified orientation axis.
     */
    //% blockId=vc_orientation_value
    //% block="orientation %InputOrientaton value"
    //% weight=66
    // export function getOrientationValue(inputOrient: InputOrientaton) {
    //     switch(inputOrient) {
    //         case 1:
    //             return orientationXvalue;
    //         case 2:
    //             return orientationYvalue;
    //         case 3:
    //             return orientationZvalue;
    //         case 4:
    //             return orientationCompassValue;
    //         default:
    //             return 0;
    //     }
    // }

    let buttonStates: { [key: string]: number } = {}

    /**
     * Runs the code inside when the controller connects and sends the setup signal.
     */
    //% blockId="vc_setup"
    //% block="setup"
    //% weight=51
    //% requireConfirmation.defl=false
    export function onVCsetup(
        // requireConfirmation: boolean,
        handler: () => void
    ) {
        setup = (commandName) => {
            if (commandName == "-v") {
                bluetooth.uartWriteLine('vc;hasSettings;1;')
            } else if (commandName == "getSettings") {
                bluetooth.uartWriteLine('vc;loader;1;')
                handler()
                bluetooth.uartWriteLine('vc;loader;0;')
            }
        };
    }

    /**
     * Configures a button in the controller app.
     * Use this block to set the button's visibility, color, and display label.
     * @param code the button code (e.g., "a", "b", "up", "down")
     * @param visibility whether the button is visible or hidden
     * @param color the button color
     * @param label optional text or number to display on the button
     */
    //% blockId="vc_set_button_color"
    //% block="set button %code %visibility %color label %label"
    //% weight=50
    //% code.defl=''
    //% visibility.defl=KeyVisibility.Visible
    //% color.defl=KeyColor.Black
    //% label.defl=''
    export function setButton(
        code: string,
        visibility: KeyVisibility,
        color: KeyColor,
        label: string | number = ''
    ) {
        bluetooth.uartWriteLine('vc;b;' + code + ';' + visibility + ';' + color + ';' + label + ';');
    }

    /**
     * Returns true if the button toggles on, false if it toggles off.
     */
    //% blockId="vc_button_toggled"
    //% block="button toggled"
    //% weight=41
    export function buttonToggled(
    ) {
        if (!buttonStates[commandName]) {
            buttonStates[commandName] = 1;
        } else {
            buttonStates[commandName] = 0;
        }

        return buttonStates[commandName] == 1;
    }

    /**
     * Returns the current toggle count for the button (0 to max count).
     * Each button press increments the counter until it reaches the maximum, then resets to 0.
     */
    //% blockId="vc_button_toggle_count"
    //% block="button toggle count %toggleMaxCount"
    //% toggleMaxCount.defl=1
    //% weight=40
    export function buttonToggleCount(
        toggleMaxCount: number = 1,
    ) {
        if (buttonStates[commandName] == undefined) {
            buttonStates[commandName] = 0;
        }

        if (buttonStates[commandName] < toggleMaxCount) {
            buttonStates[commandName] += 1;
        } else {
            buttonStates[commandName] = 0;
        }

        return buttonStates[commandName];
    }
}