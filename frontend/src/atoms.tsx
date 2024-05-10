import { atom } from "recoil";
import {
  MutationSetProjectsArgs,
  ProjectInput,
} from "./__generated__/resolvers-types";

export const createProjectsComponentState = atom<{
  inputData: any;
  projectArgsMapping: {
    [K in keyof ProjectInput]?: string;
  };
  existingKeyMapping: { [key: string]: string };
  gqlInputs: MutationSetProjectsArgs;
}>({
  key: "createProjectsComponentState",
  default: {
    inputData: null,
    projectArgsMapping: {},
    existingKeyMapping: {},
    gqlInputs: {
      projects: [],
    },
  },
});
