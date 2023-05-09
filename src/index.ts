import { either, eq, option } from "fp-ts";
import { constFalse } from "fp-ts/es6/function.js";

export function useFpTsEffect(callback: () => void, dependencies: unknown[]) {
  return useEqEffect(
    callback,
    dependencies.map((dependency) => [dependency, optionEitherAwareEq])
  );
}

type DependencyWithEq<T> = readonly [value: T, equalityComparator: eq.Eq<T>];

export function useEqEffect<
  Values extends readonly [
    // NOTE: forces TS to infer Values as a tuple. It can be empty, though.
    unknown?,
    ...unknown[]
  ]
>(
  callback: () => void,
  dependenciesWithEqs: Readonly<{
    [index in keyof Values]: DependencyWithEq<Values[index]>;
  }>
): void {
  // TODO: implement me
  // @see https://github.com/mblink/fp-ts-react-stable-hooks/blob/2202534bf05a14cb0d47e2aa0ff73c0f0813c851/src/effect.ts
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

const eqNever: eq.Eq<unknown> = {
  equals: constFalse,
};

function getOptionEitherAwareEq(value: unknown): eq.Eq<unknown> {
  if (
    isObject(value) &&
    typeof (value as Record<string, unknown>)["_tag"] === "string"
  ) {
    {
      const maybeEitherValue = value as either.Either<unknown, unknown>;
      if (either.isLeft(maybeEitherValue)) {
        return either.getEq(
          getOptionEitherAwareEq(maybeEitherValue.left),
          eqNever
        );
      } else if (either.isRight(maybeEitherValue)) {
        return either.getEq(
          eqNever,
          getOptionEitherAwareEq(maybeEitherValue.right)
        );
      }
    }

    {
      const maybeOptionValue = value as option.Option<unknown>;
      if (option.isSome(maybeOptionValue)) {
        return option.getEq(getOptionEitherAwareEq(maybeOptionValue.value));
      } else if (option.isNone(maybeOptionValue)) {
        return option.getEq(eqNever);
      }
    }
  }

  return eq.eqStrict;
}

/**
 * Eq that looks at the structure of the compared values and compares the
 * contents of Options and Eithers, rather than the objects themselves.
 *
 * A slower, but more precise {@link eq.eqStrict}.
 */
export const optionEitherAwareEq: eq.Eq<unknown> = {
  equals: (x, y) => {
    if (y === null || y === undefined) {
      return eq.eqStrict.equals(x, y);
    }

    const xEq = getOptionEitherAwareEq(x);

    return xEq.equals(x, y);
  },
};
