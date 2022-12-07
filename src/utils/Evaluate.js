import Math from 'math-expression-evaluator';

export const evaluate = ({ input, equations, vars, varMode, setVars }) => {
    try {
        input = `${input}`.replace(/ /g, '');

        // Replace ans with previous answer
        if (input.includes('ans')) {
            const lastOutput = equations[equations.length - 1]?.output;
            if (lastOutput === undefined) {
                throw new Error('No previous answer');
            }

            input = input.replace('ans', lastOutput);
        }

        if (input.includes('=') && input.indexOf('=') === 1) {
            const [key, value] = input.split('=');
            return createVar({ key, value, equations, vars, varMode, setVars });
        }

        input = replaceVars({ input, vars, varMode });
        return Math.eval(input);
    } catch (error) {
        console.log(error);
        return 'ERROR';
    }
};

export const getVarMode = (varMode) => {
    return varMode ? 'static' : 'dynamic';
};

export const replaceVars = ({ input, vars, varMode }) => {
    let newInput = input;
    for (const key in vars[varMode]) {
        newInput = newInput.replace(key, `(${vars[varMode][key]})`);
    }

    // Recursively evaluate vars
    if (newInput !== input) {
        return replaceVars({ input: newInput, vars, varMode });
    }

    return newInput;
};

export const assignStaticVar = ({
    key,
    value,
    equations,
    vars,
    varMode,
    setVars
}) => {
    vars[varMode][key] = evaluate({
        input: replaceVars({ value, vars, varMode }),
        equations,
        vars,
        varMode,
        setVars
    });
    setVars({ ...vars });
    return vars[varMode][key];
};

export const createVar = ({
    key,
    value,
    equations,
    vars,
    varMode,
    setVars
}) => {
    if (getVarMode(varMode) === 'static') {
        return assignStaticVar({
            key,
            value,
            equations,
            vars,
            varMode,
            setVars
        });
    }

    // This is a dynamic var
    if (causesCircularReference({ key, value, vars, varMode })) {
        throw new Error('This causes a circular reference');
    }

    vars[varMode][key] = value;

    setVars({ ...vars });
    return vars[varMode][key];
};

export const causesCircularReference = ({ key, value, vars, varMode }) => {
    // Check for self reference
    if (value.includes(key[0])) {
        return true;
    }

    // Use BFS
    const newVars = { ...vars[varMode] };
    newVars[key] = value;

    const queue = [key];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        visited.add(current);

        const references = newVars[current].match(/[a-zA-Z]/g);
        if (!references) {
            continue;
        }

        for (const reference of references) {
            if (reference === key) {
                return true;
            }

            if (!visited.has(reference)) {
                queue.push(reference);
            }
        }
    }

    return false;
};
