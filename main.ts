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
    export const enum ButtonName {
        //% block="arrow up"
        ArrowUp = 1,
        //% block="arrow down"
        ArrowDown = 2,
        //% block="arrow right"
        ArrowRight = 3,
        //% block="arrow left"
        ArrowLeft = 4,
        //% block="enter"
        Enter = 5,
        //% block="space"
        Space = 6,
    }

    export const enum ControllerSide {
        //% block="right"
        Right = 1,
        //% block="left"
        Left = 2,
    }

    export const enum JoystickDirection {
        //% block="x"
        X = 1,
        //% block="y"
        Y = 2,
    }

    export const enum OrientationAxis {
        //% block="x"
        X = 1,
        //% block="y"
        Y = 2,
        //% block="z"
        Z = 3,
        //% block="compass"
        Compass = 4,
    }

    export const enum ButtonState {
        //% block="pressed"
        Pressed = 1,
        //% block="released"
        Released = 0,
    }

    export const enum ButtonColor {
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

    export const enum ButtonVisibility {
        //% block="visible"
        Visible = 1,
        //% block="hidden"
        Hidden = 0,
    }

    export const enum ConfirmationMode {
        //% block="require confirmation"
        Require = 1,
        //% block="no confirmation"
        NoRequire = 0,
    }

    class State {
        // Handling fast changing commands from sliders, joysticks, and orientation. When multiple commands are received quickly, we store only the latest value for each command. Then we process them one by one in the onCommand handler. This ensures we always have the most recent state for each input. Works better than an array queue.
        receivedCommands: { [key: string]: number } = {};
        receivedCommandName: string;
        receivedCommandValue: number;

        // Tracking the current pressed/released state of buttons. For multiple buttons pressed at the same time.
        pressedKeys: { [key: string]: boolean } = {};

        // Communication method flags.
        receivedBLE = false;
        receivedSerial = false;

        // Storing toggle states and counts for buttons.
        buttonStates: { [key: string]: number } = {};

        // Handlers
        commandsHandler: () => void = () => {};
        setupHandler: () => void = () => {};

        constructor() {}
    }

    let state : State = undefined;

    function initialize() {
        if (state == undefined) {
            state = new State();

            // Main loop to process incoming commands one by one.
            basic.forever(function () {
                let keys = state ? Object.keys(state.receivedCommands) : []

                if (keys.length) {
                    state.receivedCommandName = keys[0]
                    state.receivedCommandValue = state.receivedCommands[state.receivedCommandName]
                    delete state.receivedCommands[state.receivedCommandName];

                    state.setupHandler()
                    state.commandsHandler()
                }
            })
        }
    }

    function onDataReceived(command: string) {
        let [commandName, commandValue] = command.split("=")

        // Button press/release or some other non-numeric command (to be handled later).
        if (commandValue == undefined) {
            if (commandName[0] == '!') {
                delete state.pressedKeys[commandName.slice(1)]
            } else {
                state.pressedKeys[commandName] = true
            }
        }

        state.receivedCommands[commandName] = parseFloat(commandValue)
    }

    // Blocks

    /**
     * Initializes Bluetooth communication (BLE) with the controller app.
     * Must be called before receiving commands from the controller.
     */
    //% blockId=myController_use_bluetooth
    //% block="use Bluetooth"
    //% weight=100
    //% group="Communication"
    export function useBluetooth() {
        initialize()

        // Initialize Bluetooth UART service and serial communication.
        bluetooth.startUartService()
        bluetooth.onBluetoothConnected(() => {
            state.receivedBLE = true;
            state.pressedKeys = {};
        })
        bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            onDataReceived(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)))
        })
    }

    /**
     * Initializes Serial (WebUSB) communication with the controller app.
     */
    //% blockId=myController_use_serial
    //% block="use Serial"
    //% weight=99
    //% group="Communication"
    export function useSerial() {
        initialize()

        // Initialize serial communication for WebUSB.
        serial.setWriteLinePadding(0)
        serial.setTxBufferSize(240)
        serial.setRxBufferSize(240)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            onDataReceived(serial.readUntil(serial.delimiters(Delimiters.NewLine)))
        })
    }

    /**
     * Runs the code inside when any command is received from the controller.
     * Use this block to handle all incoming commands including key presses,
     * slider changes, joystick movements, and orientation updates.
     * @param handler code to run when a command is received
     */
    //% blockId="myController_on_command"
    //% block="on command received"
    //% weight=92
    //% group="Commands"
    export function onCommandReceived(handler: () => void) {
        initialize()
        state.commandsHandler = handler
    }

    /**
     * Returns the name of the most recently received command.
     */
    //% blockId=myController_command_name
    //% block="command name"
    //% weight=91
    //% group="Commands"
    export function commandName(): string {
        return state.receivedCommandName
    }

    /**
     * Returns the value of the most recently received command.
     */
    //% blockId=myController_command_value
    //% block="command value"
    //% weight=90
    //% group="Commands"
    export function commandValue(): number {
        return state.receivedCommandValue
    }

    /**
     * Returns true if the specified button is in the chosen state.
     * @param buttonCode the button to check
     * @param buttonState the state to check for (pressed or released)
     */
    //% blockId=myController_is_button
    //% block="is button %buttonCode %buttonState"
    //% weight=89
    //% group="Buttons"
    export function isButton(buttonCode: string, buttonState: ButtonState) {
        let code = buttonCode.toLowerCase();
        return buttonState ? state.pressedKeys[code] : (state.receivedCommandName == '!' + code)
    }

    /**
     * Returns the string code for the specified button.
     * @param buttonCode the button to get the code for
     */
    //% blockId=myController_button_code
    //% block="code of %ButtonName"
    //% weight=87
    //% group="Buttons"
    export function buttonCode(buttonCode: ButtonName) {
        const nameToCode: { [n: number]: string } = {
            [ButtonName.ArrowUp]: "up",
            [ButtonName.ArrowDown]: "down",
            [ButtonName.ArrowRight]: "right",
            [ButtonName.ArrowLeft]: "left",
            [ButtonName.Enter]: "enter",
            [ButtonName.Space]: "space",
        }

        return nameToCode[buttonCode] || ""
    }

    /**
     * Returns true if all buttons have been released.
     */
    //% blockId=myController_all_buttons_released
    //% block="all buttons released"
    //% weight=86
    //% group="Buttons"
    export function allButtonsReleased() {
        return state.receivedCommandName == 'none'
    }

    /**
     * Toggles the button state. Returns true if the button is now on, false if off.
     * Each function call switches the button state.
     */
    //% blockId="myController_toggle_button"
    //% block="toggle button"
    //% weight=85
    //% group="Buttons"
    export function toggleButton(): boolean {
        if (!state.buttonStates[state.receivedCommandName]) {
            state.buttonStates[state.receivedCommandName] = 1;
        } else {
            state.buttonStates[state.receivedCommandName] = 0;
        }

        return state.buttonStates[state.receivedCommandName] == 1;
    }

    /**
     * Increments the button toggle counter and returns the current value (1 to max).
     * When the counter reaches the maximum, it resets to 0.
     * @param toggleMaxCount the maximum toggle count (default is 1)
     */
    //% blockId="myController_next_button_toggle"
    //% block="button toggle count (max %toggleMaxCount)"
    //% toggleMaxCount.defl=1
    //% weight=84
    //% group="Buttons"
    export function nextButtonToggle(toggleMaxCount: number = 1): number {
        if (state.buttonStates[state.receivedCommandName] == undefined) {
            state.buttonStates[state.receivedCommandName] = 0;
        }

        if (state.buttonStates[state.receivedCommandName] < toggleMaxCount) {
            state.buttonStates[state.receivedCommandName] += 1;
        } else {
            state.buttonStates[state.receivedCommandName] = 0;
        }

        return state.buttonStates[state.receivedCommandName];
    }

    /**
     * Returns true if the specified slider value was received from the app.
     * @param controllerSide the slider side to check
     */
    //% blockId=myController_is_slider
    //% block="%ControllerSide slider"
    //% weight=79
    //% group="Inputs"
    export function isSlider(controllerSide: ControllerSide): boolean {
        return state.receivedCommandName == (controllerSide == 1 ? 'sr' : 'sl')
    }

    /**
     * Returns true if the specified joystick axis value was received from the app.
     * @param controllerSide the joystick side to check
     * @param direction the joystick axis to check
     */
    //% blockId=myController_is_joystick
    //% block="%ControllerSide joystick %JoystickDirection"
    //% weight=69
    //% group="Inputs"
    export function isJoystick(
        controllerSide: ControllerSide,
        direction: JoystickDirection
    ): boolean {
        return state.receivedCommandName == (controllerSide == 1 ? 'jr' : 'jl') + (direction == 1 ? 'x' : 'y')
    }

    /**
     * Returns true if the specified orientation axis value was received from the app.
     * @param axis the orientation axis to check
     */
    //% blockId=myController_is_orientation
    //% block="orientation %OrientationAxis"
    //% weight=67
    //% group="Inputs"
    export function isOrientation(axis: OrientationAxis): boolean {
        let modes = {
            1: 'ox',
            2: 'oy',
            3: 'oz',
            4: 'oc',
        }
        return state.receivedCommandName == modes[axis]
    }


    /**
     * Runs the code when the controller connects and sends the setup signal.
     * If requireConfirmation is selected, the controller app will wait for confirmation before applying settings.
     * @param confirmationMode whether user confirmation is required in the app before applying settings
     * @param handler code to run during setup
     */
    //% blockId="myController_on_setup"
    //% block="on setup %ConfirmationMode"
    //% weight=51
    //% confirmationMode.defl=ConfirmationMode.Require
    //% group="Setup"
    export function onSetup(
        confirmationMode: ConfirmationMode,
        handler: () => void
    ) {
        initialize()

        state.setupHandler = () => {
            if (state.receivedCommandName == "-v") {
                if (confirmationMode) {
                    sendData('vc;hasSettings;1;')
                } else {
                    sendData('vc;loader;1;')
                    handler()
                    sendData('vc;loader;0;')
                }
            } else if (state.receivedCommandName == "getSettings") {
                sendData('vc;loader;1;')
                handler()
                sendData('vc;loader;0;')
            } else if (state.receivedCommandName == "usbOn") {
                state.receivedSerial = true;
                state.pressedKeys = {};
            }
        };
    }

    /**
     * Imports controller settings from the provided data string.
     * Use this block to quickly set up the controller interface by pasting
     * the exported settings code from the controller settings page.
     * @param data commands exported from the controller settings page, each command on a new line
     */
    //% blockId="myController_apply_settings"
    //% block="apply settings %data"
    //% inlineInputMode=inline
    //% weight=50
    //% data.defl=''
    //% group="Setup"
    export function applySettings(data: string) {
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
        initialize()

        if (state.receivedBLE) {
            bluetooth.uartWriteLine(data)
        }

        if (state.receivedSerial) {
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
    //% blockId="myController_set_button"
    //% block="set button %code to %visibility %color || label %label"
    //% inlineInputMode=inline
    //% weight=48
    //% expandableArgumentMode="toggle"
    //% code.defl=''
    //% visibility.defl=ButtonVisibility.Visible
    //% color.defl=ButtonColor.Black
    //% label.defl=''
    //% group="Setup"
    export function setButton(
        code: string,
        visibility: ButtonVisibility,
        color?: ButtonColor,
        label?: string | number
    ) {
        sendData(['vc;b', code, visibility, color, label,].join(';'));
    }
}