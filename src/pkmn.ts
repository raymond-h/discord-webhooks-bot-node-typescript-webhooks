import assert from 'assert';
import _ from 'lodash';
import got from 'got';
import Pokedex from 'pokedex-promise-v2';
import toArray from 'it-all';
import nearestString from 'nearest-string';
import { WebhookRequest, WebhookResponseEntry } from './interfaces.js';

const P = new Pokedex();

async function* pokemonSpeciesGenerator() {
  let nextUri = 'api/v2/pokemon?limit=1000';
  while (nextUri != null) {
    const res = await P.resource(nextUri);
    nextUri = res.next;
    for (const result of res.results) {
      yield result.name as string;
    }
  }
}

async function getTypeOfPokemon(pokemonName: string) {
  console.log(pokemonName);
  const pkmn = await P.getPokemonByName(pokemonName);
  assert(!(pkmn instanceof Array));
  return pkmn.types.map((type) => type.type.name);
}

function handleExceptions<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (e) {
      return {
        message: '```\n' + (e instanceof Error ? e.stack : e) + '\n```',
      };
    }
  };
}

function matcher<R>(
  predsAndFns: [RegExp, (full: string, group1: string, group2: string) => R][],
  str: string
) {
  for (const [pred, fn] of predsAndFns) {
    const res = pred.exec(str);
    if (res == null) {
      continue;
    }
    return fn(res[0], res[1], res[2]);
  }
  return null;
}

const multiply = (a: number, b: number) => a * b;

const explainingFactorText = (factor: string) => {
  const parsedFactor = parseFloat(factor);
  if (parsedFactor === 0) return 'immune';
  if (parsedFactor < 1) return 'not very effective';
  if (parsedFactor > 1) return 'super effective';
  return 'normal effective';
};

interface PokemonTypeChartData {
  name: string;
  immunes: string[];
  weaknesses: string[];
  strengths: string[];
}

type TypeData = Record<string, Record<string, number>>;

function tuple<T extends unknown[]>(...args: T) {
  return args;
}

export async function initializePkmn() {
  const mons = await toArray(pokemonSpeciesGenerator());
  console.log(mons);

  const fetchedTypeData: PokemonTypeChartData[] = await got(
    'https://raw.githubusercontent.com/filipekiss/pokemon-type-chart/master/types.json'
  ).json();
  const typeData: TypeData = {};
  for (const type of fetchedTypeData) {
    for (const otherTypeName of type.immunes) {
      _.set(
        typeData,
        [type.name.toLowerCase(), otherTypeName.toLowerCase()],
        0
      );
    }
    for (const otherTypeName of type.weaknesses) {
      _.set(
        typeData,
        [type.name.toLowerCase(), otherTypeName.toLowerCase()],
        0.5
      );
    }
    for (const otherTypeName of type.strengths) {
      _.set(
        typeData,
        [type.name.toLowerCase(), otherTypeName.toLowerCase()],
        2
      );
    }
  }
  const types = _.keys(typeData);
  const defaultData = _.fromPairs(types.map((t) => [t, 1]));
  const weaknessTypeData = _.chain(typeData)
    .toPairs()
    .flatMap((p) =>
      _.chain(p[1])
        .toPairs()
        .map((pInner) => tuple(pInner[0], tuple(p[0], pInner[1])))
        .value()
    )
    .groupBy((t) => t[0])
    .mapValues((ts) => _.fromPairs(ts.map((t) => t[1])))
    .value();
  const effectivenessTypeData = typeData;

  function getDefensiveTypeEffectiveness(type1: string, type2: string | null) {
    let pairs = _.toPairs(weaknessTypeData[type1]);
    if (type2 != null) {
      pairs = _.concat(pairs, _.toPairs(weaknessTypeData[type2]));
    }
    //console.log(pairs);
    return _.chain(pairs)
      .groupBy((p) => p[0])
      .mapValues((ps) => ps.map((p) => p[1]).reduce(multiply))
      .thru((f) => _.assign({}, defaultData, f))
      .value();
  }

  const groupedDefTypeEffectiveness = (type1: string, type2: string | null) =>
    _.chain(getDefensiveTypeEffectiveness(type1, type2))
      .toPairs()
      .groupBy((p) => p[1])
      .mapValues((ps) => ps.map((p) => p[0]))
      .value();

  function getOffensiveTypeEffectiveness(type1: string) {
    let pairs = _.toPairs(effectivenessTypeData[type1]);
    return _.chain(pairs)
      .groupBy((p) => p[0])
      .mapValues((ps) => ps.map((p) => p[1]).reduce(multiply))
      .thru((f) => _.assign({}, defaultData, f))
      .value();
  }

  const groupedOffensiveTypeEffectiveness = (type1: string) =>
    _.chain(getOffensiveTypeEffectiveness(type1))
      .toPairs()
      .groupBy((p) => p[1])
      .mapValues((ps) => ps.map((p) => p[0]))
      .value();

  return handleExceptions(async (body: WebhookRequest) => {
    return matcher<Promise<WebhookResponseEntry[] | WebhookResponseEntry>>(
      [
        [
          /^w(?:eakness(?:es)?)? ([\w\-]+)\s*(\w+)?$/,
          async (full: unknown, type1: string, type2?: string) => {
            const messages: WebhookResponseEntry[] = [];
            if (type2 == null) {
              const nsRes = nearestString(
                ([] as string[]).concat(mons, types),
                type1.toLowerCase()
              );
              if (nsRes.distance <= 3) {
                if (types.includes(nsRes.value)) {
                  type1 = nsRes.value;
                } else if (mons.includes(nsRes.value)) {
                  const types = await getTypeOfPokemon(nsRes.value);
                  type1 = types[0];
                  type2 = types[1];
                  messages.push({
                    message: `**${_.startCase(nsRes.value)}** (${types
                      .map((t: string) => '`' + t + '`')
                      .join(
                        '-'
                      )}) weaknesses (excluding abilities and other factors):`,
                  });
                }
              }
            }

            const factors = groupedDefTypeEffectiveness(
              type1.toLowerCase(),
              type2 != null ? type2.toLowerCase() : null
            );
            const res = ([] as WebhookResponseEntry[]).concat(
              messages,
              _.chain(factors)
                .toPairs()
                .map(([factor, types]) => ({
                  message: `**${_.startCase(
                    explainingFactorText(factor)
                  )} (${factor}x)**: ${types
                    .map((t: string) => '`' + t + '`')
                    .join(', ')}`,
                }))
                .value()
            );
            return res;
          },
        ],
        [
          /^[e(?:ffective(?:ness)?)?|c(?:overage)?] (\w+)\s*$/,
          async (full: unknown, type1: string) => {
            const factors = groupedOffensiveTypeEffectiveness(
              type1.toLowerCase()
            );
            return _.chain(factors)
              .toPairs()
              .map(([factor, types]) => ({
                message: `**${_.startCase(
                  explainingFactorText(factor)
                )} (${factor}x)**: ${types
                  .map((t: string) => '`' + t + '`')
                  .join(', ')}`,
              }))
              .value();
          },
        ],
        [
          /.*/,
          async () => {
            return { message: `No such command \`${body.arguments}\`` };
          },
        ],
      ],
      body.arguments
    );
  });
}

//console.log(getDefensiveTypeEffectiveness('fire'))
//groupedOffensiveTypeEffectiveness('fire')
