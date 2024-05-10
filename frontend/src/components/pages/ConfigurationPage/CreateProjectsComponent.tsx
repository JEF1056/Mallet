import { Dropdown, FileInput, Select, Table } from "react-daisyui";
import Papa from "papaparse";
import { useState } from "react";

export default function CreateProjectsComponent() {
  // Projects is an array of objects
  const [projects, setProjects] = useState<Array<{ [key: string]: string }>>(
    []
  );

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
                setProjects(result.data);
                console.log(result.data);
              },
            });
          }
        }}
      />

      <div className="overflow-x-auto pt-4">
        <Table className="bg-base-300">
          <Table.Head>
            <span></span>
            {...Object.keys(projects[0] || {}).map((key) => (
              <span className="text-md">
                {key.length > 100 ? key.substring(0, 50) + "..." : key}
              </span>
            ))}
          </Table.Head>

          <Table.Head>
            <span>Select field:</span>
            {...Object.keys(projects[0] || {}).map((key) => (
              <Select value={"default"} onChange={(event) => {}}>
                <Select.Option value={"default"} disabled>
                  None
                </Select.Option>
                <Select.Option value={"Homer"}>Homer</Select.Option>
              </Select>
            ))}
          </Table.Head>

          <Table.Body>
            {projects.map((project, index) => (
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
    </>
  );
}
