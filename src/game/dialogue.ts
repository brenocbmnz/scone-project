import type { Npc } from "./data";
import type { Progress } from "./rules";
import { meetsConditions, type Condition } from "./conditions";
interface DialogueEvent {
  id: string;
  conditions: Condition[];
  title: string;
  text: string;
  response: string;
}
export const dialogueEvents: Record<Npc, DialogueEvent[]> = {
  orin: [
    {
      id: "orin-hello",
      conditions: [],
      title: "A first hello.",
      text: "“I brought you a flower. It was growing on my shoulder.” Orin blushes, scattering a little moss. “It suits you better, Rowan.”",
      response:
        "You brush flour from your apron. Nobody has brought you flowers in a very long time.",
    },
    {
      id: "orin-rooftop",
      conditions: [{ kind: "affection", npc: "orin", minimum: 2 }],
      title: "A view worth sharing.",
      text: "Orin takes you to a low rooftop. “Gargoyles get a reputation for brooding. Mostly, we’re admiring the view.” His wing shelters you from the breeze.",
      response:
        "You tell him about leaving the human world. He listens, never once telling you to be braver.",
    },
    {
      id: "orin-waiting",
      conditions: [{ kind: "affection", npc: "orin", minimum: 4 }],
      title: "The sound of something missing.",
      text: "“I want to tell you more, Rowan. But without the tower’s bell, a part of me is still listening for something lost.”",
      response:
        "Orin’s next relationship milestone needs the bell restored. The Bell Tower mystery is in your journal. You can keep spending time together meanwhile.",
    },
    {
      id: "orin-bell",
      conditions: [
        { kind: "affection", npc: "orin", minimum: 4 },
        { kind: "flag", flag: "bell" },
      ],
      title: "A voice of his own.",
      text: "“You found my bell. For the first time in a century, I feel heard.” Orin offers you a small stone charm, carved into a lopsided heart.",
      response:
        "“It’s meant to look like a scone,” he insists. Neither of you believes him.",
    },
    {
      id: "orin-heart",
      conditions: [
        { kind: "affection", npc: "orin", minimum: 6 },
        { kind: "flag", flag: "bell" },
      ],
      title: "A heart, held gently.",
      text: "The tower sings over the rooftops. Orin’s hand rests beside yours. “For a man made of stone, I’ve become remarkably soft around you.”",
      response:
        "“Whatever you want this to be, Rowan, I’m glad you came.” A romantic choice here completes his heart event.",
    },
  ],
  lucien: [
    {
      id: "lucien-hello",
      conditions: [],
      title: "A first hello.",
      text: "“A handsome baker and a book with a happy ending. My evening is looking up.” Lucien slides a tiny poetry book across the table.",
      response:
        "“On loan,” he says. “It gives you an excuse to visit me again.”",
    },
    {
      id: "lucien-tea",
      conditions: [{ kind: "affection", npc: "lucien", minimum: 2 }],
      title: "Tea between the pages.",
      text: "Lucien admits he rearranges books when he’s nervous. “You’ve been here ten minutes. The travel section is now organized by emotional baggage.”",
      response:
        "You laugh so loudly that the books shush you. He looks delighted.",
    },
    {
      id: "lucien-story",
      conditions: [{ kind: "affection", npc: "lucien", minimum: 4 }],
      title: "An unfinished story.",
      text: "“I used to write,” he says. “Then I got very good at reading about other people’s lives instead.” You offer him a blank recipe card.",
      response:
        "“Start small,” you say. “One good thing that happened today.” He writes your name.",
    },
    {
      id: "lucien-heart",
      conditions: [{ kind: "affection", npc: "lucien", minimum: 6 }],
      title: "A page worth turning.",
      text: "Lucien closes his book. “I used to think home was a place. Lately, I think it might be a person.” He reaches for your hand, then pauses to let you choose.",
      response:
        "“A friend, or something more. I’d like you in my next chapter, Rowan.” A romantic choice here completes his heart event.",
    },
  ],
};
export const getDialogue = (s: Progress, n: Npc) =>
  [...dialogueEvents[n]]
    .reverse()
    .find((e) => meetsConditions(s, e.conditions))!;
