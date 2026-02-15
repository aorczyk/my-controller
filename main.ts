/**
 * A MakeCode extension that enables control of your 
 * BBC micro:bit through an app https://mymicrobit.medlight.pl/ 
 * using Bluetooth or WebUSB - micro:bit (V2) only.
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

        // Storing toggle states and counts for buttons.
        buttonStates: { [key: string]: number } = {};

        // Communication method flags.
        receivedBLE = false;
        receivedSerial = false;

        // Command handler registry.
        handlerRegistry: (() => void)[] = [];

        constructor() {}
    }

    let state : State = undefined;

    function initialize() {
        if (state == undefined) {
            state = new State();

            // Main loop to process incoming commands one by one.
            basic.forever(function () {
                let commands = state ? Object.keys(state.receivedCommands) : []

                if (commands.length) {
                    state.receivedCommandName = commands[0]
                    state.receivedCommandValue = state.receivedCommands[state.receivedCommandName]
                    delete state.receivedCommands[state.receivedCommandName];

                    state.handlerRegistry.forEach(handler => {
                        handler()
                    })
                }
            })
        }
    }

    export function onDataReceived(command: string) {
        let [commandName, commandValue] = command.split("=")

        // Button press/release or some other non-numeric command (to be handled later).
        if (commandValue == undefined) {
            commandValue = '0'

            if (commandName[0] == '!') {
                commandName = commandName.slice(1)
                delete state.pressedKeys[commandName]
            } else if (commandName == 'none') {
                state.pressedKeys = {}
            } else {
                state.pressedKeys[commandName] = true
                commandValue = '1'
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
     * Runs the code when any command is received from the controller.
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
        state.handlerRegistry.push(handler)
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
     * Returns true if a button was just pressed.
     * @param buttonCode the button to check
     */
    //% blockId=myController_button_was_pressed
    //% block="button %button was pressed"
    //% group="Buttons"
    //% weight=89
    export function buttonWasPressed(buttonCode: string): boolean {
        return state.receivedCommandName == buttonCode && state.pressedKeys[buttonCode];
    }

    /**
     * Returns true if a button was just released.
     * @param buttonCode the button to check
     */
    //% blockId=myController_button_was_released
    //% block="button %button was released"
    //% group="Buttons"
    //% weight=88
    export function buttonWasReleased(buttonCode: string): boolean {
        return state.receivedCommandName == buttonCode && !state.pressedKeys[buttonCode];
    }

    /**
     * Returns true if a specific button is currently pressed.
     * @param buttonCode the button to check
     */
    //% blockId=myController_is_button_pressed
    //% block="is button %button pressed"
    //% group="Buttons"
    //% weight=87
    export function isButtonPressed(buttonCode: string): boolean {
        return state.pressedKeys[buttonCode];
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
     * Returns true if no button is currently being pressed.
     */
    //% blockId=myController_no_button_is_pressed
    //% block="no button is pressed"
    //% weight=85
    //% group="Buttons"
    export function noButtonIsPressed(): boolean {
        return Object.keys(state.pressedKeys).length == 0
    }

    /**
     * Returns the code for the specified button name.
     * @param buttonCode the button to get the code for
     */
    //% blockId=myController_button_code
    //% block="code of %ButtonName"
    //% weight=84
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
     * Toggles the button state. Returns true if the button is now on, false if off.
     * Each function call switches the button state.
     */
    //% blockId="myController_toggle_button"
    //% block="toggle button"
    //% weight=84
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
    //% weight=83
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
    //% weight=82
    //% expandableArgumentMode="toggle"
    //% code.defl=''
    //% visibility.defl=ButtonVisibility.Visible
    //% color.defl=ButtonColor.Black
    //% label.defl=''
    //% group="Buttons"
    export function setButton(
        code: string,
        visibility: ButtonVisibility,
        color?: ButtonColor,
        label?: string | number
    ) {
        sendData(['vc;b', code, visibility, color, label,].join(';'));
    }


    /**
     * Returns true if a new value from the left slider has been received.
     */
    //% blockId=myController_left_slider_changed
    //% block="left slider changed"
    //% group="Sliders"
    //% weight=79
    export function leftSliderChanged(): boolean {
        return state.receivedCommandName == 'sl'
    }

    /**
     * Returns true if a new value from the right slider has been received.
     */
    //% blockId=myController_right_slider_changed
    //% block="right slider changed"
    //% group="Sliders"
    //% weight=78
    export function rightSliderChanged(): boolean {
        return state.receivedCommandName == 'sr'
    }

    /**
         * Returns true if the left joystick axis value was updated.
         * @param direction the joystick axis to check (X or Y)
         */
    //% blockId=myController_left_joystick_changed
    //% block="left joystick %direction changed"
    //% weight=69
    //% group="Joysticks"
    export function leftJoystickChanged(direction: JoystickDirection): boolean {
        const axis = (direction === JoystickDirection.X ? 'x' : 'y');
        return state.receivedCommandName == ('jl' + axis);
    }

    /**
     * Returns true if the right joystick axis value was updated.
     * @param direction the joystick axis to check (X or Y)
     */
    //% blockId=myController_right_joystick_changed
    //% block="right joystick %direction changed"
    //% weight=68
    //% group="Joysticks"
    export function rightJoystickChanged(direction: JoystickDirection): boolean {
        const axis = (direction === JoystickDirection.X ? 'x' : 'y');
        return state.receivedCommandName == ('jr' + axis);
    }


    /**
     * Returns true if the specified orientation axis value was updated.
     * @param axis the orientation axis to check
     */
    //% blockId=myController_orientation_changed
    //% block="orientation %axis changed"
    //% weight=67
    //% group="Orientation"
    export function orientationChanged(axis: OrientationAxis): boolean {
        let command = "";

        switch (axis) {
            case 1: command = 'ox'; break;
            case 2: command = 'oy'; break;
            case 3: command = 'oz'; break;
            case 4: command = 'oc'; break;
            default: return false;
        }

        return state.receivedCommandName == command;
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

        let setupHandler = () => {
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

        state.handlerRegistry.push(setupHandler)
    }

    /**
     * Imports controller settings from the provided data string.
     * Use this block to quickly set up the controller interface by pasting
     * the exported settings code from the controller settings page.
     * @param data commands exported from the controller settings page
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
     * Restores the controller to its default settings.
     * This will reset all buttons, sliders, joysticks, and other controls to their initial state.
     */
    //% blockId="myController_restore_default_settings"
    //% block="restore default settings"
    //% weight=49
    //% group="Setup"
    export function restoreDefaultSettings() {
        sendData('vc;init;');
    }

    /**
     * Sends a raw data command to the controller app via Bluetooth or WebUSB.
     * Use this block to send custom commands not covered by other blocks.
     * @param data the raw command string to send
     */
    //% blockId="myController_send_data"
    //% block="send data %data"
    //% inlineInputMode=inline
    //% weight=48
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
}