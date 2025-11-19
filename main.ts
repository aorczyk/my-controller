//% color=#f68420 icon="\uf11b" block="Controller"
namespace vcController {
    let commadParts: string[] = []
    let command: string;
    let latestCommands: { [key: string]: number } = {}
    let commandName: string;
    let commandValue: number;

    bluetooth.startUartService()

    bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
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
}