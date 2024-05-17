import {
  Badge,
  Button,
  Divider,
  Input,
  Join,
  Table,
  Tooltip,
} from "react-daisyui";
import { useRecoilState, useResetRecoilState } from "recoil";
import { createCategoriesComponentState } from "../../../atoms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationTriangle,
  faLeftLong,
  faPlus,
  faTrash,
  faUndo,
  faUpload,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";

const setCategoriesGql = gql`
  mutation SetCategories($categories: [CategoryInput!]!) {
    setCategories(categories: $categories) {
      id
      name
      description
      global
    }
  }
`;

const deleteCategoryGql = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      id
      name
      description
      global
    }
  }
`;

const getCategoryGql = gql`
  query GetCategory {
    category {
      id
      name
      description
      global
    }
  }
`;

export default function CreateCategoriesComponent() {
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [state, setState] = useRecoilState(createCategoriesComponentState);
  const resetState = useResetRecoilState(createCategoriesComponentState);
  const [setServerCategories] = useMutation(setCategoriesGql); // { data, loading, error }] =
  const [deleteServerCategory] = useMutation(deleteCategoryGql);
  const { loading, error, data, refetch } = useQuery(getCategoryGql, {
    pollInterval: 5000, // Poll every 5 seconds
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // If new data is available, update the local categories
    if (data) {
      setState((existingData) => ({
        ...existingData,
        serverSideCategories: data.category,
      }));
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 rounded-top items-center">
        {/* Header and controls */}
        <label className="flex text-lg px-4 rounded-box bg-base-200 font-bold h-full items-center text-nowrap">
          Categories 🏡
        </label>

        {/* Search bar */}
        <Join className="flex-grow">
          <Input
            className="join-item flex-grow"
            placeholder={"Search categories..."}
            value={newCategoryInput}
            onChange={(event) => setNewCategoryInput(event.currentTarget.value)}
          />
        </Join>

        {/* Create category input section */}
        <Join className="flex-grow">
          <Input
            className="join-item flex-grow"
            placeholder="New global category..."
            value={newCategoryInput}
            onChange={(event) => setNewCategoryInput(event.currentTarget.value)}
          />
          <Button
            disabled={
              // Button is disabled if the category already exists or if the input is empty
              state.localCategories
                .map((category) => category.name)
                .includes(newCategoryInput) ||
              state.serverSideCategories
                .map((category) => category.name)
                .includes(newCategoryInput) ||
              newCategoryInput == ""
            }
            className="join-item"
            onClick={() => {
              // Add the new category to the local categories
              setState((existingData) => ({
                ...existingData,
                localCategories: [
                  ...existingData.localCategories,
                  {
                    name: newCategoryInput,
                    description: "",
                    global: true,
                  },
                ],
              }));
              setNewCategoryInput("");
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Join>

        {/* Reset button */}
        <Tooltip
          message="Reset categories and refetch server data"
          position="left"
        >
          <Button
            color="error"
            disabled={
              // Button is disabled if there are no local or server categories
              state.localCategories.length == 0 &&
              state.serverSideCategories.length == 0
            }
            onClick={async () => {
              resetState();
              const serverResponse = await refetch();
              setState((existingData) => ({
                ...existingData,
                serverSideCategories: serverResponse.data.category,
              }));
            }}
          >
            <FontAwesomeIcon icon={faUndo} />
          </Button>
        </Tooltip>

        {/* Save button */}
        <Tooltip
          message="Upload / update categories on the server"
          position="left"
        >
          <Button
            className="ml-auto"
            color="info"
            disabled={state.localCategories.length == 0} // Button is disabled if there are no local categories
            onClick={async () => {
              // Upload the local categories to the server, then refetch the server data
              await setServerCategories({
                variables: {
                  categories: state.localCategories,
                },
              });
              setState((existingData) => ({
                ...existingData,
                localCategories: [],
              }));
              await refetch();
            }}
          >
            <FontAwesomeIcon icon={faUpload} />
          </Button>
        </Tooltip>
      </div>

      <div className="flex flex-row gap-4">
        {/* Server side info table */}
        <div className="w-full">
          <div className="flex gap-2 items-center">
            <label className="label">Saved Categories</label>
            {error && (
              <Badge className="flex gap-2" color="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} /> Error
                retreiving data: {error.message}
              </Badge>
            )}
          </div>
          <div className="flex flex-col overflow-x-auto no-scrollbar overflow-y-auto h-128 rounded-box w-full">
            <Table pinRows size="sm" className="bg-base-300">
              <Table.Head>
                <span>Name</span>
                <span>ID</span>
                {/* <span>Description</span> */}
                <span>Global?</span>
                <span></span>
              </Table.Head>

              <Table.Body>
                {state.serverSideCategories.map((category) => (
                  <Table.Row>
                    <span>{category.name}</span>
                    <span>{category.id}</span>
                    {/* <span>{category.description}</span> */}
                    <span>
                      {category.global ? (
                        <FontAwesomeIcon icon={faCheck} />
                      ) : (
                        <FontAwesomeIcon icon={faX} />
                      )}
                    </span>
                    <span>
                      {/* Only global categories can be deleted */}
                      {category.global && (
                        <Button
                          size="sm"
                          color="error"
                          onClick={async () => {
                            await deleteServerCategory({
                              variables: {
                                id: category.id,
                              },
                            });
                            await refetch();
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      )}
                    </span>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {/* Handle loading and error states */}
            {loading && state.serverSideCategories.length == 0 && (
              <div className="flex flex-grow w-full justify-center items-center bg-base-300">
                Loading...
              </div>
            )}
          </div>
        </div>

        <Divider horizontal>
          <FontAwesomeIcon icon={faLeftLong} />
        </Divider>

        {/* Local info table */}
        <div className="w-full">
          <label className="label">Unsaved Categories</label>
          <div className="flex flex-col overflow-x-auto no-scrollbar overflow-y-auto h-128 rounded-box w-full">
            <Table pinRows size="sm" className="bg-base-300">
              <Table.Head>
                <span>Name</span>
                {/* <span>Description</span> */}
                <span>Global?</span>
                <span></span>
              </Table.Head>

              <Table.Body>
                {state.localCategories.map((category) => (
                  <Table.Row>
                    <span>{category.name}</span>
                    {/* <span>{category.description}</span> */}
                    <span>
                      {category.global ? (
                        <FontAwesomeIcon icon={faCheck} />
                      ) : (
                        <FontAwesomeIcon icon={faX} />
                      )}
                    </span>
                    <span>
                      {/* Only global categories can be deleted */}
                      {category.global && (
                        <Button
                          size="sm"
                          color="error"
                          onClick={async () => {
                            setState((existingData) => ({
                              ...existingData,
                              localCategories:
                                existingData.localCategories.filter(
                                  (c) => c.name != category.name
                                ),
                            }));
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      )}
                    </span>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {/* Handle empty state */}
            {state.localCategories.length == 0 && (
              <div className="flex flex-grow w-full justify-center items-center bg-base-300">
                No unsaved categores. Add some!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer area */}
      <div className="flex flex-grow justify-between">
        <div className="flex items-center gap-2">
          <Badge color="primary">
            Category Count (Saved): {state.serverSideCategories.length}
          </Badge>
          <Badge color="secondary">
            Category Count (Unsaved): {state.localCategories.length}
          </Badge>
          {(state.localCategories.length > 50 ||
            state.serverSideCategories.length > 50) && (
            <Badge color="warning">
              <FontAwesomeIcon className="pr-1" icon={faExclamationTriangle} />
              This looks like a lot of categories, are you sure this is correct?
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
