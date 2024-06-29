import { useApolloClient } from "@apollo/client";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Badge, Button, Dropdown, Navbar } from "react-daisyui";
import { useNavigate } from "react-router-dom";

export default function NavBarComponent() {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  return (
    <Navbar className="rounded-box bg-base-300">
      <div className="flex-1">
        <Button
          tag="a"
          className="text-xl normal-case"
          color="ghost"
          onClick={() => navigate("/")}
        >
          🔨 Mallet
          <Badge size="xs" color={apolloClient ? "success" : "error"} />
        </Button>
      </div>
      <div className="flex-none gap-2">
        <Button
          tag="label"
          tabIndex={0}
          color="ghost"
          className="avatar"
          shape="circle"
          onClick={() => navigate("/configuration")}
        >
          <FontAwesomeIcon icon={faGear} size="lg" />
        </Button>
        <Dropdown end>
          <Button
            tag="label"
            tabIndex={0}
            color="ghost"
            className="avatar"
            shape="circle"
          >
            <Avatar
              shape="circle"
              size="xs"
              letters="😂"
              className="text-2xl"
            />
          </Button>
          <Dropdown.Menu className="w-52 menu-sm mt-3 z-[1] p-2">
            <Dropdown.Item>Profile</Dropdown.Item>
            <Dropdown.Item>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </Navbar>
  );
}
