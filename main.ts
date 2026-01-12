/**
 * My Controller - virtual controller.
 * Controlling a micro:bit from the app My micro:bit.
 * 
 * This extension allows you to:
 * - Controlling a micro:bit via Bluetooth or WebUSB from the app My micro:bit Controller
 * - Receive button presses and releases
 * - Read slider values
 * - Get joystick positions
 * - Monitor device orientation
 * - Configure the controller layout.
 * 
 * (c) 2025, Adam Orczyk
 */

//% color=#485fc7 icon="\uf11b" block="My Controller"
namespace myController {
    // Handling fast changing commands from sliders, joysticks, and orientation. When multiple commands are received quickly, we store only the latest value for each command. Then we process them one by one in the onCommand handler. This ensures we always have the most recent state for each input. Works better than an array queue.
    let latestCommands: { [key: string]: number } = {};
    let commandName: string;
    let commandValue: number;
    // Tracking the current pressed/released state of buttons. For multiple buttons pressed at the same time.
    let pressedKeys: { [key: string]: boolean } = {};
    let buttonStates: { [key: string]: number } = {};
    let setup: () => void = () => {};
    let commandsHandler: () => void = () => {};
    let btConnected = false;
    let serialConnected = false;

    export const enum KeyCode {
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

    export const enum InputSide {
        //% block="right"
        Right = 1,
        //% block="left"
        Left = 2,
    }

    export const enum JoystickDirection {
        //% block="x"
        x = 1,
        //% block="y"
        y = 2,
    }

    export const enum InputOrientaton {
        //% block="x"
        x = 1,
        //% block="y"
        y = 2,
        //% block="z"
        z = 3,
        //% block="compass"
        c = 4,
    }

    export const enum KeyState {
        //% block="pressed"
        Pressed = 1,
        //% block="released"
        Released = 0,
    }

    export const enum KeyColor {
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

    export const enum KeyVisibility {
        //% block="visible"
        Visible = 1,
        //% block="hidden"
        Hidden = 0,
    }

    export const enum SetupConfirmation {
        //% block="require confirmation"
        Require = 1,
        //% block="no confirmation"
        NoRequire = 0,
    }

    function onDataReceived(command: string) {
        let [commandName, commandValue] = command.split("=")

        // Button press/release or some other non-numeric command (to be handled later).
        if (commandValue == undefined) {
            if (commandName[0] == '!') {
                delete pressedKeys[commandName.slice(1)]
            } else {
                pressedKeys[commandName] = true
            }
        }

        latestCommands[commandName] = parseFloat(commandValue)
    }

    // Main loop to process incoming commands one by one.

    basic.forever(function () {
        if (Object.keys(latestCommands).length) {
            commandName = Object.keys(latestCommands)[0]
            commandValue = latestCommands[commandName]
            delete latestCommands[commandName];

            setup()
            commandsHandler()
        }
    })

    // Blocks

    /**
     * Initializes Bluetooth communication with the controller app.
     */
    //% blockId=myController_use_bluetooth
    //% block="use Bluetooth"
    //% weight=100
    export function useBluetooth() {
        // Initialize Bluetooth UART service and serial communication.

        bluetooth.startUartService()
        bluetooth.onBluetoothConnected(() => {
            btConnected = true;
            pressedKeys = {};
        })
        bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            onDataReceived(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)))
        })
    }

    /**
     * Initializes WebUSB communication with the controller app.
     */
    //% blockId=myController_use_serial
    //% block="use Serial"
    //% weight=99
    export function useSerial() {
        // Initialize serial communication for WebUSB.

        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            onDataReceived(serial.readUntil(serial.delimiters(Delimiters.NewLine)))
        })
    }

    /**
     * Runs the code inside when any command is received from the controller.
     * Use this block to handle all incoming commands including key presses, slider changes, joystick movements, and orientation updates.
     * @param handler code to run when a command is received
     */
    //% blockId="myController_on_command"
    //% block="on command received"
    //% weight=92
    export function onCommand(
        handler: () => void
    ) {
        commandsHandler = handler
    }

    /**
     * Returns the name of the most recently received command.
     */
    //% blockId=myController_command_name
    //% block="command name"
    //% weight=91
    export function getCommandName() {
        return commandName
    }

    /**
     * Returns the value of the most recently received command.
     */
    //% blockId=myController_command_value
    //% block="command value"
    //% weight=90
    export function getCommandValue() {
        return commandValue
    }

    /**
     * Returns true if the specified button is in the chosen state.
     * @param keyCode the button to check
     * @param keyState the state to check for (pressed or released)
     */
    //% blockId=myController_is_key
    //% block="button %keyCode %KeyState"
    //% weight=89
    //% group="Buttons"
    export function isKey(keyCode: string, keyState: KeyState) {
        let code = keyCode.toLowerCase();
        return keyState ? pressedKeys[code] : (commandName == '!' + code)
    }

    const KeyCodeLabel: { [n: number]: string } = {
        [KeyCode.ArrowUp]: "up",
        [KeyCode.ArrowDown]: "down",
        [KeyCode.ArrowRight]: "right",
        [KeyCode.ArrowLeft]: "left",
        [KeyCode.Enter]: "enter",
        [KeyCode.Space]: "space",
    }

    /**
     * Returns the string code for the specified button.
     * @param keyCode the button to get the code for
     */
    //% blockId=myController_key_code_value
    //% block="code of %KeyCode button"
    //% weight=87
    //% group="Buttons"
    export function getKeyCodeValue(keyCode: KeyCode) {
        return KeyCodeLabel[keyCode] || ""
    }

    /**
     * Returns true if all keys have been released.
     */
    //% blockId=myController_are_all_keys_released
    //% block="all buttons released"
    //% weight=86
    //% group="Buttons"
    export function areAllKeysReleased() {
        return commandName == 'none'
    }

    /**
     * Returns true if the button toggles on, false if it toggles off.
     * Each function call switches the button state.
     */
    //% blockId="myController_button_toggled"
    //% block="button toggled"
    //% weight=85
    //% group="Buttons"
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
     * Returns the current toggle count for the button (1 to max count).
     * Each function call increments the counter until it reaches the maximum, then resets to 0.
     * @param toggleMaxCount the maximum toggle count (default is 1)
     */
    //% blockId="myController_button_toggle_count"
    //% block="button toggle count %toggleMaxCount"
    //% toggleMaxCount.defl=1
    //% weight=84
    //% group="Buttons"
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

    /**
     * Returns true if the specified slider value has changed.
     * @param inputSide the slider side to check
     */
    //% blockId=myController_is_slider
    //% block="%InputSide slider changed"
    //% weight=79
    //% group="Inputs"
    export function isSlider(inputSide: InputSide) {
        return commandName == (inputSide == 1 ? 'sr' : 'sl')
    }

    /**
     * Returns true if the specified joystick axis value has changed.
     * @param inputSide the joystick side to check
     * @param inputDirection the joystick axis to check
     */
    //% blockId=myController_is_joystick
    //% block="%InputSide joystick %JoystickDirection changed"
    //% weight=69
    //% group="Inputs"
    export function isJoystick(inputSide: InputSide, inputDirection: JoystickDirection) {
        return commandName == (inputSide == 1 ? 'jr' : 'jl') + (inputDirection == 1 ? 'x' : 'y')
    }

    /**
     * Returns true if the specified orientation axis value has changed.
     * @param inputOrient the orientation axis to check
     */
    //% blockId=myController_is_orientation
    //% block="orientation %InputOrientaton changed"
    //% weight=67
    //% group="Inputs"
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
     * Runs the code inside when the controller connects and sends the setup signal. When option require confirmation is selected, the controller app will wait for confirmation before applying settings.
     * @param requireConfirmation whether to require user confirmation in the app before applying settings
     * @param handler code to run during setup
     */
    //% blockId="myController_setup"
    //% block="setup %SetupConfirmation"
    //% weight=51
    //% requireConfirmation.defl=SetupConfirmation.Require
    //% group="Setup"
    export function onSetup(
        requireConfirmation: SetupConfirmation,
        handler: () => void,
    ) {
        setup = () => {
            if (commandName == "-v") {
                if (requireConfirmation) {
                    sendData('vc;hasSettings;1;')
                } else {
                    sendData('vc;loader;1;')
                    handler()
                    sendData('vc;loader;0;')
                }
            } else if (commandName == "getSettings") {
                sendData('vc;loader;1;')
                handler()
                sendData('vc;loader;0;')
            } else if (commandName == "usbOn") {
                serialConnected = true;
                pressedKeys = {};
            }
        };
    }

    /**
     * Imports controller settings from the provided data string.
     * Use this block to quickly set up the controller interface by pasting
     * the exported settings code from the controller settings page.
     * @param data commands exported from the controller settings page, each command on a new line
     */
    //% blockId="myController_import_settings"
    //% block="import settings %data"
    //% inlineInputMode=inline
    //% weight=50
    //% data.defl=''
    //% group="Setup"
    export function importSettings(data: string) {
        let commands = data.split('; ');
        for (let i = 0; i < commands.length; i++) {
            sendData(commands[i]);
        }
    }

    /**
     * Sends a raw data command to the controller app via Bluetooth or WebUSB.
     * Use this block to send custom commands not covered by other blocks.
     * @param data the raw command string to send
     */
    //% blockId="myController_send_data"
    //% block="send data %data"
    //% inlineInputMode=inline
    //% weight=49
    //% data.defl=''
    //% group="Setup"
    export function sendData(data: string) {
        if (btConnected) {
            bluetooth.uartWriteLine(data)
        }

        if (serialConnected) {
            serial.writeLine(data)
        }
    }

    /**
     * Configures a button in the controller app.
     * Use this block to set the button's visibility, color, and display label.
     * @param code the button code (e.g., "a", "b", "up", "down")
     * @param visibility whether the button is visible or hidden
     * @param color the button color
     * @param label optional text or number to display on the button
     */
    //% blockId="myController_set_button_color"
    //% block="set button $code|$visibility|$color|label $label"
    //% inlineInputMode=inline
    //% weight=48
    //% code.defl=''
    //% visibility.defl=KeyVisibility.Visible
    //% color.defl=KeyColor.Black
    //% label.defl=''
    //% group="Setup"
    export function setButton(
        code: string,
        visibility: KeyVisibility,
        color?: KeyColor,
        label?: string | number
    ) {
        sendData(['vc;b', code, visibility, color, label,].join(';'));
    }

}