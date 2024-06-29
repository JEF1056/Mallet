import { Button, Card, Input } from "react-daisyui";
import { loginState } from "../../../atoms";
import { useRecoilState } from "recoil";
import { useEffect } from "react";

export default function LoginPage() {
  const [state, setState] = useRecoilState(loginState);

  useEffect(() => {
    setState({ username: "test", bearer: "" });
  }, [setState]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Card className="bg-neutral px-4 py-2">
        <Card.Body className="items-center text-center">
          <Card.Title tag="h1">Login</Card.Title>
          <div className="flex py-2 gap-2 flex-col">
            <Input
              placeholder="Username"
              value={state.username}
              onChange={(value) =>
                setState((existingData) => ({
                  ...existingData,
                  username: value.currentTarget.value,
                }))
              }
            />
            <Input placeholder="Password" type="password" />
          </div>
          <Card.Actions className="justify-end">
            <Button color="primary">Login</Button>
          </Card.Actions>
        </Card.Body>
      </Card>
    </div>
  );
}
