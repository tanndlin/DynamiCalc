import Math from 'math-expression-evaluator';

export const evaluate = ({
    input,
    equations,
    vars,
    varMode,
    createNewVar,
    createToast,
    removeToast,
    showToasts
}) => {
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

        if (input.includes('=')) {
            const [key, value] = input.split('=');
            return createVar({
                key,
                value,
                equations,
                vars,
                varMode,
                createNewVar
            });
        }

        input = replaceVars({ input, vars, varMode });
        return Math.eval(input);
    } catch (error) {
        if (!showToasts) {
            return 'ERROR';
        }

        const id = createToast({
            title: 'Error',
            equation: input,
            message: error.message
        });

        setTimeout(() => {
            removeToast(id);
        }, 5000);

        console.log(error);
        return 'ERROR';
    }
};

export const getVarMode = (varMode) => {
    return varMode ? 'static' : 'dynamic';
};

export const replaceVars = ({ input, vars, varMode }) => {
    let newInput = input;
    // Do the largest lenght named vars first
    // This is to prevent replacing a substring of a var

    // Sort vars by length
    const sortedVars = Object.keys(vars[varMode]).sort((a, b) => {
        return b.length - a.length;
    });

    sortedVars.forEach((key) => {
        newInput = newInput.replace(key, `(${vars[varMode][key].value})`);
    });

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
    createNewVar
}) => {
    return createNewVar(
        key,
        evaluate({
            input: replaceVars({ input: value, vars, varMode }),
            equations,
            vars,
            varMode,
            createNewVar
        })
    );
};

export const createVar = ({
    key,
    value,
    equations,
    vars,
    varMode,
    createNewVar
}) => {
    if (getVarMode(varMode) === 'static') {
        return assignStaticVar({
            key,
            value,
            equations,
            vars,
            varMode,
            createNewVar
        });
    }

    // This is a dynamic var
    if (causesCircularReference({ key, value, vars, varMode })) {
        throw new Error('This causes a circular reference');
    }

    return createNewVar(key, value);
};

export const causesCircularReference = ({ key, value, vars, varMode }) => {
    // Check for self reference
    if (value.includes(key)) {
        return true;
    }

    // Use BFS
    const newVars = { ...vars[varMode] };
    newVars[key] = { value };

    const queue = [key];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        visited.add(current);

        // If the var doesn't exist, skip it
        // Only care about vars that are referenced
        if (!newVars[current]) {
            continue;
        }

        const references = newVars[current].value.match(/[A-Z]/g);
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
