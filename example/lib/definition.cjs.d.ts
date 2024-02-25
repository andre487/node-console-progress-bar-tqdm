export type ExampleDefinition = {
    title: string;
    description?: string;
    tags?: string[],
    run: () => Promise<void>;
};
export default function example(def: ExampleDefinition): Required<ExampleDefinition>;
