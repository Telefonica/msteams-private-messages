declare namespace Types {
  /* alias */
  type Activity = import("botbuilder").Activity;
  type ConversationReference = import("botbuilder").ConversationReference;
  type Context = import("botbuilder").TurnContext;

  interface Storage {
    saveConversation: (activity: Activity) => void;
    getConversation: (
      username: string
    ) => Partial<ConversationReference> | null;
    subscribe: (activity: Activity, topic: string) => void;
    getSubscribedTopics: (username: string) => string[];
    getSubscribers: (topic: string) => string[];
    listUsernames: () => string[];
    listTopics: () => string[];
    resetSubscriptions: (username: string) => void;
    removeSubscribers: (topic: string) => void;
  }

  interface Handlers {
    processMessage: (
      req: import("restify").Request,
      res: import("restify").Response
    ) => Promise<void>;
    notify: (
      username: string,
      message: string,
      mention?: boolean
    ) => Promise<{ status: number; response: any }>;
    broadcast: (
      topic: string,
      message: string,
      mention?: boolean
    ) => Promise<{ status: number; response: any }>;
    getTopics: () => Promise<{ status: number; response: any }>;
    getUsernames: () => Promise<{ status: number; response: any }>;
  }

  interface ICard {
    title: string;
    text: string;
  }

  interface IButton {
    title: string;
    value: string;
  }

  interface Config {
    cards: {
      welcomeCard: ICard;
      unknownCard: ICard;
      menuCard: {
        title: string;
        checkButton: IButton;
        resetButton: IButton;
        subscriptionButtons: IButton[];
      };
    };
  }
}
