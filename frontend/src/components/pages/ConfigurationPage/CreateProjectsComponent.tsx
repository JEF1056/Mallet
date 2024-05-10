import { FileInput, Select, Table } from "react-daisyui";
import Papa from "papaparse";
import { useRecoilState } from "recoil";
import { createProjectsComponentState } from "../../../atoms";

export default function CreateProjectsComponent() {
  const [projects, setProjects] = useRecoilState(createProjectsComponentState);

  return (
    <>
      <FileInput
        className="w-full lg:w-auto"
        accept=".csv"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            Papa.parse(event.target.files[0], {
              header: true,
              skipEmptyLines: true,
              complete: (result: any) => {
                setProjects((project) => ({
                  ...project,
                  inputData: result.data,
                }));
                console.log(result.data);
              },
            });
          }
        }}
      />

      {projects.inputData && (
        <div className="overflow-x-auto pt-4">
          <Table className="bg-base-300">
            <Table.Head>
              <span></span>
              {...Object.keys(projects.inputData[0] || {}).map((key) => (
                <span className="text-md">
                  {key.length > 100 ? key.substring(0, 50) + "..." : key}
                </span>
              ))}
            </Table.Head>

            <Table.Head>
              <span>Select field:</span>
              {...Object.keys(projects.inputData[0] || {}).map((key) => (
                <Select
                  // Invert keys and values, then get by the current key
                  value={projects.existingKeyMapping[key] || "none"}
                  onChange={(event) => {
                    console.log(projects);
                    setProjects((project) => ({
                      ...project,
                      existingKeyMapping: {
                        ...project.existingKeyMapping,
                        [project.projectArgsMapping[event.currentTarget.value]]:
                          undefined,
                        [key]: event.currentTarget.value,
                      },
                      projectArgsMapping: {
                        ...project.projectArgsMapping,
                        [project.existingKeyMapping[key]]: undefined,
                        [event.currentTarget.value]: key,
                      },
                    }));
                  }}
                >
                  <Select.Option value={"none"}>None</Select.Option>
                  {["categoryIds", "name", "url", "description"].map((key) => (
                    <Select.Option value={key}>{key}</Select.Option>
                  ))}
                </Select>
              ))}
            </Table.Head>

            <Table.Body>
              {projects.inputData.map((project, index) => (
                <Table.Row key={index}>
                  <span>{index + 1}</span>
                  {...Object.values(project).map((value, index) => (
                    // Only display first 100 characrers of value and end with ... if value is longer than 50 characters.
                    // If value is a url, wrap in <a> tag
                    // Do not cut off urls
                    <span key={index}>
                      {value.length > 100
                        ? value.substring(0, 100) + "..."
                        : value}
                    </span>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </>
  );
}
