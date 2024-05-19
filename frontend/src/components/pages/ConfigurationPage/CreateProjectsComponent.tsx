import {
  Badge,
  Button,
  Dropdown,
  FileInput,
  Input,
  Join,
  Link,
  Pagination,
  Table,
  Toggle,
  Tooltip,
} from "react-daisyui";
import Papa from "papaparse";
import { useRecoilState, useResetRecoilState } from "recoil";
import {
  createCategoriesComponentState,
  createProjectsComponentState,
} from "../../../atoms";
import { truncate } from "../../../helpers/csv";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faUpload,
  faUndo,
  faTriangleExclamation,
  faCloud,
  faLaptop,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { gql, useQuery } from "@apollo/client";
// import { useMiniSearch } from "react-minisearch";

// const setProjectsGql = gql`
//   mutation SetProjects($projects: [ProjectInput!]!) {
//     setProjects(projects: $projects) {
//       id
//       name
//       description
//       url
//       locationNumber
//       categories {
//         id
//         name
//         description
//       }
//     }
//   }
// `;

// const deleteProjectGql = gql`
//   mutation DeleteCategory($id: ID!) {
//     deleteCategory(id: $id) {
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

  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [projects, setProjects] = useRecoilState(createProjectsComponentState);
  const [categories, setCategories] = useRecoilState(
    createCategoriesComponentState
  );
  const resetProjects = useResetRecoilState(createProjectsComponentState);
  const allCategoriesAreUploaded = projects.uniqueCategories.every((name) =>
    categories.serverSideCategories
      .map((category) => category.name)
      .includes(name)
  );

  const [searchInput, setSearchInput] = useState("");
  //   const { search, searchResults, addAll, removeAll } = useMiniSearch(
  //     projects.serverSideProjects,
  //     {
  //       fields: ["name", "description", "id"],
  //       storeFields: ["name", "description", "id", "global"],
  //       tokenize: (string) => string.split(/[\s-]+/),
  //     }
  //   );

  const { data, refetch } = useQuery(getProjectGql, {
    pollInterval: 1000 * 60, // Poll every minute
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // If new data is available, update list of server-side projects
    if (data) {
      console.log("got projects:", data);
      setProjects((existingData) => ({
        ...existingData,
        serverSideProjects: data.project,
      }));
      //   removeAll();
      //   addAll(data.category);
      //   search(searchInput, searchOptions);
    }
  }, [data]);

  useEffect(() => {
    // Update state that detects missing columns
    setMissingColumns(
      selectableColumnTypes.filter(
        (columnTypes) => !projects.argToColumnName[columnTypes]
      )
    );

    // If input data from csv is available and all selectableColumnTypes have pairs in
    // argToColumnName, update localProjects (input data to server)
    if (
      projects.inputData &&
      selectableColumnTypes.every((columnType) =>
        projects.argToColumnName.hasOwnProperty(columnType)
      )
    ) {
      // Update local copy of projects
      setProjects((existingData) => ({
        ...existingData,
        localProjects: projects.inputData.map((project: any) => {
          const categories = project[projects.argToColumnName["Categories"]!]
            ?.split(",")
            .map((category: string) => category.trim())
            .filter((category: string) => category);

          return {
            name: project[projects.argToColumnName["Name"]!],
            url: project[projects.argToColumnName["Url"]!],
            description: project[projects.argToColumnName["Description"]!],
            categories: categories,
          };
        }),
      }));
    }
  }, [projects.argToColumnName, projects.inputData]);

  function getProjectRow(project: any, index: number) {
    const columns = [<span>{index + 1 + (projects.page - 1) * pageSize}</span>];

    for (const columnName of getOrderedProjectColumnNames()) {
      const value: string = project[columnName];
      const column_mapping_type = projects.columnNameToArg[columnName];

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
      const columnName = projects.argToColumnName[columnType];
      if (columnName) {
        orderedColumnNames.push(columnName);
      }
    }

    for (const columnName of Object.keys(projects.inputData[0])) {
      if (!orderedColumnNames.includes(columnName)) {
        orderedColumnNames.push(columnName);
      }
    }

    return orderedColumnNames;
  }

  async function refetchAndUpdate() {
    const serverResponse = await refetch();
    setProjects((existingData) => ({
      ...existingData,
      serverSideProjects: serverResponse.data.project,
    }));
    // removeAll();
    // addAll(serverResponse.data.category);
    // search(searchInput, searchOptions);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Input / header bar */}
      <div className="flex flex-row gap-2 rounded-top items-center">
        <label className="flex text-lg px-4 rounded-box bg-base-200 font-bold h-full items-center text-nowrap">
          Projects 📋
        </label>

        {/* Search bar */}
        {projects.editingServerData && (
          <Join className="flex-grow">
            <Input
              className="join-item flex-grow"
              placeholder={"Search projects..."}
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                //   search(event.target.value, searchOptions);
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
          className={projects.editingServerData ? "flex-shrink" : "flex-grow"}
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
                    projects.inputData &&
                    Object.keys(result.data[0]) !=
                      Object.keys(projects.inputData[0])
                  ) {
                    console.log(
                      Object.keys(result.data[0]),
                      Object.keys(projects.inputData[0])
                    );
                    resetProjects();
                    refetchAndUpdate();
                  }
                  setProjects((project) => ({
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
            projects.editingServerData
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
            // disabled={projects.serverSideProjects.length == 0}
            checked={projects.editingServerData}
            onClick={() => {
              setProjects((existingData) => ({
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
        {((projects.inputData && !projects.editingServerData) ||
          (projects.editingServerData && projects.serverSideProjects)) && (
          <Tooltip
            message="Reset local copy of  and refetch server data"
            position="left"
          >
            <Button
              color="error"
              onClick={() => {
                if (!projects.serverSideProjects) {
                  resetProjects();
                }
                refetchAndUpdate();
              }}
            >
              <FontAwesomeIcon icon={faUndo} />
            </Button>
          </Tooltip>
        )}

        {/* Upload button */}
        {projects.inputData && !projects.editingServerData && (
          <Tooltip
            message="Create / update project and non-global category information on the server"
            position="left"
          >
            <Button
              color="info"
              disabled={missingColumns.length > 0 || !allCategoriesAreUploaded}
              // TODO: Implement upload functionality
              onClick={() => {
                console.log(projects.localProjects);
                setProjects((existingData) => ({
                  ...existingData,
                  editingServerData: true,
                }));
              }}
            >
              <FontAwesomeIcon icon={faUpload} />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Local upload table */}
      {projects.inputData && !projects.editingServerData && (
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
                          projects.columnNameToArg[columnName]
                            ? ""
                            : "opacity-50"
                        }
                      >
                        {projects.columnNameToArg[columnName] ||
                          "Select Column Type"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-52">
                        {selectableColumnTypes.map((columnType) => (
                          <Dropdown.Item
                            className={
                              projects.columnNameToArg[columnName] == columnType
                                ? "bg-secondary text-secondary-content hover:text-neutral-content"
                                : ""
                            }
                            onClick={() => {
                              setProjects((existingData) => ({
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
                                    projects.inputData.flatMap((row: any) => {
                                      return row[columnName]
                                        ?.split(",")
                                        .map((category: string) =>
                                          category.trim()
                                        )
                                        .filter((category: string) => category);
                                    })
                                  )
                                );

                                setProjects((existingData) => ({
                                  ...existingData,
                                  uniqueCategories: categories,
                                }));

                                setCategories((existingData) => {
                                  const globalCategories =
                                    existingData.localCategories.filter(
                                      (category) => category.global
                                    );

                                  return {
                                    ...existingData,
                                    localCategories: [
                                      ...categories.map((category) => ({
                                        name: category,
                                        global: false,
                                      })),
                                      ...globalCategories,
                                    ].sort((a, b) =>
                                      a.name.localeCompare(b.name)
                                    ),
                                  };
                                });
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
                {projects.inputData
                  .slice(
                    projects.page * pageSize - pageSize,
                    pageSize * projects.page
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
                Project Count: {projects.inputData.length}
              </Badge>
              {!allCategoriesAreUploaded && (
                <Badge color="warning">
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="pr-1"
                  />{" "}
                  Project categories do not match server-side categories
                </Badge>
              )}
              {missingColumns.length > 0 ? (
                <Badge color="warning">{`Missing columns: ${missingColumns.join(
                  ", "
                )}`}</Badge>
              ) : (
                <Badge color="success">All columns mapped!</Badge>
              )}
            </div>

            {projects.inputData.length > pageSize && (
              <Pagination className="bg-base-300 justify-self-end">
                <Button
                  className="join-item"
                  active={projects.page != 1}
                  disabled={projects.page == 1}
                  onClick={() =>
                    setProjects((existingData) => ({
                      ...existingData,
                      page: existingData.page - 1,
                    }))
                  }
                >
                  <FontAwesomeIcon icon={faAnglesLeft} />
                </Button>
                <Button className="join-item" disabled>
                  {`Page ${projects.page} of ${Math.ceil(
                    projects.inputData.length / pageSize
                  )}`}
                </Button>
                <Button
                  className="join-item"
                  active={projects.page < projects.inputData.length / pageSize}
                  disabled={
                    projects.page >= projects.inputData.length / pageSize
                  }
                  onClick={() =>
                    setProjects((existingData) => ({
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
      {projects.editingServerData && projects.serverSideProjects && (
        <div className="overflow-x-auto no-scrollbar overflow-y-auto h-128 rounded-box">
          <Table pinRows size="sm" className="bg-base-300">
            <Table.Head>
              <span>Name</span>
              <span>Location Number</span>
              <span>No Show</span>
              <span>Devpost Url</span>
              <span>Description</span>
              <span>Categories</span>
              <span>Assigned Judges</span>
              <span>Being Judged By</span>
            </Table.Head>

            {projects.serverSideProjects.map((project, index: number) => (
              <Table.Row hover={true} key={index}>
                <span>{project.name}</span>
                <span>
                  {project.locationNumber ? project.locationNumber : "-"}
                </span>
                <span>
                  <Toggle checked={project.noShow} />
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
                    <Badge>{category.name}</Badge>
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
              </Table.Row>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
