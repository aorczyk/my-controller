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

    export const enum PoweredUpRemoteButton {
        //% block="left plus"
        LeftPlus = 1,
        //% block="left minus"
        LeftMinus = 2,
        //% block="left stop"
        LeftStop = 3,
        //% block="right plus"
        RightPlus = 4,
        //% block="right minus"
        RightMinus = 5,
        //% block="right stop"
        RightStop = 6,
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

    export const enum LegoHubPort {
        //% block="A"
        A = 1,
        //% block="B"
        B = 2,
        //% block="C"
        C = 3,
        //% block="D"
        D = 4,
    }

    export const enum LegoHubLedColor {
        //% block="off"
        Off = 0,
        //% block="pink"
        Pink = 1,
        //% block="purple"
        Purple = 2,
        //% block="blue"
        Blue = 3,
        //% block="light blue"
        LightBlue = 4,
        //% block="cyan"
        Cyan = 5,
        //% block="green"
        Green = 6,
        //% block="yellow"
        Yellow = 7,
        //% block="orange"
        Orange = 8,
        //% block="red"
        Red = 9,
        //% block="white"
        White = 10,
    }

    export const enum LegoHubEndState {
        //% block="default"
        Default = 3,
        //% block="hold"
        Hold = 1,
        //% block="float"
        Float = 0,
        //% block="brake"
        Brake = 2,
    }

    export const enum LegoHubRampProfile {
        //% block="controller default"
        ControllerDefault = 4,
        //% block="none"
        None = 0,
        //% block="acceleration"
        Acceleration = 1,
        //% block="deceleration"
        Deceleration = 2,
        //% block="both"
        Both = 3,
    }

    class State {
        // Handling fast changing commands from sliders, joysticks, and orientation. When multiple commands are received quickly, we store only the latest value for each command. Then we process them one by one in the onCommand handler. This ensures we always have the most recent state for each input. Works better than an array queue.
        receivedCommands: { [key: string]: string } = {};
        commandQueue: string[] = []
        receivedCommandName: string;
        receivedCommandValue: string;

        // Tracking the current pressed/released state of buttons. For multiple buttons pressed at the same time.
        pressedKeys: { [key: string]: boolean } = {};

        // Storing toggle states and counts for buttons.
        buttonStates: { [key: string]: number } = {};

        // Communication method flags.
        receivedBLE = false;
        receivedSerial = false;

        // Command handler registry.
        handlerRegistry: (() => void)[] = [];

        onConnectedHandlers: (() => void)[] = [];

        processing = false;

        propertyValue: string;

        constructor() { }
    }

    let state: State = undefined;
    let properties: { [key: string]: string } = {};

    function initialize() {
        if (state == undefined) {
            state = new State();
        }
    }

    function processCommands() {
        if (state.processing) return;
        state.processing = true;

        control.inBackground(function () {

            while (state.commandQueue.length > 0) {

                let commandName = state.commandQueue.shift();
                let value = state.receivedCommands[commandName];

                delete state.receivedCommands[commandName];

                state.receivedCommandName = commandName;
                state.receivedCommandValue = value;

                // Process on connected
                if (state.receivedCommandName == "-v") {
                    for (let j = 0; j < state.onConnectedHandlers.length; j++) {
                        state.onConnectedHandlers[j]();
                    }
                }

                for (let j = 0; j < state.handlerRegistry.length; j++) {
                    state.handlerRegistry[j]();
                }

                basic.pause(0); // important for BLE
            }

            state.processing = false;
        });
    }

    export function onDataReceived(command: string) {

        let separatorIndex = command.indexOf("=")

        let commandName: string
        let commandValue: string

        if (separatorIndex === -1) {
            // Command without value (button type)
            commandName = command
            commandValue = "0"

            if (commandName.charAt(0) == "!") {
                commandName = commandName.slice(1)
                delete state.pressedKeys[commandName]
            } else if (commandName == "none") {
                state.pressedKeys = {}
            } else {
                state.pressedKeys[commandName] = true
                commandValue = "1"
            }

        } else {
            commandName = command.slice(0, separatorIndex)
            commandValue = command.slice(separatorIndex + 1)
        }

        // Add to the queue only if it's a new command
        if (state.receivedCommands[commandName] === undefined) {
            state.commandQueue.push(commandName)
        }

        // Overwrite the value (last value wins)
        state.receivedCommands[commandName] = commandValue

        processCommands()
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
     * Initializes serial (WebUSB) communication with the controller app.
     */
    //% blockId=myController_use_serial
    //% block="use serial"
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
    //% block="command"
    //% weight=91
    //% group="Commands"
    export function commandName(): string {
        return state.receivedCommandName
    }

    /**
     * Returns the value of the most recently received command as a string.
     */
    //% blockId=myController_command_value
    //% block="command value"
    //% weight=90
    //% group="Commands"
    export function commandValue(): string {
        return state.receivedCommandValue
    }

    /**
     * Returns the numeric value of the most recently received command.
     * For a slider, this is the current slider position.
     * For a joystick, this is the value of the moved axis (e.g., X or Y).
     * For orientation, this is the current orientation value sent by the controller.
     */
    //% blockId=myController_command_value_as_number
    //% block="command value as number"
    //% weight=89
    //% group="Commands"
    export function commandValueAsNumber(): number {
        return parseFloat(state.receivedCommandValue)
    }

    /**
     * Returns true if a button was just pressed.
     * @param buttonCode the button to check
     */
    //% blockId=myController_button_was_pressed
    //% block="button %button was pressed"
    //% group="Buttons"
    //% weight=88
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
    //% weight=87
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
    //% weight=86
    export function isButtonPressed(buttonCode: string): boolean {
        return state.pressedKeys[buttonCode];
    }

    /**
     * Returns true if all buttons have been released.
     */
    //% blockId=myController_all_buttons_released
    //% block="all buttons released"
    //% weight=85
    //% group="Buttons"
    export function allButtonsReleased() {
        return state.receivedCommandName == 'none'
    }

    /**
     * Returns true if no button is currently being pressed.
     */
    //% blockId=myController_no_button_is_pressed
    //% block="no button is pressed"
    //% weight=84
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
    //% weight=83
    //% group="Buttons"
    export function buttonCode(buttonCode: ButtonName): string {
        switch (buttonCode) {
            case ButtonName.ArrowUp: return "up";
            case ButtonName.ArrowDown: return "down";
            case ButtonName.ArrowRight: return "right";
            case ButtonName.ArrowLeft: return "left";
            case ButtonName.Enter: return "enter";
            case ButtonName.Space: return "space";
            default: return "";
        }
    }

    /**
     * Stores a state value in the controller app. This can be used to keep track of toggle states,
     * counters, or other variables that need to persist across different parts of your program.
     * @param variableName the name of the state value to store
     * @param variable the value to store
     */
    //% blockId="myController_set_property"
    //% block="set property %variableName to %variable"
    //% inlineInputMode=inline
    //% weight=30
    //% data.defl=''
    //% group="Properties"
    export function setProperty(variableName: string, variable: string | number) {
        sendData(`setProp;${variableName};${variable};`);
    }

    /**
     * Retrieves a state value from the controller app. Use this block to access values stored with setProperty.
     * @param variableName the name of the state value to retrieve
     */
    //% blockId="myController_get_property"
    //% block="get property %variableName"
    //% inlineInputMode=inline
    //% weight=29
    //% data.defl=''
    //% group="Properties"
    export function getProperty(
        variableName: string,
    ) {
        initialize()

        state.onConnectedHandlers.push(() => {
            sendData(`getProp;${variableName};`);
        });
    }

    /**
     * Retrieves a state value from the controller app. Use this block to access values stored with setProperty.
     * @param variableName the name of the state value to retrieve
     * @param handler code to run when the property value is received
     */
    //% blockId="myController_on_property_received"
    //% block="on property %variableName received"
    //% inlineInputMode=inline
    //% weight=28
    //% data.defl=''
    //% group="Properties"
    export function onPropertyReceived(
        variableName: string,
        handler: () => void
    ) {
        initialize()

        state.handlerRegistry.push(() => {
            let commandParts = state.receivedCommandName.split(';');

            if (commandParts[0] == "prop" && commandParts[1] == variableName) {
                state.propertyValue = commandParts[2];
                handler();
            }
        });
    }

    /**
     * Returns the value of the most recently received property.
     */
    //% blockId=myController_property_value
    //% block="property value"
    //% weight=27
    //% group="Properties"
    export function propertyValue(): string {
        return state.propertyValue
    }

    /**
     * Returns the value of the most recently received property as a number.
     */
    //% blockId=myController_property_value_as_number
    //% block="property value as number"
    //% weight=26
    //% group="Properties"
    export function propertyValueAsNumber(): number {
        return parseFloat(state.propertyValue);
    }

    /**
     * Toggles the button state. Returns true if the button is now on, false if off.
     * Each function call switches the button state.
     */
    //% blockId="myController_toggle_button"
    //% block="toggle button"
    //% weight=82
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
    //% weight=81
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
    //% weight=80
    //% expandableArgumentMode="toggle"
    //% code.defl=''
    //% visibility.defl=myController.ButtonVisibility.Visible
    //% color.defl=myController.ButtonColor.Black
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
        let command: string;
        switch (axis) {
            case OrientationAxis.X: command = 'ox'; break;
            case OrientationAxis.Y: command = 'oy'; break;
            case OrientationAxis.Z: command = 'oz'; break;
            case OrientationAxis.Compass: command = 'oc'; break;
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
    //% confirmationMode.defl=myController.ConfirmationMode.Require
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
    //% block="import settings %data"
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


    function legoHubPortCode(port: LegoHubPort): string {
        switch (port) {
            case LegoHubPort.A: return "A";
            case LegoHubPort.B: return "B";
            case LegoHubPort.C: return "C";
            case LegoHubPort.D: return "D";
            default: return "";
        }
    }

    function legoHubEndStateCode(endState: LegoHubEndState): string {
        return endState == LegoHubEndState.Default ? "" : `${endState}`;
    }

    function legoHubRampProfileCode(profile: LegoHubRampProfile): string {
        return profile == LegoHubRampProfile.ControllerDefault ? "" : `${profile}`;
    }

    function sendLegoHubMotorCommand(
        port: LegoHubPort,
        mode: string,
        value: number,
        speed: number | string,
        maxPower: number | string,
        endState: LegoHubEndState,
        rampProfile: LegoHubRampProfile,
    ) {
        sendData(`lh_com=${legoHubPortCode(port)},${mode},1,${speed},${maxPower},${legoHubEndStateCode(endState)},${legoHubRampProfileCode(rampProfile)};${value}`);
    }

    /**
     * Sets the LEGO Hub motor power on the specified port.
     * Requires LEGO Hub support to be enabled and connected in the controller app.
     * Use a negative value to run the motor in the reverse direction.
     * @param port the LEGO Hub motor port
     * @param power the motor power, from -100 to 100
     */
    //% blockId="myController_set_lego_hub_motor_power"
    //% block="set LEGO Hub motor %port power %power"
    //% inlineInputMode=inline
    //% weight=25
    //% power.min=-100 power.max=100
    //% group="LEGO Hub"
    export function setLegoHubMotorPower(port: LegoHubPort, power: number) {
        sendData(`lh_com=${legoHubPortCode(port)},power,1;${power}`);
    }

    /**
     * Sets the LEGO Hub motor speed on the specified port.
     * Requires LEGO Hub support to be enabled and connected in the controller app.
     * @param port the LEGO Hub motor port
     * @param speed the target speed, from -100 to 100
     * @param maxPower the optional maximum power, from 0 to 100
     * @param rampProfile the optional acceleration/deceleration profile
     */
    //% blockId="myController_set_lego_hub_motor_speed"
    //% block="set LEGO Hub motor %port speed %speed || max power %maxPower ramp %rampProfile"
    //% inlineInputMode=inline
    //% expandableArgumentMode="toggle"
    //% weight=24
    //% speed.min=-100 speed.max=100
    //% maxPower.min=0 maxPower.max=100
    //% maxPower.defl=100
    //% rampProfile.defl=myController.LegoHubRampProfile.ControllerDefault
    //% group="LEGO Hub"
    export function setLegoHubMotorSpeed(
        port: LegoHubPort,
        speed: number,
        maxPower: number = 100,
        rampProfile: LegoHubRampProfile = 4,
    ) {
        sendLegoHubMotorCommand(port, "speed", speed, "", maxPower, 3, rampProfile);
    }

    /**
     * Runs the LEGO Hub motor at a speed for a fixed duration.
     * Requires LEGO Hub support to be enabled and connected in the controller app.
     * @param port the LEGO Hub motor port
     * @param timeMs the duration in milliseconds, from 1 to 65,535
     * @param speed the optional target speed, from -100 to 100
     * @param maxPower the optional maximum power, from 0 to 100
     * @param endState the optional action after the movement
     * @param rampProfile the optional acceleration/deceleration profile
     */
    //% blockId="myController_run_lego_hub_motor_for_time"
    //% block="run LEGO Hub motor %port for %timeMs ms || speed %speed max power %maxPower end state %endState ramp %rampProfile"
    //% inlineInputMode=inline
    //% expandableArgumentMode="toggle"
    //% weight=23
    //% timeMs.min=1 timeMs.max=65535
    //% speed.min=-100 speed.max=100
    //% speed.defl=60
    //% maxPower.min=0 maxPower.max=100
    //% maxPower.defl=100
    //% endState.defl=myController.LegoHubEndState.Default
    //% rampProfile.defl=myController.LegoHubRampProfile.ControllerDefault
    //% group="LEGO Hub"
    export function runLegoHubMotorForTime(
        port: LegoHubPort,
        timeMs: number,
        speed: number = 60,
        maxPower: number = 100,
        endState: LegoHubEndState = 3,
        rampProfile: LegoHubRampProfile = 4,
    ) {
        sendLegoHubMotorCommand(port, "speedForTime", timeMs, speed, maxPower, endState, rampProfile);
    }

    /**
     * Moves the LEGO Hub motor on the specified port to an absolute angle.
     * Requires LEGO Hub support to be enabled and connected in the controller app.
     * Use a negative value to approach the angle from the reverse direction.
     * @param port the LEGO Hub motor port
     * @param angle the target angle, in degrees
     * @param speed the optional target speed, from -100 to 100
     * @param maxPower the optional maximum power, from 0 to 100
     * @param endState the optional action after the movement
     * @param rampProfile the optional acceleration/deceleration profile
     */
    //% blockId="myController_set_lego_hub_motor_angle"
    //% block="set LEGO Hub motor %port angle %angle || speed %speed max power %maxPower end state %endState ramp %rampProfile"
    //% inlineInputMode=inline
    //% expandableArgumentMode="toggle"
    //% weight=22
    //% speed.min=-100 speed.max=100
    //% speed.defl=100
    //% maxPower.min=0 maxPower.max=100
    //% maxPower.defl=100
    //% endState.defl=myController.LegoHubEndState.Default
    //% rampProfile.defl=myController.LegoHubRampProfile.ControllerDefault
    //% group="LEGO Hub"
    export function setLegoHubMotorAngle(
        port: LegoHubPort,
        angle: number,
        speed: number = 100,
        maxPower: number = 100,
        endState: LegoHubEndState = 3,
        rampProfile: LegoHubRampProfile = 4,
    ) {
        sendLegoHubMotorCommand(port, "angle", angle, speed, maxPower, endState, rampProfile);
    }

    /**
     * Runs the LEGO Hub motor on the specified port for a relative angle.
     * Requires LEGO Hub support to be enabled and connected in the controller app.
     * Use a negative value to run the motor in the reverse direction.
     * @param port the LEGO Hub motor port
     * @param angle the relative angle to run, in degrees
     * @param speed the optional target speed, from -100 to 100
     * @param maxPower the optional maximum power, from 0 to 100
     * @param endState the optional action after the movement
     * @param rampProfile the optional acceleration/deceleration profile
     */
    //% blockId="myController_run_lego_hub_motor_angle"
    //% block="run LEGO Hub motor %port by angle %angle || speed %speed max power %maxPower end state %endState ramp %rampProfile"
    //% inlineInputMode=inline
    //% expandableArgumentMode="toggle"
    //% weight=21
    //% speed.min=-100 speed.max=100
    //% speed.defl=60
    //% maxPower.min=0 maxPower.max=100
    //% maxPower.defl=100
    //% endState.defl=myController.LegoHubEndState.Default
    //% rampProfile.defl=myController.LegoHubRampProfile.ControllerDefault
    //% group="LEGO Hub"
    export function runLegoHubMotorAngle(
        port: LegoHubPort,
        angle: number,
        speed: number = 60,
        maxPower: number = 100,
        endState: LegoHubEndState = 3,
        rampProfile: LegoHubRampProfile = 4,
    ) {
        sendLegoHubMotorCommand(port, "runAngle", angle, speed, maxPower, endState, rampProfile);
    }

    /**
     * Brakes the LEGO Hub motor on the specified port.
     * @param port the LEGO Hub motor port
     */
    //% blockId="myController_brake_lego_hub_motor"
    //% block="brake LEGO Hub motor %port"
    //% weight=20
    //% group="LEGO Hub"
    export function brakeLegoHubMotor(port: LegoHubPort) {
        sendLegoHubMotorCommand(port, "brake", 0, "", "", 3, 4);
    }

    /**
     * Sets the color of the LEGO Hub status LED.
     * Requires LEGO Hub support to be enabled and connected in the controller app.
     * @param color the LED color
     */
    //% blockId="myController_set_lego_hub_led"
    //% block="set LEGO Hub LED to %color"
    //% weight=19
    //% group="LEGO Hub"
    export function setLegoHubLed(color: LegoHubLedColor) {
        sendData(`lh_com=led;${color}`);
    }

    function poweredUpRemoteButtonCode(button: PoweredUpRemoteButton): string {
        switch (button) {
            case PoweredUpRemoteButton.LeftPlus: return "leftPlus";
            case PoweredUpRemoteButton.LeftMinus: return "leftMinus";
            case PoweredUpRemoteButton.LeftStop: return "leftStop";
            case PoweredUpRemoteButton.RightPlus: return "rightPlus";
            case PoweredUpRemoteButton.RightMinus: return "rightMinus";
            case PoweredUpRemoteButton.RightStop: return "rightStop";
            default: return "";
        }
    }

    /**
     * Returns true when the selected LEGO Powered UP Remote button was just pressed.
     * Requires the Powered UP Remote to be connected in the controller app.
     * @param button the Powered UP Remote button to check
     */
    //% blockId=myController_powered_up_remote_button_was_pressed
    //% block="Powered UP button %button was pressed"
    //% weight=17
    //% group="Powered UP Remote"
    export function poweredUpRemoteButtonWasPressed(button: PoweredUpRemoteButton): boolean {
        return buttonWasPressed(poweredUpRemoteButtonCode(button));
    }

    /**
     * Returns true when the selected LEGO Powered UP Remote button was just released.
     * Requires the Powered UP Remote to be connected in the controller app.
     * @param button the Powered UP Remote button to check
     */
    //% blockId=myController_powered_up_remote_button_was_released
    //% block="Powered UP button %button was released"
    //% weight=16
    //% group="Powered UP Remote"
    export function poweredUpRemoteButtonWasReleased(button: PoweredUpRemoteButton): boolean {
        return buttonWasReleased(poweredUpRemoteButtonCode(button));
    }

    /**
     * Returns true while the selected LEGO Powered UP Remote button is held down.
     * Requires the Powered UP Remote to be connected in the controller app.
     * @param button the Powered UP Remote button to check
     */
    //% blockId=myController_is_powered_up_remote_button_pressed
    //% block="is Powered UP button %button pressed"
    //% weight=15
    //% group="Powered UP Remote"
    export function isPoweredUpRemoteButtonPressed(button: PoweredUpRemoteButton): boolean {
        return isButtonPressed(poweredUpRemoteButtonCode(button));
    }

    /**
     * Sets the color of the LEGO Powered UP Remote status LED.
     * Requires the Powered UP Remote to be connected in the controller app.
     * @param color the remote LED color
     */
    //% blockId="myController_set_powered_up_remote_led"
    //% block="set Powered UP Remote LED to %color"
    //% weight=18
    //% group="Powered UP Remote"
    export function setPoweredUpRemoteLed(color: LegoHubLedColor) {
        sendData(`pur_led=led;${color}`);
    }

}