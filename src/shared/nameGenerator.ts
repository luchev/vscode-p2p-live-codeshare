import * as random from "unique-names-generator";

export const generateName = (seed: string) => {
  return random.uniqueNamesGenerator({
    dictionaries: [random.colors, random.adjectives, random.animals],
    separator: "-",
    seed: seed,
  });
};
