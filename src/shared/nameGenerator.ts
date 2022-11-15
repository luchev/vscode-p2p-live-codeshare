import * as random from "unique-names-generator";

export const toHumanReadableName = (seed: string) => {
  return random.uniqueNamesGenerator({
    dictionaries: [random.colors, random.adjectives, random.animals],
    separator: "-",
    seed: seed,
  });
};
