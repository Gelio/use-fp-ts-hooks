import { it, describe, expect } from "vitest";
import { optionEitherAwareEq } from "./index.js";
import { either, option } from "fp-ts";

describe("optionEitherAwareEq", () => {
  it("uses strict comparison for non-fp-ts values", () => {
    expect(optionEitherAwareEq.equals(1, 2)).toBe(false);
    expect(optionEitherAwareEq.equals(2, 2)).toBe(true);
    expect(optionEitherAwareEq.equals("2", 2)).toBe(false);
    expect(optionEitherAwareEq.equals({}, {})).toBe(false);
    expect(optionEitherAwareEq.equals(true, false)).toBe(false);
    expect(optionEitherAwareEq.equals(true, true)).toBe(true);
  });

  it("compares contents of Options", () => {
    expect(optionEitherAwareEq.equals(option.some(1), option.some(1))).toBe(
      true
    );
    expect(optionEitherAwareEq.equals(option.some(1), option.some(2))).toBe(
      false
    );
    expect(optionEitherAwareEq.equals(option.some(1), option.none)).toBe(false);
  });

  it("compares contents of Eithers", () => {
    expect(optionEitherAwareEq.equals(either.right(1), either.right(1))).toBe(
      true
    );
    expect(optionEitherAwareEq.equals(either.right(1), either.right(2))).toBe(
      false
    );
    expect(
      optionEitherAwareEq.equals(either.right(1), either.left("1234"))
    ).toBe(false);
    expect(optionEitherAwareEq.equals(either.right(1), either.left(1))).toBe(
      false
    );
  });

  it("compares contents of Eithers and Options nested in each other", () => {
    expect(
      optionEitherAwareEq.equals(
        either.right(option.some(1)),
        either.right(option.some(1))
      )
    ).toBe(true);
    expect(
      optionEitherAwareEq.equals(
        either.right(option.some(1)),
        either.right(option.some(2))
      )
    ).toBe(false);
    expect(
      optionEitherAwareEq.equals(
        either.right(option.some(1)),
        either.right(option.none)
      )
    ).toBe(false);
    expect(
      optionEitherAwareEq.equals(either.right(option.some(1)), either.left("1"))
    ).toBe(false);
  });

  it("does not fail when x and y structure differs", () => {
    expect(
      optionEitherAwareEq.equals(either.right(1234), option.some(1234))
    ).toBe(false);
    expect(
      optionEitherAwareEq.equals(option.some(1234), either.right(1234))
    ).toBe(false);
  });

  it("does not fail for nullable values", () => {
    expect(optionEitherAwareEq.equals(option.some(1234), null)).toBe(false);
    expect(optionEitherAwareEq.equals(option.some(1234), undefined)).toBe(
      false
    );
    expect(
      optionEitherAwareEq.equals(
        option.some(option.some(1234)),
        option.some(null)
      )
    ).toBe(false);
  });
});
