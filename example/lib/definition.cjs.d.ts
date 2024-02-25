export type ExampleDefinition = {
    title: string;
    description?: string;
    run: () => Promise<void>;
};
export default function example(def: ExampleDefinition): Required<ExampleDefinition>;
