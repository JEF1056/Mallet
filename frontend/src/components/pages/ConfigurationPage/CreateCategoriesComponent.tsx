import { Badge, Button, Input, Join, Pagination, Table } from "react-daisyui";
import { useRecoilState } from "recoil";
import { createCategoriesComponentState } from "../../../atoms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faCheck,
  faPlus,
  faTrash,
  faUpload,
  faX,
} from "@fortawesome/free-solid-svg-icons";

export default function CreateCategoriesComponent() {
  const pageSize = 20;
  const [categories, setCategories] = useRecoilState(
    createCategoriesComponentState
  );
  //   const resetCategories = useResetRecoilState(createCategoriesComponentState);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 rounded-top items-center">
        <label className="flex text-lg px-4 rounded-box bg-base-200 font-bold h-full items-center text-nowrap">
          Categories 🏡
        </label>
        <Join className="flex-grow">
          <Input
            className="join-item flex-grow"
            placeholder="New category..."
          />
          <Button className="join-item">
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Join>
        <Button
          className="ml-auto"
          color="info"
          disabled={categories.categories.length == 0}
        >
          <FontAwesomeIcon icon={faUpload} />
        </Button>
      </div>

      <div className="overflow-x-auto no-scrollbar overflow-y-auto h-128 rounded-box">
        <Table pinRows size="sm" className="bg-base-300">
          <Table.Head>
            <span></span>
            <span>Name</span>
            <span>Global?</span>
            <span></span>
          </Table.Head>

          <Table.Body>
            {categories.categories
              .slice(
                categories.page * pageSize - pageSize,
                pageSize * categories.page
              )
              .map((category, index) => (
                <Table.Row>
                  <span>{index + 1 + (categories.page - 1) * pageSize}</span>
                  <span>{category.name}</span>
                  <span>
                    {category.global ? (
                      <FontAwesomeIcon icon={faCheck} />
                    ) : (
                      <FontAwesomeIcon icon={faX} />
                    )}
                  </span>
                  <span>
                    {/* Only global categories can be  */}
                    {category.global && (
                      <Button size="sm" color="error">
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    )}
                  </span>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </div>

      {/* Footer area */}
      <div className="flex flex-grow justify-between">
        <div className="flex items-center gap-2">
          <Badge color="primary">
            Category Count: {categories.categories.length}
          </Badge>
        </div>

        {categories.categories.length > pageSize && (
          <Pagination className="bg-base-300 justify-self-end">
            <Button
              className="join-item"
              active={categories.page != 1}
              disabled={categories.page == 1}
              onClick={() =>
                setCategories((existingData) => ({
                  ...existingData,
                  page: existingData.page - 1,
                }))
              }
            >
              <FontAwesomeIcon icon={faAnglesLeft} />
            </Button>
            <Button className="join-item" disabled>
              {`Page ${categories.page} of ${Math.ceil(
                categories.categories.length / pageSize
              )}`}
            </Button>
            <Button
              className="join-item"
              active={categories.page < categories.categories.length / pageSize}
              disabled={
                categories.page >= categories.categories.length / pageSize
              }
              onClick={() =>
                setCategories((existingData) => ({
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
    </div>
  );
}
