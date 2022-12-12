import React from 'react';

const FunctionViewer = (props) => {
    const { fn, edit } = props;

    const onEdit = (e) => {
        const newFn = { ...fn };
        newFn.f = e.target.value;
        edit(newFn);
    };

    return (
        <div className="relative bg-secondary p-4 w-full">
            <input
                className="close"
                type="button"
                value="&times;"
                onClick={props.delete}
            />
            <input
                className="text-black w-9/10 px-2 py-1 rounded-md"
                type="text"
                value={fn.f}
                onChange={onEdit}
            />
        </div>
    );
};

export default FunctionViewer;
