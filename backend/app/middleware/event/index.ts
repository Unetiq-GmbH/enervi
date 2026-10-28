import { EventEmitter } from "events";

class EventSingleton {
  private static instance: EventEmitter;

  constructor() {
    if (!EventSingleton.instance) {
      EventSingleton.instance = new EventEmitter();
    }
  }

  public getInstance(): EventEmitter {
    return EventSingleton.instance;
  }
}

const eventEmitter = new EventSingleton().getInstance();
export default eventEmitter;
