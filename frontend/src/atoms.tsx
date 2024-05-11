import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
import { MutationSetProjectsArgs } from "./__generated__/resolvers-types";

const { persistAtom } = recoilPersist();

export const createProjectsComponentState = atom<{
  inputData: any | null;
  columnNameToArg: { [key: string]: string | undefined };
  argToColumnName: { [key: string]: string | undefined };
  page: number;
  gqlInputs: MutationSetProjectsArgs;
}>({
  key: "createProjectsComponentState",
  effects_UNSTABLE: [persistAtom],
  default: {
    inputData: null,
    columnNameToArg: {},
    argToColumnName: {},
    page: 1,
    gqlInputs: {
      projects: [],
    },
  },
});

export const createCategoriesComponentState = atom<{
  parsedCategories: string[];
  customCategories: string[];
}>({
  key: "createCategoriesComponentState",
  default: {
    parsedCategories: [],
    customCategories: [],
  },
});
