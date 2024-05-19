import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
import {
  Category,
  CategoryInput,
  Project,
  ProjectInput,
} from "./__generated__/resolvers-types";

const { persistAtom } = recoilPersist();

export const createProjectsComponentState = atom<{
  inputData: any | null;
  columnNameToArg: { [key: string]: string | undefined };
  argToColumnName: { [key: string]: string | undefined };
  page: number;
  serverSideProjects: Project[];
  localProjects: ProjectInput[];
  uniqueCategories: string[];
  editingServerData: boolean;
}>({
  key: "createProjectsComponentState",
  effects_UNSTABLE: [persistAtom],
  default: {
    inputData: null,
    columnNameToArg: {},
    argToColumnName: {},
    page: 1,
    localProjects: [],
    serverSideProjects: [],
    uniqueCategories: [],
    editingServerData: false,
  },
});

export const createCategoriesComponentState = atom<{
  serverSideCategories: Category[];
  localCategories: CategoryInput[];
}>({
  key: "createCategoriesComponentState",
  effects_UNSTABLE: [persistAtom],
  default: {
    serverSideCategories: [],
    localCategories: [],
  },
});
