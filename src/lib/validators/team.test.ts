import { describe, expect, it } from "vitest";
import { createTeamSchema, teamNameSchema, teamTagSchema } from "./team";

describe("teamTagSchema", () => {
  it("accepts valid uppercase tags", () => {
    expect(teamTagSchema.parse("APX")).toBe("APX");
    expect(teamTagSchema.parse("GHT")).toBe("GHT");
  });

  it("rejects lowercase or invalid length", () => {
    expect(() => teamTagSchema.parse("a")).toThrow();
    expect(() => teamTagSchema.parse("ghost")).toThrow();
    expect(() => teamTagSchema.parse("APX12")).toThrow();
  });
});

describe("teamNameSchema", () => {
  it("trims and validates length", () => {
    expect(teamNameSchema.parse("  APEX Gaming  ")).toBe("APEX Gaming");
  });

  it("rejects too short names", () => {
    expect(() => teamNameSchema.parse("AB")).toThrow();
  });
});

describe("createTeamSchema", () => {
  it("parses combined payload", () => {
    expect(createTeamSchema.parse({ name: "GHOST Squad", tag: "GHT" })).toEqual({
      name: "GHOST Squad",
      tag: "GHT",
    });
  });
});
