import {
  Badge,
  Button,
  Dropdown,
  FileInput,
  Input,
  Join,
  Link,
  Pagination,
  Skeleton,
  Table,
  Toggle,
  Tooltip,
} from "react-daisyui";
import Papa from "papaparse";
import { useRecoilState, useResetRecoilState } from "recoil";
import { createProjectsComponentState } from "../../../atoms";
import { truncate } from "../../../helpers/csv";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faUpload,
  faUndo,
  faCloud,
  faLaptop,
  faX,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useMiniSearch } from "react-minisearch";
import { SearchOptions } from "minisearch";
import { useNavigate } from "react-router-dom";

const createProjectsGql = gql`
  mutation CreateProjects($projects: [ProjectInput!]!) {
    createProjects(projects: $projects) {
      id
      name
      description
      url
      categories {
        id
        name
        description
      }
      assignedJudges {
        profile {
          name
          profilePictureUrl
        }
        id
      }
      beingJudgedBy {
        profile {
          name
          profilePictureUrl
        }
        id
      }
      locationNumber
      noShow
    }
  }
`;

const updateProjectGql = gql`
  mutation UpdateProject($id: ID!, $project: ProjectInput!) {
    updateProject(id: $id, project: $project) {
      id
      name
      description
      url
      categories {
        id
        name
        description
      }
      assignedJudges {
        profile {
          name
          profilePictureUrl
        }
        id
      }
      beingJudgedBy {
        profile {
          name
          profilePictureUrl
        }
        id
      }
      locationNumber
      noShow
    }
  }
`;

// const deleteProjectGql = gql`
//   mutation DeleteProject($id: ID!) {
//     deleteProjectId(id: $id) {
//       id
//       name
//       description
//       global
//     }
//   }
// `;

const getProjectGql = gql`
  query GetProjects($ids: [ID!]) {
    project(ids: $ids) {
      id
      name
      description
      url
      categories {
        id
        name
        description
      }
      assignedJudges {
        profile {
          name
          profilePictureUrl
        }
        id
      }
      beingJudgedBy {
        profile {
          name
          profilePictureUrl
        }
        id
      }
      locationNumber
      noShow
    }
  }
`;

export default function CreateProjectsComponent() {
  const pageSize = 10;
  const selectableColumnTypes = ["Name", "Url", "Categories", "Description"];
  const searchOptions: SearchOptions = {
    boost: { name: 3, locationNumber: 2, categories: 1, description: 1 },
    fuzzy: 0.3,
  };

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [state, setState] = useRecoilState(createProjectsComponentState);
  const resetState = useResetRecoilState(createProjectsComponentState);

  const [searchInput, setSearchInput] = useState("");
  const { search, searchResults, addAll, removeAll } = useMiniSearch(
    state.serverSideProjects,
    {
      fields: [
        "id",
        "name",
        "description",
        "categories",
        "locationNumber",
        "url",
        "assignedJudges",
        "beingJudgedBy",
      ],
      storeFields: [
        "id",
        "name",
        "description",
        "categories",
        "locationNumber",
        "noShow",
        "url",
        "assignedJudges",
        "beingJudgedBy",
      ],
      tokenize: (string) => string.split(/[\s-]+/),
    }
  );

  const [createServerProjects] = useMutation(createProjectsGql);
  const [updateServerProjects] = useMutation(updateProjectGql);
  const { data, refetch } = useQuery(getProjectGql, {
    pollInterval: 1000 * 60, // Poll every minute
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // If new data is available, update list of server-side projects
    if (data) {
      console.log("got projects:", data);
      setState((existingData) => ({
        ...existingData,
        serverSideProjects: data.project,
      }));
      removeAll();
      addAll(data.project);
      search(searchInput, searchOptions);
    }
  }, [data]);

  useEffect(() => {
    // Update state that detects missing columns
    setMissingColumns(
      selectableColumnTypes.filter(
        (columnTypes) => !state.argToColumnName[columnTypes]
      )
    );

    // If input data from csv is available and all selectableColumnTypes have pairs in
    // argToColumnName, update localProjects (input data to server)
    if (
      state.inputData &&
      selectableColumnTypes.every((columnType) =>
        state.argToColumnName.hasOwnProperty(columnType)
      )
    ) {
      // Update local copy of projects
      setState((existingData) => ({
        ...existingData,
        localProjects: state.inputData.map((project: any) => {
          const categories = project[state.argToColumnName["Categories"]!]
            ?.split(",")
            .map((category: string) => category.trim())
            .filter((category: string) => category);

          return {
            name: project[state.argToColumnName["Name"]!],
            url: project[state.argToColumnName["Url"]!],
            // description: project[state.argToColumnName["Description"]!], // Descriptions are currently too large and are optional. If we implement batch uploading in ther future we can add this back.
            categories: categories,
          };
        }),
      }));
    }
  }, [state.argToColumnName, state.inputData]);

  function getProjectRow(project: any, index: number) {
    const columns = [<span>{index + 1 + (state.page - 1) * pageSize}</span>];

    for (const columnName of getOrderedProjectColumnNames()) {
      const value: string = project[columnName];
      const column_mapping_type = state.columnNameToArg[columnName];

      if (column_mapping_type == "Categories") {
        columns.push(
          <span key={columnName} className="flex flex-wrap min-w-96 gap-1">
            {value
              .split(",")
              .filter((category) => category)
              .map((category) => (
                <Badge>{truncate(category, 50, "...")}</Badge>
              ))}
          </span>
        );
      } else if (column_mapping_type == "Url") {
        columns.push(
          <span key={columnName} className="flex flex-wrap min-w-96">
            <Link target="_blank" href={value}>
              {value}
            </Link>
          </span>
        );
      } else if (column_mapping_type == "Description") {
        columns.push(
          <span key={columnName} className="flex flex-wrap w-96">
            {truncate(value, 200, "...")}
          </span>
        );
      } else {
        columns.push(
          <span key={columnName as string}>{truncate(value, 100, "...")}</span>
        );
      }
    }

    return columns;
  }

  function getOrderedProjectColumnNames(): string[] {
    const orderedColumnNames = [];

    for (const columnType of selectableColumnTypes) {
      const columnName = state.argToColumnName[columnType];
      if (columnName) {
        orderedColumnNames.push(columnName);
      }
    }

    for (const columnName of Object.keys(state.inputData[0])) {
      if (!orderedColumnNames.includes(columnName)) {
        orderedColumnNames.push(columnName);
      }
    }

    return orderedColumnNames;
  }

  function getTableData() {
    if (searchInput) {
      if (searchResults == null) {
        return [];
      }
      return searchResults;
    } else {
      return state.serverSideProjects;
    }
  }

  async function refetchAndUpdate() {
    setIsLoading(true);
    const serverResponse = await refetch();
    setState((existingData) => ({
      ...existingData,
      serverSideProjects: serverResponse.data.project,
    }));
    removeAll();
    addAll(serverResponse.data.project);
    search(searchInput, searchOptions);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Input / header bar */}
      <div className="flex flex-row gap-2 rounded-top items-center">
        <label className="flex text-lg px-4 rounded-box bg-base-200 font-bold h-full items-center text-nowrap">
          Projects 📋
        </label>

        {/* Search bar */}
        {state.editingServerData && (
          <Join className="flex-grow">
            <Input
              className="join-item flex-grow"
              placeholder={"Search projects..."}
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                search(event.target.value, searchOptions);
              }}
            />
            <Button
              className="join-item"
              disabled={searchInput == ""}
              onClick={() => {
                setSearchInput("");
              }}
            >
              <FontAwesomeIcon icon={faX} />
            </Button>
          </Join>
        )}

        {/* File input */}
        <FileInput
          className={state.editingServerData ? "flex-shrink" : "flex-grow"}
          accept=".csv"
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              Papa.parse(event.target.files[0], {
                header: true,
                skipEmptyLines: true,
                complete: (result: any) => {
                  // If the new column names differ, reset.
                  // TODO: this does not actually work as expected, analways resets
                  if (
                    state.inputData &&
                    Object.keys(result.data[0]) !=
                      Object.keys(state.inputData[0])
                  ) {
                    console.log(
                      Object.keys(result.data[0]),
                      Object.keys(state.inputData[0])
                    );
                    resetState();
                    refetchAndUpdate();
                  }
                  setState((project) => ({
                    ...project,
                    inputData: result.data,
                    editingServerData: false,
                  }));
                },
              });
            }
          }}
        />

        {/* Toggle for switching between views */}
        <Tooltip
          message={
            state.editingServerData
              ? "Editing server-side data"
              : "Uploading local csv data"
          }
          position="left"
          className="flex flex-row items-center gap-2 px-4 rounded-box bg-base-200 h-full"
        >
          <label className="label">
            <FontAwesomeIcon icon={faLaptop} />
          </label>
          <Toggle
            disabled={
              state.serverSideProjects && state.serverSideProjects.length == 0
            }
            checked={state.editingServerData}
            onClick={() => {
              setState((existingData) => ({
                ...existingData,
                editingServerData: !existingData.editingServerData,
              }));
            }}
          />
          <label className="label">
            <FontAwesomeIcon icon={faCloud} />
          </label>
        </Tooltip>

        {/* Reset button */}
        {((state.inputData && !state.editingServerData) ||
          (state.editingServerData && state.serverSideProjects)) && (
          <Tooltip
            message="Reset local copy of  and refetch server data"
            position="left"
          >
            <Button
              color="error"
              onClick={() => {
                if (!state.serverSideProjects) {
                  resetState();
                } else {
                  setState((existingData) => ({
                    ...existingData,
                    inputData: null,
                    columnNameToArg: {},
                    argToColumnName: {},
                    page: 1,
                    localProjects: [],
                    uniqueCategories: [],
                    editingServerData:
                      existingData.serverSideProjects.length > 0,
                  }));
                }
                refetchAndUpdate();
              }}
            >
              <FontAwesomeIcon icon={faUndo} />
            </Button>
          </Tooltip>
        )}

        {/* Upload button */}
        {state.inputData && !state.editingServerData && (
          <Tooltip
            message="Create / update project and non-global category information on the server"
            position="left"
          >
            <Button
              color="info"
              disabled={missingColumns.length > 0}
              // TODO: Implement upload functionality
              onClick={async () => {
                setState((existingData) => ({
                  ...existingData,
                  editingServerData: true,
                }));

                setIsLoading(true);

                const createdProjects = await createServerProjects({
                  variables: {
                    projects: state.localProjects,
                  },
                });

                console.log("created projects:", createdProjects);

                if (createdProjects.errors) {
                  console.error(createdProjects.errors);
                  return;
                }

                setState((existingData) => ({
                  ...existingData,
                  serverSideProjects: createdProjects.data.createProjects,
                  editingServerData: true,
                }));

                setIsLoading(false);
              }}
            >
              <FontAwesomeIcon icon={faUpload} />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Local upload table */}
      {state.inputData && !state.editingServerData && (
        <>
          <div className="overflow-x-auto no-scrollbar overflow-y-auto h-128 rounded-box">
            <Table pinRows size="sm" className="bg-base-300">
              <Table.Head>
                <span></span>
                {...getOrderedProjectColumnNames().map((key) => (
                  <span className="text-md">{truncate(key, 100, "...")}</span>
                ))}
              </Table.Head>

              <Table.Head>
                <span>Column Type:</span>
                {...getOrderedProjectColumnNames().map((columnName, index) => (
                  <>
                    <Dropdown hover key={index} className="w-52">
                      <Dropdown.Toggle
                        className={
                          state.columnNameToArg[columnName] ? "" : "opacity-50"
                        }
                      >
                        {state.columnNameToArg[columnName] ||
                          "Select Column Type"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-52">
                        {selectableColumnTypes.map((columnType) => (
                          <Dropdown.Item
                            className={
                              state.columnNameToArg[columnName] == columnType
                                ? "bg-secondary text-secondary-content hover:text-neutral-content"
                                : ""
                            }
                            onClick={() => {
                              setState((existingData) => ({
                                ...existingData,
                                columnNameToArg: {
                                  ...existingData.columnNameToArg,
                                  [existingData.argToColumnName[columnType]!]:
                                    undefined,
                                  [columnName]: columnType,
                                },
                                argToColumnName: {
                                  ...existingData.argToColumnName,
                                  [existingData.columnNameToArg[columnName]!]:
                                    undefined,
                                  [columnType]: columnName,
                                },
                              }));

                              if (columnType == "Categories") {
                                const categories: string[] = Array.from(
                                  new Set(
                                    state.inputData.flatMap((row: any) => {
                                      return row[columnName]
                                        ?.split(",")
                                        .map((category: string) =>
                                          category.trim()
                                        )
                                        .filter((category: string) => category);
                                    })
                                  )
                                );

                                setState((existingData) => ({
                                  ...existingData,
                                  uniqueCategories: categories,
                                }));
                              }
                            }}
                          >
                            {columnType}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                ))}
              </Table.Head>

              <Table.Body>
                {state.inputData
                  .slice(
                    state.page * pageSize - pageSize,
                    pageSize * state.page
                  )
                  .map((project: any, index: number) => (
                    <Table.Row hover={true} key={index}>
                      {getProjectRow(project, index)}
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </div>

          <div className="flex flex-grow justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge color="primary">
                Project Count: {state.inputData.length}
              </Badge>
              {missingColumns.length > 0 ? (
                <Badge color="warning">{`Missing columns: ${missingColumns.join(
                  ", "
                )}`}</Badge>
              ) : (
                <Badge color="success">All columns mapped!</Badge>
              )}
            </div>

            {state.inputData.length > pageSize && (
              <Pagination className="bg-base-300 justify-self-end">
                <Button
                  className="join-item"
                  active={state.page != 1}
                  disabled={state.page == 1}
                  onClick={() =>
                    setState((existingData) => ({
                      ...existingData,
                      page: existingData.page - 1,
                    }))
                  }
                >
                  <FontAwesomeIcon icon={faAnglesLeft} />
                </Button>
                <Button className="join-item" disabled>
                  {`Page ${state.page} of ${Math.ceil(
                    state.inputData.length / pageSize
                  )}`}
                </Button>
                <Button
                  className="join-item"
                  active={state.page < state.inputData.length / pageSize}
                  disabled={state.page >= state.inputData.length / pageSize}
                  onClick={() =>
                    setState((existingData) => ({
                      ...existingData,
                      page: existingData.page + 1,
                    }))
                  }
                >
                  <FontAwesomeIcon icon={faAnglesRight} />
                </Button>
              </Pagination>
            )}
          </div>
        </>
      )}

      {/* Server-side data table */}
      {state.editingServerData && state.serverSideProjects && (
        <div className="flex overflow-x-auto no-scrollbar overflow-y-auto h-128 rounded-box flex-col">
          <Table pinRows size="sm" className="bg-base-300">
            <Table.Head>
              <span>Name</span>
              <span>Location Number</span>
              <span>ID</span>
              <span>No Show</span>
              <span>Devpost Url</span>
              <span>Description</span>
              <span>Categories</span>
              <span>Assigned Judges</span>
              <span>Being Judged By</span>
              <span></span>
            </Table.Head>

            {!isLoading &&
              getTableData().map((project, index: number) => (
                <Table.Row hover={true} key={index}>
                  <span onClick={() => navigate(`/project/${project.id}`)}>
                    {project.name}
                  </span>
                  <span>
                    {project.locationNumber ? project.locationNumber : "-"}
                  </span>
                  <span onClick={() => navigate(`/project/${project.id}`)}>
                    {project.id}
                  </span>
                  <span>
                    <Toggle
                      checked={project.noShow}
                      onChange={async () => {
                        const updatedProject = await updateServerProjects({
                          variables: {
                            id: project.id,
                            project: {
                              noShow: !project.noShow,
                            },
                          },
                        });

                        if (updatedProject.errors) {
                          console.error(updatedProject.errors);
                          return;
                        }

                        setState((existingData) => ({
                          ...existingData,
                          serverSideProjects:
                            existingData.serverSideProjects.map(
                              (serverProject: any) =>
                                serverProject.id == project.id
                                  ? updatedProject.data.updateProject
                                  : serverProject
                            ),
                        }));
                      }}
                    />
                  </span>
                  <span>
                    {project.url ? (
                      <Link target="_blank" href={project.url}>
                        {project.url}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </span>
                  <span>{project.description ? project.description : "-"}</span>
                  <span className="flex flex-wrap min-w-96 gap-1">
                    {project.categories.map((category: any) => (
                      <Badge>{truncate(category.name, 50, "...")}</Badge>
                    ))}
                  </span>
                  <span className="flex flex-wrap min-w-96 gap-1">
                    {project.assignedJudges.length
                      ? project.assignedJudges.map((judge: any) => (
                          <Badge>{judge.profile.name}</Badge>
                        ))
                      : "No judges assigned"}
                  </span>
                  <span className="flex flex-wrap min-w-96 gap-1">
                    {project.beingJudgedBy.map((judge: any) => (
                      <Badge>{judge.profile.name}</Badge>
                    ))}
                  </span>
                  <span>
                    <Button color="error">
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </span>
                </Table.Row>
              ))}
          </Table>

          {isLoading && (
            <Skeleton className="flex flex-grow flex-col w-full rounded-t-none" />
          )}

          {searchInput && searchResults && searchResults.length == 0 && (
            <div className="flex flex-grow w-full justify-center items-center bg-base-300">
              No results found for "{searchInput}". Try a different search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
