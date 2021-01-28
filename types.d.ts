declare namespace Types {
  /* alias */
  type Activity = import("botbuilder").Activity;
  type ConversationReference = import("botbuilder").ConversationReference;

  interface Storage {
    add: (activity: Activity) => void;
    subscribe: (activity: Activity, topic: string) => void;
    getConversation: (username: string) => ConversationReference | null;
    getSubscriptions: (username: string) => string[];
    resetSubscriptions: (username: string) => void;
  }

  interface Handlers {
    processMessage: (
      req: import("restify").Request,
      res: import("restify").Response
    ) => Promise<void>;
    notify: (
      username: string,
      message: string
    ) => Promise<{ status: number; response: any }>;
    broadcast: (
      topic: string,
      message: string
    ) => Promise<{ status: number; response: any }>;
  }
}
