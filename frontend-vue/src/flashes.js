import { reactive } from "vue";

export const flashes = reactive([]);

export function removeFlash(flashMessage) {
  var index = flashes.indexOf(flashMessage);
  if (index != -1) {
    flashes.splice(index, 1); // remove 1 element
  }
}
