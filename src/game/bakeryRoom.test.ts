import { describe, it, expect } from "vitest";
import { initial, bake, sleep, parseSave } from "./rules";
import { startWork, canLeaveBakery, canSleep } from "./bakeryRoom";
describe("interactive bakery daily loop", () => {
  it("requires the cash register before an order can pay out", () => {
    const idle = initial();
    expect(bake(idle, 3)).toBe(idle);
    const open = startWork(idle);
    expect(open.workStarted).toBe(true);
    expect(open.scene.room).toBe(false);
    expect(bake(open, 3).orders).toBe(1);
    expect(idle.workStarted).toBe(false);
  });
  it("returns to the room after two orders and cannot open service again", () => {
    const done = bake(bake(startWork(initial()), 2), 3);
    expect(done).toMatchObject({
      phase: "free",
      orders: 2,
      workStarted: false,
      scene: { room: true },
    });
    expect(startWork(done)).toBe(done);
    expect(canLeaveBakery(done)).toBe(true);
    expect(canSleep(done)).toBe(false);
  });
  it("resuming service from the register preserves money and daily orders", () => {
    const once = bake(startWork(initial()), 3);
    const room = { ...once, scene: { ...once.scene, room: true } };
    const resumed = startWork(room);
    expect(resumed.money).toBe(room.money);
    expect(resumed.orders).toBe(1);
    expect(resumed.scene.room).toBe(false);
  });
  it("gates leaving and sleeping without consuming a morning or afternoon", () => {
    expect(canLeaveBakery(initial())).toBe(false);
    expect(canSleep(initial())).toBe(false);
    const free = { ...initial(), phase: "free" as const };
    expect(sleep(free)).toBe(free);
    const night = { ...initial(), phase: "evening" as const };
    expect(canSleep(night)).toBe(true);
    expect(sleep(night)).toMatchObject({
      day: 2,
      workStarted: false,
      phase: "work",
      scene: { room: true },
    });
  });
  it("preserves active service through saves and migrates earlier partial work days", () => {
    const open = bake(startWork(initial()), 3);
    expect(parseSave(JSON.stringify(open))).toEqual(open);
    const { workStarted, ...legacy } = open;
    expect(parseSave(JSON.stringify(legacy))?.workStarted).toBe(true);
  });
});
