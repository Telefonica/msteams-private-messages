declare namespace Types {
  type Activity = import("botbuilder").Activity;

  interface Storage {
    add: (activity: Activity) => void;
    subscribe: (activity: Activity, topic: string) => void;
    readUser: (
      username: string
    ) => {
      conversationId: string;
      conversation: any;
      subscribedTo: string[];
    };
  }
}
