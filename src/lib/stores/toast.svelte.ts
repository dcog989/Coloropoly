export class ToastStore {
  active = $state<{
    message: string;
    id: number;
    x?: number | undefined;
    y?: number | undefined;
  } | null>(null);
  #counter = 0;

  show(message: string) {
    this.#emit(message);
  }

  showAt(message: string, event: MouseEvent | undefined) {
    // Keyboard and assistive-tech clicks report 0,0; a cursor toast there would sit off-screen.
    const at = event && (event.clientX !== 0 || event.clientY !== 0) ? event : undefined;
    this.#emit(message, at);
  }

  #emit(message: string, event?: MouseEvent, duration = 3000) {
    const id = ++this.#counter;

    this.active = {
      message,
      id,
      x: event?.clientX,
      y: event?.clientY,
    };

    setTimeout(() => {
      if (this.active?.id === id) {
        this.active = null;
      }
    }, duration);
  }
}
