//% weight=100 color=#0fbc11 icon=""
namespace tresor {

    const DISPLAY_TIMEOUT = 900; // milliseconds
        
    let currentTimestamp: number = 0;
    let currentPower: number = 0;
    let nextTimestamp: number = 0;
    let nextPower: number = 0;
    let shouldSwitchDisplay: boolean = false;
    let displayOn: boolean = false;
    let displayPower: (power: number) => void = (power: number) => {};

    //% block="lorsqu'un signal de puissance $p est détecté"
    //% draggableParameters="reporter"
    export function setPowerDisplay(handler: (p: number) => void) {
        displayPower = handler;
    }

    function projectSignalStrength(strength: number) : number {
        //return Math.round(Math.min(1, Math.max(0, (strength + 80) / 30)) * 5);
        return Math.round(Math.min(1, Math.sqrt(Math.max(0, (strength + 80) / 30))) * 5);
    }

    radio.onReceivedNumber((receivedNumber: number) => {
        let power = projectSignalStrength(radio.receivedPacket(RadioPacketProperty.SignalStrength));
        if (!displayOn || power >= currentPower) {
            shouldSwitchDisplay = true;
            nextPower = power;
            nextTimestamp = input.runningTime();
        }
    });

    basic.forever(() => {
        if (shouldSwitchDisplay) {
            currentTimestamp = nextTimestamp;
            currentPower = nextPower;
            displayPower(currentPower);
            displayOn = true;
            shouldSwitchDisplay = false;
        } else if (displayOn && (input.runningTime() - currentTimestamp >= DISPLAY_TIMEOUT)) {
            basic.clearScreen();
            displayOn = false;
        }
    });
    
}
