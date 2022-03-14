import { coord, coord1, fixRing } from "./geometry";

describe("coord1", () => {
  it("parses a coordinate", () => {
    expect(coord1("42,24")).toEqual([42, 24]);
    expect(coord1("2,2")).toEqual([2, 2]);
    expect(coord1("2,2,4")).toEqual([2, 2, 4]);
  });
  it("removes nans", () => {
    expect(coord1("a,24")).toEqual([24]);
  });
});

describe("coord", () => {
  it("parses coordinates", () => {
    expect(coord("42,24 1,2")).toEqual([
      [42, 24],
      [1, 2],
    ]);
    expect(coord("42,24 1,2 alpha,beta")).toEqual([
      [42, 24],
      [1, 2],
    ]);
  });
});

describe("fixRing", () => {
  it("completes a ring if necessary", () => {
    expect(
      fixRing([
        [1, 2],
        [3, 4],
        [5, 6],
      ])
    ).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 2],
    ]);
  });
  it("does not touch good rings", () => {
    expect(
      fixRing([
        [1, 2],
        [3, 4],
        [5, 6],
        [1, 2],
      ])
    ).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 2],
    ]);
  });
});
