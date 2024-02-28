import inquirer from 'inquirer';
import colors from 'colors';
import examples from './examples/index.mjs';

async function main() {
    const exampleChoices = examples.map((def) => ({
        name: `${colors.bold(def.title)}: ${def.description}`,
        value: def.run,
    }));

    exampleChoices.push(new inquirer.Separator(), {
        name: 'Exit',
        value: null,
    });

    const exampleEntries = Array.from(exampleChoices.entries());

    let lastValue = null;
    while (true) {
        let defaultSelected = 0;
        if (lastValue) {
            for (const [idx, item] of exampleEntries) {
                if (item?.value === lastValue) {
                    defaultSelected = idx;
                    break;
                }
            }
        }

        const res = await inquirer.prompt([
            {
                name: 'func',
                message: 'Choose an example to run:',
                type: 'list',
                choices: exampleChoices,
                loop: false,
                default: defaultSelected,
            },
        ], []);

        if (!res.func) {
            break;
        }

        await res.func();
        lastValue = res.func;
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
