import { Button } from "react-daisyui";

interface NoMobileComponentProps {
  ignoreSetter: (value: boolean) => void;
}

export default function NoMobileComponent(props: NoMobileComponentProps) {
  return (
    <div className="flex flex-col w-full flex-grow bg-neutral rounded-box p-10 justify-center items-center gap-10">
      <article className="prose">
        <h2>Hey there! Looks like you're on a mobile device.</h2>
        <p>
          This page was built for desktop viewing and might not be the best
          exerience on a mobile device.
        </p>
      </article>
      <Button onClick={() => props.ignoreSetter(true)}>Continue anyway</Button>
    </div>
  );
}
