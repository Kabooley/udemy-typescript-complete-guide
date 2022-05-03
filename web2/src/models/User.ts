import { Eventing } from "./Eventing";
import { Sync } from "./Sync";
import { Attributes } from "./Attributes";

export interface UserProps {
  id?: number;
  name?: string;
  age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

const rootUrl: string = "http://localhost:3000/users";

export class User {
  // events: { [key: string]: Callback[] } = {};
  public events: Eventing = new Eventing();
  public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
  public attributes: Attributes<UserProps>;
  constructor(private attrs: UserProps) {
    this.attributes = new Attributes<UserProps>(attrs);
  }

  // on(eventName: string, callback: Callback): void {
  //     this.events.on(eventName, callback)
  // }

  get on() {
    return this.events.on;
  }

  get trigger() {
    return this.events.trigger;
  }

  get get() {
    return this.attributes.get;
  }
  
  set(update: UserProps): void {
    this.attributes.set(update);
    this.events.trigger("change");
  }
}
