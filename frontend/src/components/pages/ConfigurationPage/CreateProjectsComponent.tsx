import {
  Badge,
  Button,
  Dropdown,
  FileInput,
  Link,
  Pagination,
  Table,
  Tooltip,
} from "react-daisyui";
import Papa from "papaparse";
import { useRecoilState, useResetRecoilState, useSetRecoilState } from "recoil";
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
} from "@fortawesome/free-solid-svg-icons";

export default function CreateProjectsComponent() {
  const pageSize = 10;
  const selectableColumnTypes = ["Name", "Url", "Categories", "Description"];

  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [projects, setProjects] = useRecoilState(createProjectsComponentState);
  const setCategories = useSetRecoilState(createCategoriesComponentState);
  const resetProjects = useResetRecoilState(createProjectsComponentState);

  useEffect(() => {
    setMissingColumns(
      selectableColumnTypes.filter(
        (columnTypes) => !projects.argToColumnName[columnTypes]
      )
    );
  }, [projects]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 rounded-top items-center">
        <label className="flex text-lg px-4 rounded-box bg-base-200 font-bold h-full items-center text-nowrap">
          Projects 📋
        </label>
        <FileInput
          className="w-full"
          accept=".csv"
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              Papa.parse(event.target.files[0], {
                header: true,
                skipEmptyLines: true,
                complete: (result: any) => {
                  // If the new column names differ, reset.
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
                  }
                  setProjects((project) => ({
                    ...project,
                    inputData: result.data,
                  }));
                },
              });
            }
          }}
        />
        {projects.inputData && (
          <Tooltip message="Reset local copy of projects" position="left">
            <Button color="error" onClick={resetProjects}>
              <FontAwesomeIcon icon={faUndo} />
            </Button>
          </Tooltip>
        )}
        {projects.inputData && (
          <Tooltip
            message="Create / update project and non-global category information on the server"
            position="left"
          >
            <Button color="info" disabled={missingColumns.length > 0}>
              <FontAwesomeIcon icon={faUpload} />
            </Button>
          </Tooltip>
        )}
      </div>

      {projects.inputData && (
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
    </div>
  );
}