export function onRadioInteract(event) {
    const block = event.block;
    const blockLocation = block.location;
    block.dimension.playSound("mob.radio.sound", blockLocation, { pitch: 1.0, volume: 1.0 });
}
